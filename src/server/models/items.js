import { ObjectID } from 'mongodb';

import Model from './model';

export const COLLECTION_NAME = 'items';

export class ItemsModel extends Model {
  constructor(connection) {
    super(connection, COLLECTION_NAME);
  }

  insertOne(item) {
    let rating = [];
    if (item.rating && item.rating.length) {
      rating = item.rating.map(entry => ({ ...entry, id: new ObjectID() }));
    }
    return super.insertOne({ ...item, category: new ObjectID(item.category), rating });
  }

  async createValue(itemId, value) {
    const { attribute, ...copiedValue } = value;
    copiedValue.attribute = new ObjectID(attribute);
    const { value: valueData } = await super.findOneAndUpdate(
      { _id: new ObjectID(itemId) },
      {
        $push: {
          values: copiedValue,
        },
      },
      { returnOriginal: false },
    );
    if (!valueData) {
      return null;
    }
    this.dataLoader.clear(itemId);
    return valueData.values.find(
      element => element.attribute.equals(value.attribute),
    );
  }

  async deleteValue(itemId, valueId) {
    const { value: item } = await super.findOneAndUpdate(
      { _id: new ObjectID(itemId) },
      {
        $pull: {
          values: { attribute: new ObjectID(valueId) },
        },
      },
      { returnOriginal: false },
    );
    if (!item) {
      return null;
    }
    this.dataLoader.clear(itemId);
    return item.values.find(element => element.attribute.equals(valueId));
  }

  async createRating(itemId, rating) {
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(itemId) },
      {
        $push: {
          rating: { id: new ObjectID(), ...rating },
        },
      },
      { returnOriginal: false },
    );
    this.dataLoader.clear(itemId);
    return value ? rating : null;
  }

  async deleteRating(itemId, ratingId) {
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(itemId) },
      {
        $pull: {
          rating: { id: new ObjectID(ratingId) },
        },
      },
      { returnOriginal: true },
    );
    if (!value) {
      return null;
    }
    this.dataLoader.clear(itemId);
    return value.rating.find(({ id }) => id.equals(ratingId));
  }

  async updateRating(itemId, ratingId, rating) {
    if (Object.keys(rating).length === 0) {
      return null;
    }
    const $set = {};
    Object.keys(rating).forEach(key => ($set[`rating.$.${key}`] = rating[key]));
    const { value } = await super.findOneAndUpdate(
      {
        _id: new ObjectID(itemId),
        rating: { $elemMatch: { id: new ObjectID(ratingId) } },
      },
      { $set },
      { returnOriginal: false },
    );
    if (!value) {
      return null;
    }
    this.dataLoader.clear(itemId);
    return value.rating.find(({ id }) => id.equals(ratingId));
  }

  async updateItem(itemId, item) {
    let rating = [];
    if (item.rating) {
      rating = item.rating.map(
        entry => ({ ...entry, id: entry.id ? new ObjectID(entry.id) : new ObjectID() }),
      );
    }
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(itemId) },
      { $set: { ...item, category: new ObjectID(item.category), rating } },
      { returnOriginal: false },
    );
    this.dataLoader.clear(itemId);
    return value;
  }

  deleteImages(itemId, images) {
    this.dataLoader.clear(itemId);
    return super.findOneAndUpdate(
      { _id: new ObjectID(itemId) },
      {
        $pull: {
          images: { $in: images },
        },
      },
    );
  }
}

export default connection => new ItemsModel(connection);
