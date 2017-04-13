import { ObjectID } from 'mongodb';
import connectionFromMongoCursor from './../relay-mongodb-connection/connectionFromMongoCursor';

const resolvers = {
  Query: {
    async categories(root, args, { categoriesModel }) {
      return categoriesModel.findAll();
    },

    category(root, { _id }, { categoriesModel }) {
      return categoriesModel.findOneById(_id);
    },

    async categoryConnection(_, { first, last, after, before }, { categoriesModel }) {
      const args = { first, last, after, before };

      const categoriesCursor = await categoriesModel.getItemsCursor();

      return connectionFromMongoCursor(categoriesCursor, args);
    },
  },
  Mutations: {
    async createCategory(root, { category }, { categoriesModel }) {
      return categoriesModel.createOne(category);
    },

    async deleteCategory(root, { _id }, { categoriesModel, itemsModel, comparisonsModel }) {
      const query = { category: new ObjectID(_id) };
      itemsModel.deleteMany(query);
      comparisonsModel.deleteMany(query);
      return categoriesModel.deleteOneById(_id);
    },

    deleteCategories(root, { _ids }, { categoriesModel, itemsModel, comparisonsModel }) {
      const ids = _ids.map(ObjectID);
      const query = {
        category: { $in: ids },
      };

      itemsModel.deleteMany(query);
      comparisonsModel.deleteMany(query);
      return categoriesModel.deleteManyById(_ids);
    },

    async replaceCategory(root, { _id, category }, { categoriesModel, itemsModel }) {
      const replacedCategory = await categoriesModel.replaceOneById(_id, category);
      const items = await itemsModel.findManyByQuery({ category: new ObjectID(_id) });
      const attributes = replacedCategory.attributes.map(attribute => attribute.id.toString());
      items.forEach(async (item) => {
        const serviceItem = Object.assign({}, item);
        serviceItem.values = item.values.filter(
          value => !attributes.includes(value.attribute.toString()),
        );
        serviceItem.values.forEach(value =>
          itemsModel.deleteValue(serviceItem._id, value.attribute),
        );
      });
      return replacedCategory;
    },

    createCategoryAttribute(root, { _id, attribute }, { categoriesModel }) {
      return categoriesModel.createAttribute(_id, attribute);
    },

    deleteCategoryAttribute(root, { _id, attributeId }, { categoriesModel }) {
      return categoriesModel.deleteAttribute(_id, attributeId);
    },

    updateCategoryAttribute(root, { _id, attributeId, attribute }, { categoriesModel }) {
      return categoriesModel.updateAttribute(_id, attributeId, attribute);
    },
  },
  Category: {
    async items(root, args, { itemsModel }) {
      return itemsModel.findManyByQuery({ category: root._id });
    },
  },
  Attribute: {
    attributeGroup({ attributeGroup }, args, { categoriesModel }) {
      return categoriesModel.findAttributeGroup(attributeGroup);
    },
  },
};

export default resolvers;
