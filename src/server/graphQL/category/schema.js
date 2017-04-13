const schema = `
enum Language {
  ru
  en
  fr
}

type Translation {
  language: Language!
  content: String!
}

type Category {
  _id: String!
  name: [Translation!]!
  attributeGroups: [AttributeGroup!]
  attributes: [Attribute!]!
  items: [Item!]!
}

type AttributeGroup {
  id: String!
  name: [Translation!]!
  attributes: [Attribute!]!
}

type Attribute {
  id: String!
  name: [Translation!]!
  attributeGroup: AttributeGroup
}

type Value {
  attribute: Attribute!
  content: [Translation!]!
}

input TranslationInput {
  language: Language!
  content: String!
}

input CategoryInput {
  name: [TranslationInput!]!
  attributes: [AttributeInput!]
  attributeGroups: [AttributeGroupInput!]
}

input AttributeInput {
  name: [TranslationInput!]!
  attributeGroup: String
}

input AttributeGroupInput {
  name: [TranslationInput!]!
}

input ValueInput {
  attribute: String!
  content: [TranslationInput!]!
}

# Input types for replaceCategory. Add attribute id.
input ReplaceCategoryInput {
  name: [TranslationInput!]!
  attributes: [ReplaceAttributeInput!]
}

input ReplaceAttributeInput {
  id: String
  name: [TranslationInput!]!
}

type CategoryEdge {
  cursor: String!
  node: Category!
}

type CategoryConnection {
  edges: [CategoryEdge]
  pageInfo: PageInfo!
}

extend type Query {
  category(_id: String!): Category
  categories: [Category]
  categoryConnection(first: Int, last: Int, after: String, before: String): CategoryConnection!
}

extend type Mutations {
  createCategory(category: CategoryInput!): Category
  deleteCategory(_id: String!): Category
  deleteCategories(_ids: [String!]!): [Category]
  replaceCategory(_id: String!, category: ReplaceCategoryInput!): Category
  createCategoryAttribute(_id: String, attribute: AttributeInput): Attribute
  deleteCategoryAttribute(_id: String, attributeId: String): Attribute
  updateCategoryAttribute(_id:String, attributeId: String, attribute: AttributeInput): Attribute
}
`;

export default schema;
