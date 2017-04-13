import { graphql } from 'graphql';
import test from 'ava';
import { v4 } from 'uuid';

import createCategoriesModel from '../../../src/server/models/categories';
import createComparisonsModel from '../../../src/server/models/comparisons';
import createItemsModel from '../../../src/server/models/items';
import executableSchema from '../../../src/server/graphQL';
import getConnection, { cleanup } from '../../helpers/database';
import { categories, items, comparisons } from '../../helpers/seed';

const categoryStub = {
  name: [
    {
      language: 'ru',
      content: 'Ресторан',
    },
    {
      language: 'en',
      content: 'Restaurant',
    },
  ],
  attributes: [
    {
      name: [
        {
          language: 'ru',
          content: 'Адрес',
        },
        {
          language: 'en',
          content: 'Address',
        },
      ],
    },
    {
      name: [
        {
          language: 'ru',
          content: 'Средний чек',
        },
        {
          language: 'en',
          content: 'Average check',
        },
      ],
    },
  ],
};

test.beforeEach((t) => {
  const connection = getConnection(v4());
  const categoriesModel = createCategoriesModel(connection);
  const itemsModel = createItemsModel(connection);
  const comparisonsModel = createComparisonsModel(connection);
  t.context = {
    connection,
    categoriesModel,
    itemsModel,
    comparisonsModel,
    graphQlContext: {
      categoriesModel,
      itemsModel,
      comparisonsModel,
    },
  };
  categoriesModel.insertMany(categories.toJS());
  itemsModel.insertMany(items.toJS());
  comparisonsModel.insertMany(comparisons.toJS());
});

test.afterEach.always(async t => cleanup(t.context.connection));

test('creates and returns category', async (t) => {
  const { graphQlContext, categoriesModel } = t.context;

  const mutation = `
    mutation createCategory($category: CategoryInput!) {
      createCategory(category: $category) {
        _id
        name {
          language
          content
        }
        attributes {
          name {
            language
            content
          }
        }
      }
    }
  `;

  const variables = { category: categoryStub };
  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  const result = response.data.createCategory;
  await categoriesModel.deleteOneById(result._id);
  t.deepEqual(result, { ...categoryStub, _id: result._id });
});

test('returns existing category by id', async (t) => {
  const { graphQlContext } = t.context;

  const query = `
    {
      category(_id: "${categories.getIn([0, '_id'])}") {
        _id
        name {
          language
          content
        }
        attributes {
          id
          name {
            language
            content
          }
          attributeGroup {
            id
          }
        }
        attributeGroups {
          id
          name {
            language
            content
          }
        }
      }
    }
  `;

  let category = categories.get(0);
  // wrap attributeGroup into object with id
  category = category.set(
    'attributes',
    category.get('attributes').map(
      attribute => attribute.set('attributeGroup', { id: attribute.get('attributeGroup') }),
    ),
  );
  const expected = JSON.parse(JSON.stringify(category));
  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.deepEqual(response.data.category, expected);
});

test('returns all existing categories', async (t) => {
  const { graphQlContext } = t.context;

  const query = `
    {
      categories {
        _id
        name {
          language
          content
        }
        attributes {
          id
          name {
            language
            content
          }
        }
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.is(response.data.categories.length, categories.size);
});

test('deletes category', async (t) => {
  const { graphQlContext } = t.context;
  const id = categories.getIn([0, '_id']);
  const query = `
    mutation {
      deleteCategory(_id: "${id}") {
        _id
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.true(id.equals(response.data.deleteCategory._id));
});

test('items and comparisons of deleted category are not exists in database', async (t) => {
  const { graphQlContext, itemsModel, comparisonsModel } = t.context;

  const categoryId = categories.getIn([0, '_id']);
  const getIdsByCategoryId = entries => (
    entries.filter(entry => entry.get('category').equals(categoryId)).map(entry => entry.get('_id'))
  );

  const itemsIds = getIdsByCategoryId(items);
  const comparisonsIds = getIdsByCategoryId(comparisons);

  if (!itemsIds.size && !comparisonsIds.size) {
    t.fail('No data to test');
  }

  const deleteCategoryMutation = `
    mutation {
      deleteCategory(_id: "${categoryId}") {
        _id
      }
    }
  `;

  const response = await graphql(executableSchema, deleteCategoryMutation, {}, graphQlContext);
  t.truthy(response.data.deleteCategory);

  const deletedItems = await itemsModel.findManyByIds(itemsIds.toJS());
  t.true(deletedItems.every(entry => !entry), "Items weren't deleted");

  const deletedComparisons = await comparisonsModel.findManyByIds(comparisonsIds.toJS());
  t.true(deletedComparisons.every(entry => !entry), "Comparisons weren't deleted");
});

test('deletes multiple categories at once', async (t) => {
  const { graphQlContext, categoriesModel } = t.context;

  const deleteCategoryMutation = `
    mutation {
      deleteCategories(_ids: ["${items.getIn([0, 'category'])}", "${items.getIn([1, 'category'])}"]) {
        _id
      }
    }
  `;

  const response = await graphql(executableSchema, deleteCategoryMutation, {}, graphQlContext);
  t.truthy(response.data.deleteCategories);

  const result = await categoriesModel.findManyByIds([items.getIn([0, '_id']), items.getIn([1, '_id'])]);
  t.true(result.every(entry => !entry));
});

test('deletes multiple categories at once with dependent items and comparisons', async (t) => {
  const { graphQlContext, itemsModel, comparisonsModel } = t.context;

  const categoryIds = [categories.getIn([0, '_id']), categories.getIn([1, '_id'])];
  const getIdsByCategoryId = entries => (
    entries.filter(entry => categoryIds.includes(entry.get('category'))).map(entry => entry.get('_id'))
  );

  const itemsIds = getIdsByCategoryId(items);
  const comparisonsIds = getIdsByCategoryId(comparisons);

  if (!itemsIds.size && !comparisonsIds.size) {
    t.fail('No data to test');
  }

  const deleteCategoriesMutation = `
    mutation {
      deleteCategories(_ids: ["${categoryIds.pop()}", "${categoryIds.pop()}"]) {
        _id
      }
    }
  `;

  const response = await graphql(executableSchema, deleteCategoriesMutation, {}, graphQlContext);
  t.truthy(response.data.deleteCategories);

  const deletedItems = await itemsModel.findManyByIds(itemsIds.toJS());
  t.true(deletedItems.every(entry => !entry), "Items weren't deleted");

  const deletedComparisons = await comparisonsModel.findManyByIds(comparisonsIds.toJS());
  t.true(deletedComparisons.every(entry => !entry), "Comparisons weren't deleted");
});

test('resolves correct amount items of a category', async (t) => {
  const { graphQlContext } = t.context;
  const categoryId = categories.getIn([0, '_id']);
  const query = `
    {
      category(_id: "${categoryId}") {
        items {
          _id
        }
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.is(
    items.filter(item => item.get('category').equals(categoryId)).size,
    response.data.category.items.length,
    'Wrong amount of items returned',
  );
});

test('replaces category', async (t) => {
  const { graphQlContext } = t.context;
  const query = `
    mutation replaceCategory($_id: String!, $category: ReplaceCategoryInput!) {
      category: replaceCategory(_id: $_id, category: $category) {
        name {
          language
          content
        }
        attributes {
          name {
            language
            content
          }
        }
      }
    }
  `;

  const variables = {
    _id: categories.getIn([0, '_id']),
    category: categoryStub,
  };

  const response = await graphql(executableSchema, query, {}, graphQlContext, variables);
  t.deepEqual(response.data.category, categoryStub);
});
