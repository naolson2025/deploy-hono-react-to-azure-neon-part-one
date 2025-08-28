import { db } from '@/db/db';
import { todos } from './schema';
import { eq, desc, and } from 'drizzle-orm';
import { NewTodo, Todo } from '../types';

export const getTodosByUserId = async (userId: string) => {
  return await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
};

export const insertTodo = async (todo: NewTodo) => {
  const [result] = await db.insert(todos).values(todo).returning();

  return result;
};

export const deleteTodoById = async (id: string, userId: string) => {
  const result = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();

  return result.length > 0;
};

export const updateTodoById = async (
  id: string,
  userId: string,
  updates: Partial<NewTodo>
): Promise<Todo | undefined> => {
  const [result] = await db
    .update(todos)
    .set(updates)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();

  return result;
};
