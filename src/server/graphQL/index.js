import merge from 'lodash.merge';
import { makeExecutableSchema } from 'graphql-tools';

import categoryResolver from './category/resolvers';
import itemResolver from './item/resolvers';
import comparisonResolver from './comparison/resolvers';
import categorySchema from './category/schema';
import itemSchema from './item/schema';
import comparisonSchema from './comparison/schema';
import fileUploadResolver from './scalars/file-upload';

const schema = `
type Query {
  # dummy field
  description: String!
}

type Mutations {
  # dummy field
  description: String!
}

scalar FileUpload

schema {
  query: Query
  mutation: Mutations
}
`;

export default makeExecutableSchema({
  typeDefs: [schema, categorySchema, comparisonSchema, itemSchema],
  resolvers: merge(categoryResolver, itemResolver, comparisonResolver, fileUploadResolver),
  allowUndefinedInResolve: false,
  printErrors: true,
});
