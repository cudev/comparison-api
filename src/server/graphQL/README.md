### Visit http://localhost:3000/graphiql ###

#### get one category ####
```
{
  category(_id: "5835bcba5fafde454f050c3c"){
    _id
    name{
      language
      content
    }
    attributes{
      id
      name{
        language
        content
      }
    }
    items{
      _id
      category{
        _id
        name{
          language
          content
        }
        items{
          name{
            language
            content
          }
        }
      }
    }
  }
}

```
#### get all categories ####
```
{
  categories{
    _id
    name{
      language
      content
    }
    attributes{
      id
      name{
        language
        content
      }
    }
    items{
      _id
    }
  }
}
```

#### create new category ####
```
mutation createCategory($category: CategoryInput!) {
  createCategory(category: $category) {
    _id
    name{
      language
      content
    }
    attributes{
      id
      name{
        language
        content
      }
    }
  }
}

{
  "category":{
    "name": [
      {
        "language": "ru",
        "content": "Холодильник"
      },
      {
        "language": "en",
        "content": "Refregirator"
      }
    ],
    "attributes": [
      {
        "name": [
          {
            "language": "ru",
            "content": "fdhfghnfgjghdjkhgk"
          }
        ]
      }
    ]
  }
}
```

#### delete category ####
```
mutation deleteCategory($_id: String!) {
  deleteCategory(_id: $_id) {
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
    items {
      _id
    }
  }
}
{
  "_id": "581b198b8fe4be0158d156ce"
}
```
#### delete categories ####
```
mutation deleteCategories($_ids: [String!]!) {
  deleteCategories(_ids: $_ids) {
    name{
      language
      content
    }
    _id
  }
}
{
  "_ids": ["5825db8ff855b451e490b04c", "5825db8ff855b451e490b04d"]
}
```

#### replace category ####
```
mutation replaceCategory($_id: String!, $category: ReplaceCategoryInput!) {
  replaceCategory(_id: $_id, category: $category){
    _id
    name{
      language
      content
    }
    attributes{
      id
      name{
        language
        content
      }
    }
  }
}

{
  "_id": "5835e64110072b5ec454dd77",
  "category": {
    "name": [
      {
        "language": "ru",
        "content": "Ноутбук обновленный"
      },
      {
        "language": "en",
        "content": "Laptop updated"
      }
    ],
    "attributes": [
      {
        "id": "5835d00fa42385528b2b4a49",
        "name": [
          {
            "language": "ru",
            "content": "Модель процессора обновленная"
          },
          {
            "language": "en",
            "content": "Processor Model updated"
          },
          {
            "language": "fr",
            "content": "Process model franch updated"
          }
        ]
      },
      {
        "id": "5835d00fa42385528b2b4a50",
        "name": [
          {
            "language": "ru",
            "content": "Графическая модель обновленная"
          },
          {
            "language": "en",
            "content": "Graphics Model updated"
          }
        ]
      },
      {
        "name": [
          {
            "language": "ru",
            "content": "Новое свойство"
          },
          {
            "language": "en",
            "content": "New property"
          }
        ]
      }
    ]
  }
}
```

#### createCategoryAttribute ####
```
mutation createCategoryAttribute($_id: String, $attribute: AttributeInput) {
  createCategoryAttribute(_id: $_id, attribute: $attribute) {
    id
    name {
      language
      content
    }
  }
}

 {
   "_id": "5836e0a7563d852287887431",
   "attribute":
     {
       "name": [
         {
           "language": "ru",
           "content": "Новый Attribute"
         },
         {
           "language": "en",
           "content": "New Attribute"
         },
         {
           "language": "fr",
           "content": "Nouveau Attribute"
         }
       ]
     }
 }
```
#### deleteCategoryAttribute ####
```
mutation deleteCategoryAttribute($_id: String, $attributeId: String) {
  deleteCategoryAttribute(_id: $_id, attributeId: $attributeId) {
    id
    name {
      language
      content
    }
  }
}

 {
   "_id": "5836e0a7563d852287887431",
   "attributeId": "5836e0a7563d852287887431"
 }
```
#### updateCategoryAttribute ####
```
mutation updateCategoryAttribute($_id: String, $attributeId: String, $attribute: AttributeInput) {
  updateCategoryAttribute(_id: $_id, attributeId: $attributeId, attribute: $attribute) {
    id
    name {
      language
      content
    }
  }
}

  {
    "_id": "5836efc99601402b6e681116",
    "attributeId": "5835d00fa42385528b2b4a49",
    "attribute": {
      "name": [
        {
          "language": "ru",
          "content": "Новый Attribute"
        },
        {
          "language": "en",
          "content": "New Attribute"
        },
        {
          "language": "fr",
          "content": "Nouveau Attribute"
        }
      ]
    }
 }
```

