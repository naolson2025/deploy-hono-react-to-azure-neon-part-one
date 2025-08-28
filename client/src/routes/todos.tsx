import { createFileRoute, useRouter } from '@tanstack/react-router'
import { hc } from 'hono/client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CircleX, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '../lib/auth-client'
import type { AppType } from '../../../server/index'

const client = hc<AppType>('/')

export const Route = createFileRoute('/todos')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [createTodoError, setCreateTodoError] = useState<string | null>(null)
  const [deleteTodoError, setDeleteTodoError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingUpdateId, setPendingUpdateId] = useState<string | null>(null)
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  if (!session) {
    router.navigate({ to: '/signin' })
    return null
  }

  const createTodo = useMutation({
    mutationFn: async () => {
      if (title.trim()) {
        const resp = await client.api.todos.$post({
          json: { title: title.trim(), description: description.trim() },
        })
        if (!resp.ok) throw new Error('Failed to save todo')
        return resp.json()
      } else {
        throw new Error('Title is required')
      }
    },
    onSuccess: () => {
      // clear title & description
      setTitle('')
      setDescription('')
      setCreateTodoError(null)

      // refetch todos
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError: (err) => {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to create todo. Please try again.'
      setCreateTodoError(message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTodo.mutate()
  }

  const deleteTodo = useMutation({
    mutationFn: async (todoId: string) => {
      const resp = await client.api.todos[':id'].$delete({
        param: { id: todoId },
      })
      if (!resp.ok) throw new Error('Failed to delete todo')
      return resp.json()
    },
    onMutate: (todoId: string) => {
      setPendingDeleteId(todoId)
    },
    onError: (err) => {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to delete todo. Please try again.'
      setDeleteTodoError(message)
    },
    onSuccess: () => {
      setDeleteTodoError(null)
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onSettled: () => {
      setPendingDeleteId(null)
    },
  })

  type UpdateTodo = {
    todoId: string
    title?: string
    description?: string
    completed?: boolean
  }

  const updateTodo = useMutation({
    mutationFn: async (d: UpdateTodo) => {
      const resp = await client.api.todos[':id'].$patch({
        param: { id: d.todoId },
        json: {
          title: d.title,
          description: d.description,
          completed: d.completed,
        },
      })
      if (!resp.ok) throw new Error('Failed to update todo')
      return resp.json()
    },
    onMutate: (d: UpdateTodo) => {
      setPendingUpdateId(d.todoId)
      setUpdateErrors((prev) => {
        const { [d.todoId]: _removed, ...rest } = prev
        return rest
      })
    },
    onError: (err, variables) => {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to update todo. Please try again.'
      const id = variables.todoId
      setUpdateErrors((prev) => ({ ...prev, [id]: message }))
    },
    onSuccess: (_data, variables) => {
      const id = variables.todoId
      setUpdateErrors((prev) => {
        const { [id]: _removed, ...rest } = prev
        return rest
      })
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onSettled: () => {
      setPendingUpdateId(null)
    },
  })

  const { data, isError, error, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const resp = await client.api.todos.$get()
      if (!resp.ok) throw new Error('Failed to fetch todos')
      return resp.json()
    },
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex-grow">
      {/* Create Todo Form */}
      <div className="bg-base-300 shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Todo</h2>

        {createTodoError && (
          <div role="alert" className="alert alert-error mb-4">
            <AlertTriangle className="size-5" />
            <span>{createTodoError}</span>
            <button
              className="btn btn-sm btn-ghost btn-circle"
              onClick={() => setCreateTodoError(null)}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="What needs to be done?"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={createTodo.isPending}
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              <span className="label-text font-medium">
                Description (optional)
              </span>
            </label>
            <textarea
              id="description"
              placeholder="Add more details..."
              className="textarea textarea-bordered w-full min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createTodo.isPending}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createTodo.isPending || !title.trim()}
            >
              {createTodo.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Add Todo
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Messages */}
      {deleteTodoError && (
        <div role="alert" className="alert alert-error mb-6">
          <AlertTriangle className="size-5" />
          <span>{deleteTodoError}</span>
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={() => setDeleteTodoError(null)}
            aria-label="Dismiss delete error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Todos Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Your Todos {data && `(${data.length})`}
        </h2>

        {isError && (
          <div role="alert" className="alert alert-error mb-6">
            <CircleX />
            <span>Error: {error.message}</span>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="skeleton h-5 w-5 rounded"></div>
                    <div className="skeleton h-4 flex-1"></div>
                  </div>
                  <div className="skeleton h-3 w-full mb-2"></div>
                  <div className="skeleton h-3 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No todos yet</h3>
            <p className="text-base-content/70">
              Create your first todo above to get started!
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((todo) => {
              const created = (() => {
                try {
                  const d = new Date(todo.createdAt as string)
                  if (isNaN(d.getTime())) return null
                  return d.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                } catch {
                  return null
                }
              })()

              return (
                <div
                  key={todo.id}
                  className={`card bg-base-300 shadow-md hover:shadow-lg transition-all duration-200 ${
                    todo.completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {updateTodo.isPending && pendingUpdateId === todo.id ? (
                          <span
                            className="loading loading-spinner loading-sm mt-1 text-primary"
                            aria-label="Updating todo"
                          />
                        ) : (
                          <input
                            id={todo.id}
                            type="checkbox"
                            className="checkbox checkbox-primary mt-1"
                            checked={!!todo.completed}
                            onChange={(e) =>
                              updateTodo.mutate({
                                todoId: todo.id,
                                completed: e.target.checked,
                              })
                            }
                            disabled={
                              updateTodo.isPending &&
                              pendingUpdateId === todo.id
                            }
                            aria-label={`Mark ${todo.title} as completed`}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`card-title text-lg leading-tight ${
                              todo.completed
                                ? 'line-through text-base-content/60'
                                : ''
                            }`}
                          >
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="text-sm text-base-content/80 mt-2 whitespace-pre-line">
                              {todo.description}
                            </p>
                          )}
                          {created && (
                            <p className="text-xs text-base-content/60 mt-3">
                              Created {created}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle hover:text-error ml-2"
                        aria-label={`Delete ${todo.title}`}
                        disabled={
                          deleteTodo.isPending && pendingDeleteId === todo.id
                        }
                        onClick={() => deleteTodo.mutate(todo.id)}
                        title="Delete"
                      >
                        {deleteTodo.isPending && pendingDeleteId === todo.id ? (
                          <span className="loading loading-spinner loading-sm text-error" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>

                    {updateErrors[todo.id] && (
                      <div role="alert" className="alert alert-error mt-4 py-2">
                        <AlertTriangle className="size-4" />
                        <span className="text-sm">{updateErrors[todo.id]}</span>
                        <button
                          className="btn btn-ghost btn-xs btn-circle"
                          aria-label="Dismiss update error"
                          onClick={() =>
                            setUpdateErrors((prev) => {
                              const { [todo.id]: _removed, ...rest } = prev
                              return rest
                            })
                          }
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
