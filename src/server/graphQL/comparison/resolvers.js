import connectionFromMongoCursor from './../relay-mongodb-connection/connectionFromMongoCursor';

const resolvers = {
  Query: {

    comparisons(root, args, { comparisonsModel }) {
      return comparisonsModel.findAll();
    },
    comparison(root, { _id }, { comparisonsModel }) {
      return comparisonsModel.findOneById(_id);
    },
    comparisonSlug(root, { slug }, { comparisonsModel }) {
      return comparisonsModel.findOne({slug});
    },
    async comparisonConnection(_, { first, last, after, before, search },
      { itemsModel, comparisonsModel }) {
      const args = { first, last, after, before };

      const itemsCursor = await itemsModel.getItemsCursor(search);
      const items = await connectionFromMongoCursor(itemsCursor, args);

      const itemsIds = items.edges.map(({ node }) => node._id.toString());

      const comparisonsCursor = await comparisonsModel.getComparisonsCursor(search, itemsIds);

      return connectionFromMongoCursor(comparisonsCursor, args);
    },
  },
  Mutations: {
    async createComparison(root, { comparison, image }, { comparisonsModel }) {
      if (!image) {
        const { ops } = await comparisonsModel.insertOne({ ...comparison, image: null });
        return ops[0];
      }
      const buffer = await comparisonsModel.constructor.getBuffer(image[0].path);
      const imageName = await comparisonsModel.constructor.getImageName(image[0]);

      const { ops } = await comparisonsModel.insertOne({ ...comparison, image: imageName });
      comparisonsModel.saveImage(buffer, imageName, ops[0]._id);
      return ops[0];
    },

    async deleteComparison(root, { _id }, { comparisonsModel }) {
      comparisonsModel.deleteDirectoryById(_id);
      return comparisonsModel.deleteOneById(_id);
    },

    updateComparison(root, { _id, comparison }, { comparisonsModel }) {
      return comparisonsModel.findOneAndUpdate(_id, comparison);
    },

    async uploadImage(root, { image, _id }, { comparisonsModel }) {
      const buffer = await comparisonsModel.constructor.getBuffer(image[0].path);
      const imageName = await comparisonsModel.constructor.getImageName(image[0]);
      comparisonsModel.saveImage(buffer, imageName, _id);
      comparisonsModel.findOneAndUpdate(_id, { image: imageName });

      return { image: imageName, _id };
    },

    deleteImage(root, { image, _id }, { comparisonsModel }) {
      comparisonsModel.deleteDirectoryById(_id);
      comparisonsModel.findOneAndUpdate(_id, { image: null });

      return { image, _id };
    },

    addItem(root, { _id, itemId }, { comparisonsModel }) {
      return comparisonsModel.addItem(_id, itemId);
    },

    removeItem(root, { _id, itemId }, { comparisonsModel }) {
      return comparisonsModel.removeItem(_id, itemId);
    },

    addAttribute(root, { _id, attributeId }, { comparisonsModel }) {
      return comparisonsModel.addAttribute(_id, attributeId);
    },

    removeAttribute(root, { _id, attributeId }, { comparisonsModel }) {
      return comparisonsModel.removeAttribute(_id, attributeId);
    },
  },
  Comparison: {
    items(root, args, { itemsModel }) {
      return itemsModel.findManyByIds(root.items);
    },
    image({ _id, image }) {
      if (!image) {
        return null;
      }
      return image;
    },
    attributes(root, args, { categoriesModel }) {
      return categoriesModel.findAttributesByIds(root.attributes);
    },
    category({ category }, args, { categoriesModel }) {
      return categoriesModel.findOneById(category);
    },
  },
};

export default resolvers;
