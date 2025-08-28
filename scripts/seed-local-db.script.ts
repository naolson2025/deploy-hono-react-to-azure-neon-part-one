import { db, pool } from '../server/db/db';
import * as schema from '../server/db/schema';
import { seed } from 'drizzle-seed';

const seedDb = async () => {
  await seed(db, schema).refine((funcs) => ({
    user: {
      columns: {},
      count: 10,
      with: {
        todos: 10,
      },
    },
    todos: {
      columns: {
        title: funcs.valuesFromArray({
          values: ['Buy groceries', 'read a book', 'call mom'],
        }),
        description: funcs.valuesFromArray({
          values: ['at 5pm', 'weekly', 'daily', undefined],
        }),
      },
    },
  }));
};

seedDb()
  .then(() => {
    console.log('seeded database successfully');
    return pool.end();
  })
  .catch((err) => {
    console.error(`failed to seed database:\n${err}`);
    pool.end().then(() => process.exit(1));
  });
