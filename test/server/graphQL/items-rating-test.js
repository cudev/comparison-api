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

const rating = {
  source: {
    title: 'http://google.com',
    image: 'http://google.com'
  },
  score: 9.9,
};

test('creates item rating', async (t) => {
  const { graphQlContext } = t.context;
  const mutation = `
    mutation createItemRating($_id: String!, $rating: RatingInput!) {
      createItemRating(_id: $_id, rating: $rating){
        score
        source {
          title
          image
        }
      }
    }
  `;

  const variables = {
    rating,
    _id: items.getIn([0, '_id']),
  };
  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  t.deepEqual(response.data.createItemRating, rating);
});

test('updates item rating', async (t) => {
  const { graphQlContext } = t.context;

  const mutation = `
    mutation updateItemRating($_id: String!, $ratingId: String!, $rating: RatingInput!) {
      updateItemRating(_id: $_id, ratingId: $ratingId, rating: $rating){
         score
         source {
           title
           image
         }
      }
    }
  `;

  const variables = {
    rating,
    _id: items.getIn([0, '_id']),
    ratingId: items.getIn([0, 'rating', 0, 'id']),
  };

  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  t.deepEqual(response.data.updateItemRating, rating);
});

test('deletes item rating', async (t) => {
  const { graphQlContext } = t.context;

  const mutation = `
    mutation deleteItemRating($_id: String!, $ratingId: String!) {
      deleteItemRating(_id: $_id, ratingId: $ratingId){
        score
        source {
          title
          image
        }
      }
    }
  `;

  const variables = {
    _id: items.getIn([0, '_id']),
    ratingId: items.getIn([0, 'rating', 0, 'id']),
  };

  const response = await graphql(executableSchema, mutation, {}, graphQlContext, variables);
  t.truthy(response.data.deleteItemRating);
});

