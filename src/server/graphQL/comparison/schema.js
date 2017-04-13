const schema = `
type Comparison {
  _id: String!
  slug: String!
  title: [Translation!]!
  items: [Item!]!
  attributes: [Attribute!]!
  image: String
  category: Category!
}

type FileMutationResult {
  image: String!
  _id: String!
}

input ComparisonInput {
  title: [TranslationInput!]!
  items: [String!]!
  attributes: [String!]!
  category: String!
}

type ComparisonEdge {
  cursor: String!
  node: Comparison!
}
 
type ComparisonConnection {
  edges: [ComparisonEdge]
  pageInfo: PageInfo!
}

type PageInfo {
  startCursor: String
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  totalCount: Int
} 

extend type Query {
  comparison(_id: String!): Comparison
  comparisonSlug(slug: String!): Comparison
  comparisons: [Comparison]!
  comparisonConnection(first: Int, last: Int, after: String, before: String, search: String): ComparisonConnection!
}

extend type Mutations {
  createComparison(comparison: ComparisonInput!, image: FileUpload): Comparison
  deleteComparison(_id: String!): Comparison
  updateComparison(_id: String!, comparison: ComparisonInput!): Comparison
  uploadImage(image: FileUpload!, _id: String!): FileMutationResult
  deleteImage(image: String!, _id: String!): FileMutationResult
  # Add item to comparison
  addItem(_id: String!, itemId: String!): Item
  removeItem(_id: String!, itemId: String!): Item
  addAttribute(_id: String!, attributeId: String!): Attribute
  removeAttribute(_id: String!, attributeId: String!): Attribute
}
`;

export default schema;
