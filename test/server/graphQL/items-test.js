import { graphql } from 'graphql';
import test from 'ava';
import { v4 } from 'uuid';

import createCategoriesModel from '../../../src/server/models/categories';
import createComparisonsModel from '../../../src/server/models/comparisons';
import createItemsModel from '../../../src/server/models/items';
import executableSchema from '../../../src/server/graphQL';
import getConnection, { cleanup } from '../../helpers/database';
import { categories, items, comparisons } from '../../helpers/seed';

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

const itemStub = {
  name: [
    {
      language: 'ru',
      content: 'Apple iPhone 7 (Рус)',
    },
    {
      language: 'en',
      content: 'Apple iPhone 7',
    },
  ],
  category: categories.getIn([0, '_id']),
  values: [
    {
      attribute: categories.getIn([0, 'attributes', 0, 'id']),
      content: [
        {
          language: 'ru',
          content: '12 (Рус)',
        },
        {
          language: 'en',
          content: '12 (En)',
        },
      ],
    },
    {
      attribute: categories.getIn([0, 'attributes', 1, 'id']),
      content: [
        {
          language: 'ru',
          content: '4K (Рус)',
        },
        {
          language: 'en',
          content: '4K (En)',
        },
      ],
    },
    {
      attribute: categories.getIn([0, 'attributes', 2, 'id']),
      content: [
        {
          language: 'ru',
          content: 'Quad LED (Рус)',
        },
        {
          language: 'en',
          content: 'Quad LED (En)',
        },
      ],
    },
    {
      attribute: categories.getIn([0, 'attributes', 3, 'id']),
      content: [
        {
          language: 'ru',
          content: '2.23 (Рус)',
        },
        {
          language: 'en',
          content: '2.23 (En)',
        },
      ],
    },
  ],
  rating: [
    {
      source: {
        title: 'http://google.com',
        image: 'http://google.com'
      },
      score: 7.5,
    }
  ],
  videos: ['http://youtube.com/video'],
};

test('returns all items', async (t) => {
  const { graphQlContext } = t.context;
  const query = `
    {
      items {
        _id
        name {
          language
          content
        }
        values {
          content {
            language
            content
          }
        }
        rating {
          id
          score
          source {
            title
            image
          }
        }
        images
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.is(response.data.items.length, items.size);
});

test('returned id is the same when item queried by id', async (t) => {
  const { graphQlContext } = t.context;
  const id = items.getIn([0, '_id']);
  const query = `
    {
      item(_id: "${id}") {
        _id
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.true(id.equals(response.data.item._id));
});

test("returns items' connection with proper totalCount", async (t) => {
  const { graphQlContext } = t.context;
  const query = `
    {
      itemConnection {
        edges {
          cursor
          node {
            _id
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
          totalCount
        }
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.is(response.data.itemConnection.pageInfo.totalCount, items.size);
});

test('creates an item', async (t) => {
  const { graphQlContext } = t.context;
  const query = `
    mutation createItem($item: ItemInput!) {
      item: createItem(item: $item) {
        name {
          language
          content
        }
        values {
          content {
            language
            content
          }
        }
        rating {
          score
          source {
            title
            image
          }
        }
      }
    }
  `;

  const variables = {
    item: itemStub,
  };

  const response = await graphql(executableSchema, query, {}, graphQlContext, variables);
  t.truthy(response.data);

  t.is(response.data.item.name.length, itemStub.name.length);
  t.is(response.data.item.values.length, itemStub.values.length);
  t.is(response.data.item.rating.length, itemStub.rating.length);
});

test('deletes an item by id', async (t) => {
  const { graphQlContext } = t.context;
  const id = items.getIn([0, '_id']);
  const query = `
    mutation {
      item: deleteItem(_id: "${id}") {
        _id
      }
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  t.true(id.equals(response.data.item._id));
});

test('resolves a category of an item', async (t) => {
  const { graphQlContext } = t.context;
  const id = items.getIn([0, '_id']);
  const query = `
    {
      item(_id: "${id}") {
        category {
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
    }
  `;

  const response = await graphql(executableSchema, query, {}, graphQlContext);
  let category = categories.find(found => found.get('_id').equals(items.getIn([0, 'category'])));

  category = category.set(
    'attributes',
    category.get('attributes').map(
      attribute => attribute.set('attributeGroup', { id: attribute.get('attributeGroup') }),
    ),
  );
  const expected = JSON.parse(JSON.stringify(category));
  t.deepEqual(response.data.item.category, expected);
});
