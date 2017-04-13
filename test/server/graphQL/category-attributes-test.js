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

const attribute = {
  name: [
    {
      language: 'en',
      content: 'Length',
    },
    {
      language: 'ru',
      content: 'Длина',
    },
  ],
  attributeGroup: categories.getIn([0, 'attributeGroups', 0, 'id']),
};

test('creates attribute in category', async (t) => {
  const { graphQlContext } = t.context;
  const mutation = `
    mutation createAttribute($_id: String, $attribute: AttributeInput) {
      attribute: createCategoryAttribute(_id: $_id, attribute: $attribute) {
        name {
          language
          content
        }
        attributeGroup {
          id
        }
      }
    }
  `;

  const variables = {
    attribute,
    _id: categories.getIn([0, '_id']),
  };
  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);

  const expected = {
    ...attribute,
    attributeGroup: { id: categories.getIn([0, 'attributeGroups', 0, 'id']).toString() },
  };
  t.deepEqual(response.data.attribute, expected);
});

test('deletes attribute in category', async (t) => {
  const { graphQlContext } = t.context;

  const mutation = `
    mutation deleteAttribute($_id: String, $attributeId: String!) {
      attribute: deleteCategoryAttribute(_id: $_id, attributeId: $attributeId) {
        id
        name {
          language
          content
        }
        attributeGroup {
          id        
        }
      }
    }
  `;

  const variables = {
    attributeId: categories.getIn([0, 'attributes', 0, 'id']),
    _id: categories.getIn([0, '_id']),
  };

  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  const expected = JSON.parse(JSON.stringify({
    ...categories.getIn([0, 'attributes', 0]).toJS(),
    attributeGroup: { id: categories.getIn([0, 'attributes', 0, 'attributeGroup']) },
  }));
  t.deepEqual(
    response.data.attribute,
    expected,
    'returned attribute is different',
  );

  const secondResponse = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  t.is(secondResponse.data.attribute, null, 'returned data is not null on second delete mutation');
});

test('updates attribute in category', async (t) => {
  const { graphQlContext } = t.context;
  const mutation = `
    mutation updateAttribute($_id: String, $attributeId: String!, $attribute: AttributeInput) {
      attribute: updateCategoryAttribute(_id: $_id, attributeId: $attributeId, attribute: $attribute) {
        id
        name {
          language
          content
        }
        attributeGroup {
          id
        }
      }
    }
  `;

  const variables = {
    attribute,
    attributeId: categories.getIn([0, 'attributes', 0, 'id']),
    _id: categories.getIn([0, '_id']),
  };
  const expected = JSON.parse(JSON.stringify({
    ...attribute,
    attributeGroup: { id: categories.getIn([0, 'attributeGroups', 0, 'id']) },
    id: categories.getIn([0, 'attributes', 0, 'id']),
  }));
  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  t.deepEqual(response.data.attribute, expected, 'returned attribute is different');
});

