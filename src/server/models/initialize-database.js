import winston from 'winston';
import bcrypt from 'bcrypt';

import connection from './database';
import { categories, items, comparisons } from './seed';

export async function setupIndexes() {
  const db = await connection;
  await db.dropDatabase();

  const categoriesCollection = db.collection('categories');
  const itemsCollection = db.collection('items');
  const comparisonsCollection = db.collection('comparisons');

  return Promise.all([
    categoriesCollection.createIndex({ name: 1 }, { unique: true }),
    categoriesCollection.createIndex({ 'name.content': 'text' }, { default_language: 'english' }),
    itemsCollection.createIndex({ name: 1 }, { unique: true }),
    itemsCollection.createIndex({ 'rating.source': 1 }, { unique: true }, { sparse: true }),
    itemsCollection.createIndex({ 'name.content': 'text' }),
    itemsCollection.createIndex({ 'name.content': 1 }),
    comparisonsCollection.createIndex({ 'title.content': 'text' }),
    comparisonsCollection.createIndex({ items: 1 }),
    comparisonsCollection.createIndex({ 'title.content': 1 }),
  ]);
}

export async function seed() {
  const db = await connection;
  const admin = { username: 'admin' };
  const site = { username: 'Alpha',
    token: '$2a$10$OPuCAYPgX97JNcxpodt/w.YlkrvMJOtXJmDlXPm.79EexOgO934Nm' };

  const user = db.collection('users');
  const categoriesCollection = db.collection('categories');
  const itemsCollection = db.collection('items');
  const comparisonsCollection = db.collection('comparisons');

  bcrypt.hash('admin1234', 10, (error, hash) => {
    if (error) {
      winston.error(error);
      return;
    }
    admin.password = hash;
    user.insertOne(admin);
    user.insertOne(site);
  });

  categoriesCollection.insertMany(categories.toJS());
  itemsCollection.insertMany(items.toJS());
  comparisonsCollection.insertMany(comparisons.toJS());
}
