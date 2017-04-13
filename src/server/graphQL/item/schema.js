const schema = `
type Item {
  _id: String!
  slug: String!
  name: [Translation!]!
  values: [Value!]!
  category: Category!
  rating: [Rating!]!
  images: [String!]!
  videos: [String!]!
}

type Source {
  title: String!
  image: String!
}

type Rating {
  id: String!
  source: Source!
  score: Float
}

input ItemInput {
  name: [TranslationInput!]!
  values: [ValueInput!]!
  category: String!
  rating: [RatingInput!]!
  videos: [String!]!
}

type FilesMutationResult {
  images: [String!]!
  _id: String!
}

input SourceInput {
  title: String!
  image: String!
}

input RatingInput {
  source: SourceInput!
  score: Float!
}

type ItemEdge {
  cursor: String!
  node: Item!
}
 
type ItemConnection {
  edges: [ItemEdge]
  pageInfo: PageInfo!
}

extend type Query {
  item(_id: String!, language: Language): Item
  items(limit: Int, after: String, before: String, language: Language): [Item]
  itemSlug(slug: String!): Item
  itemConnection(first: Int, last: Int, after: String, before: String, search: String): ItemConnection!
}

extend type Mutations {
  createItem(item: ItemInput!, images: [FileUpload!]): Item
  updateItem(_id: String!, item: ItemInput!): Item
  uploadImages(images: [FileUpload!]!, _id: String!): FilesMutationResult
  deleteImages(images: [String!]!, _id: String!): FilesMutationResult
  deleteItem(_id: String!): Item
  createItemValue(_id: String!, value: ValueInput!): Value
  deleteItemValue(_id: String!, valueId: String!): Value
  createItemRating(_id: String!, rating: RatingInput!): Rating
  deleteItemRating(_id: String!, ratingId: String!): Rating
  updateItemRating(_id: String!, ratingId: String!, rating: RatingInput!): Rating
}
`;

export default schema;
