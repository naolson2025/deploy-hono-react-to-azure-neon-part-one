import { Hono } from 'hono';
import {
  deleteTodoById,
  getTodosByUserId,
  insertTodo,
  updateTodoById,
} from '../db/queries';
import { HonoEnv, type Todo } from '../types';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createTodoValidator } from '../validators/create-todo.validator';
import { updateTodoValidator } from '../validators/update-todo.validator';

export const todos = new Hono<HonoEnv>()
  .use(authMiddleware)
  .get('/', async (c) => {
    const user = c.get('user');

    try {
      const todos = await getTodosByUserId(user.id);
      return c.json(todos as Todo[]);
    } catch (error) {
      console.error('Failed to fetch todos: ', error);
      return c.json({ error: 'Failed to fetch todos' }, 500);
    }
  })
  .post('/', createTodoValidator, async (c) => {
    const user = c.get('user');
    const todoData = c.req.valid('json');

    try {
      const newTodo = await insertTodo({
        ...todoData,
        userId: user.id,
      });
      return c.json(newTodo as Todo, 201);
    } catch (error) {
      console.error('Error creating todo: ', error);
      return c.json({ error: 'Failed to create todo' }, 500);
    }
  })
  .delete('/:id', async (c) => {
    const user = c.get('user');
    const todoId = c.req.param('id');

    try {
      const deleted = await deleteTodoById(todoId, user.id);
      if (!deleted) {
        return c.json({ error: 'Todo not found' }, 404);
      }
      return c.json(deleted);
    } catch (error) {
      console.error('Error deleting todo: ', error);
      return c.json({ error: 'Failed to delete todo' }, 500);
    }
  })
  .patch('/:id', updateTodoValidator, async (c) => {
    const user = c.get('user');
    const todoId = c.req.param('id');
    const updates = c.req.valid('json');

    try {
      const updatedTodo = await updateTodoById(todoId, user.id, {
        ...updates,
        updatedAt: new Date(),
      });
      if (!updatedTodo) {
        return c.json({ error: 'Todo not found' }, 404);
      }
      return c.json(updatedTodo);
    } catch (error) {
      console.error('Error updating todo: ', error);
      return c.json({ error: 'Failed to update todo' }, 500);
    }
  });
