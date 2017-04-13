import connectionFromMongoCursor from './../relay-mongodb-connection/connectionFromMongoCursor';

const resolvers = {
  Query: {
    async items(root, args, { itemsModel }) {
      return itemsModel.findAll();
    },

    item(root, { _id }, { itemsModel }) {
      return itemsModel.findOneById(_id);
    },

    itemSlug(root, { slug }, { itemsModel }) {

      return itemsModel.findOne({slug});
    },

    async itemConnection(_, { first, last, after, before, search }, { itemsModel }) {
      const args = { first, last, after, before };

      const itemsCursor = await itemsModel.getItemsCursor(search);

      return connectionFromMongoCursor(itemsCursor, args);
    },
  },
  Mutations: {
    async createItem(root, { item, images }, { itemsModel }) {
      const { ops } = await itemsModel.insertOne({ ...item, images: [] });
      if (!images || !images.length) {
        return ops[0];
      }
      return itemsModel.saveImages(ops[0]._id, images);
    },

    deleteItem(root, { _id }, { itemsModel }) {
      itemsModel.deleteDirectoryById(_id);
      return itemsModel.deleteOneById(_id);
    },

    updateItem(root, { _id, item }, { itemsModel }) {
      return itemsModel.updateItem(_id, item);
    },

    async uploadImages(root, { images, _id }, { itemsModel }) {
      itemsModel.saveImages(_id, images);
      const imageNames = await Promise.all(images.map(async image =>
        itemsModel.constructor.getImageName(image, _id)));

      return { images: imageNames, _id };
    },

    deleteImages(root, { images, _id }, { itemsModel }) {
      itemsModel.deleteImages(_id, images.map(image => image.split('/').pop()));
      images.forEach(image => itemsModel.constructor.deleteFileByName(image, _id));
      return { images, _id };
    },

    createItemValue(root, { _id, value }, { itemsModel }) {
      return itemsModel.createValue(_id, value);
    },

    deleteItemValue(root, { _id, valueId }, { itemsModel }) {
      return itemsModel.deleteValue(_id, valueId);
    },

    createItemRating(root, { _id, rating }, { itemsModel }) {
      return itemsModel.createRating(_id, rating);
    },

    deleteItemRating(root, { _id, ratingId }, { itemsModel }) {
      return itemsModel.deleteRating(_id, ratingId);
    },

    updateItemRating(root, { _id, ratingId, rating }, { itemsModel }) {
      return itemsModel.updateRating(_id, ratingId, rating);
    },

  },
  Item: {
    category({ category }, args, { categoriesModel }) {
      return categoriesModel.findOneById(category);
    },
    images({ _id, images }) {
      return images;
    },
  },
  Value: {
    attribute({ attribute }, args, { categoriesModel }) {
      return categoriesModel.findAttribute(attribute);
    },
  },
  Rating: {
    score({ score }) {
      return score || null;
    },
  },
};

export default resolvers;