#### create item ####
```
mutation createItem($item: ItemInput!, $images: [FileUpload!]!) {
  createItem(item: $item, images: $images) {
    _id
    name {
      language
      content
    }
    values {
      attribute {
        id
        name {
          language
          content
        }
      }
    }
    category {
      _id
      name {
        language
        content
      }
      items {
        name {
          language
          content
        }
      }
    }
  }
}

{
  "item": {
    "category": "583822af02d71b22f1c33a83",
    "name": [
      {
        "language": "ru",
        "content": "Item ru"
      },
      {
        "language": "en",
        "content": "Item en"
      }
    ],
    "values": [
      {
        "attribute": "5838198345175d1d558e13ee",
        "content": [
          {
            "language": "ru",
            "content": "Value(Разрешение)"
          },
          {
            "language": "en",
            "content": "Значение(Разрешение)"
          }
        ]
      },
      {
         "attribute": "5838198345175d1d558e13ab",
        "content": [
          {
            "language": "en",
            "content": "Value(Flash Type)"
          },
          {
            "language": "en",
            "content": "Значение(Тип вспышки)"
          }
        ]
      }
    ]
  }
}
```
#### replace item ####
```
mutation replaceItem($item: ItemInput!, $_id: String!) {
  replaceItem(item: $item, _id: $_id) {
    _id
    name {
      language
      content
    }
    values {
      attribute {
        id
        name {
          language
          content
        }
      }
      content {
        language
        content
      }
    }
  }
}


{
  "_id": "58382748da976a24eaac1fdc" ,
  "item": {
    "category": "58382748da976a24eaac1fda",
    "name": [
      {
        "language": "ru",
        "content": "Item ru"
      },
      {
        "language": "en",
        "content": "Item en"
      }
    ],
    "values": [
      {
        "attribute": "5838198345175d1d558e13ee",
        "content": [
          {
            "language": "ru",
            "content": "Значение(Разрешение)"
          },
          {
            "language": "en",
            "content": "Value(Resolution)"
          }
        ]
      },
      {
         "attribute": "5838198345175d1d558e13ab",
        "content": [
          {
            "language": "en",
            "content": "Value(Flash Type)"
          },
          {
            "language": "en",
            "content": "Значение(Тип вспышки)"
          }
        ]
      }
    ]
  }
}

```

#### delete item ####
```
mutation deleteItem($_id: String!) {
  deleteItem(_id: $_id) {
    name
    _id
  }
}
{
  "_id": "5821c9b6a1e3892c41d862bd"
}
```

#### createItemValue item ####
```
mutation createItemValue($_id: String!, $value: ValueInput!) {
  createItemValue(_id: $_id, value: $value) {
  attribute {
      id
      name {
        language
        content
      }
    }
    content {
      language
      content
    }
  }
}

{
  "_id": "58382e128752d5290833a13e",
  "value": {
    "attribute": "5838198345175d1d558e13ee",
    "content": [
      {
        "language": "ru",
        "content": "Новое свойство"
      },
      {
        "language": "en",
        "content": "New value"
      }
    ]
  }
}
```

#### deleteItemValue item ####
```
mutation deleteItemValue($_id: String!, $valueId: String!){
  deleteItemValue(_id: $_id, valueId: $valueId){
    content{
      language
      content
    }
  }
}

{
  "_id": "58371ee696b4d6422a2f799c",
  "valueId": "58371ee496b4d6422a2f798f"
}
```

#### get item ####
```
{
  items {
    _id
    values{
      attribute{
        id
        name{
          language
          content
        }
      }
    }
    category {
      _id
      name {
        language
        content
      }
      items {
        name {
          language
          content
        }
      }
    }
  }
}

```


####CreateComparison ####
```
mutation CreateComparison($comparison: ComparisonInput!){
  createComparison(comparison: $comparison){
    _id
  }
}

{
  "comparison": {
    "title": [
      {
        "language": "en",
        "content": "Comparison3"

      }
    ],
    "items": ["583879bcbfde1e5ec839512e","583879bcbfde1e5ec839512f"],
    "attributes": ["5838198345175d1d558e13ea", "5838198345175d1d558e13eb"]
  }
}
```
#### delete Comparison ####
```
mutation deleteComparison ($_id: String!) {
  deleteComparison(_id: $_id){
    _id
    title{
      content
    }
    items{
      name{
        content
      }
    }
    attributes{
      name{
        content
        language
      }
    }
  }
}

{
  "_id": "583c23060df07d4067768d27"
}
```

#### addItem ####
```
mutation addItem($_id: String!, $itemId: String!) {
  addItem(_id:$_id, itemId: $itemId){
    _id
    name{
      language
      content
    }
    category{
      _id
    }
  }
}
```
####removeItem ####
```
mutation removeItem($_id: String!, $itemId: String!) {
  removeItem(_id: $_id, itemId: $itemId){
    _id
    name{
      content
    }
    values{
      content{
        language
        content
      }
    }
  }
}
```

#### addAttribute ####
```
mutation addAttribute($_id: String!, $attributeId: String!) {
  addAttribute(_id: $_id, attributeId: $attributeId){
    id
    name{
      content
      language
    }
  }
}
```

#### removeAttribute ####
```
mutation removeAttribute($_id: String!, $attributeId: String!) {
  removeAttribute(_id: $_id, attributeId: $attributeId){
    id
    name{
      content
      language
    }
  }
}
```

#### createItemRating ####
```
mutation createItemRating($_id: String!, $rating: RatingInput!) {
  createItemRating(_id: $_id, rating: $rating){
    score
    source
  }
}
{
  "_id": "583d8763a173f449a657a4aa",
  "rating": {
    "source": "Source4",
    "score": 6.5
  }
}
```
#### deleteItemRating ####
```
mutation deleteItemRating($_id: String!, $ratingId: String!) {
  deleteItemRating(_id: $_id, ratingId: $ratingId){
    score
    source
  }
}

```

#### updateItemRating ####
```
mutation updateItemRating($_id: String!, $ratingId: String!, $rating: RatingInput!) {
  updateItemRating(_id: $_id, ratingId: $ratingId, rating: $rating){
    score
    source
  }
}
```
