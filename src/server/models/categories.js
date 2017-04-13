import { ObjectID } from 'mongodb';

import Model from './model';

export const COLLECTION_NAME = 'categories';

export class CategoriesModel extends Model {
  constructor(connection) {
    super(connection, COLLECTION_NAME);
  }

  async createOne(category) {
    const attributes = category.attributes
      ? category.attributes.map(
        attribute => ({ id: new ObjectID(attribute.id || null), ...attribute }),
      )
      : [];
    const attributeGroups = category.attributeGroups
      ? category.attributeGroups.map(
        group => ({ id: new ObjectID(group.id || null), ...group }),
      )
      : [];
    const copiedCategory = { ...category, attributes, attributeGroups };
    const { insertedId } = await super.insertOne(copiedCategory);
    return insertedId ? { ...copiedCategory, _id: insertedId } : null;
  }

  async replaceOneById(categoryId, category) {
    let attributes = [];
    if (category.attributes) {
      attributes = category.attributes.map(
        attribute => ({ ...attribute, id: new ObjectID(attribute.id || null) }),
      );
    }

    let attributeGroups = [];
    if (category.attributeGroups) {
      attributeGroups = category.attributeGroups.map(
        attributeGroup => ({ ...attributeGroup, id: new ObjectID(attributeGroup.id || null) }),
      );
    }

    this.dataLoader.clear(categoryId);
    return super.replaceOneById(categoryId, { ...category, attributeGroups, attributes });
  }

  async createAttribute(categoryId, attribute) {
    const copiedAttribute = { ...attribute, id: new ObjectID() };
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(categoryId) },
      {
        $push: {
          attributes: copiedAttribute,
        },
      },
      { returnOriginal: false },
    );
    this.dataLoader.clear(categoryId);
    return value ? copiedAttribute : null;
  }

  async deleteAttribute(categoryId, attributeId) {
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(categoryId) },
      {
        $pull: {
          attributes: { id: new ObjectID(attributeId) },
        },
      },
      { returnOriginal: true },
    );

    if (!value) {
      return null;
    }
    this.dataLoader.clear(categoryId);
    return value.attributes.find(({ id }) => id.equals(attributeId));
  }

  async findAttribute(attributeId) {
    const value = await super.findOne(
      {
        'attributes.id': new ObjectID(attributeId),
      },
    );
    if (!value) {
      return null;
    }
    const attributes = value.attributes;
    return attributes.find(({ id }) => new ObjectID(attributeId).equals(id));
  }

  async updateAttribute(categoryId, attributeId, attribute) {
    const { value } = await super.findOneAndUpdate(
      {
        _id: new ObjectID(categoryId),
        attributes: { $elemMatch: { id: new ObjectID(attributeId) } },
      },
      {
        $set: { 'attributes.$.name': attribute.name },
      },
      { returnOriginal: false },
    );
    this.dataLoader.clear(categoryId);
    return value ? { ...attribute, id: attributeId } : null;
  }

  async findAttributesByIds(ids) {
    const conditionParam = ids.map(id => ({ $eq: ['$$attribute.id', new ObjectID(id)] }));
    const [result] = await super.aggregate([
      {
        $project: {
          attributes: {
            $filter: {
              input: '$attributes',
              as: 'attribute',
              cond: { $or: conditionParam },
            },
          },
        },
      },
      { $unwind: '$attributes' },
      {
        $group: {
          _id: 0,
          result: { $addToSet: '$attributes' },
        },
      },
      {
        $project: {
          _id: 0,
          attributes: '$result',
        },
      },
    ]);
    return result ? result.attributes : [];
  }

  async findAttributeGroup(attributeGroupId) {
    const value = await super.findOne(
      {
        'attributeGroups.id': new ObjectID(attributeGroupId),
      },
    );
    if (!value) {
      return null;
    }
    const attributeGroups = value.attributeGroups;
    return attributeGroups.find(({ id }) => new ObjectID(attributeGroupId).equals(id));
  }
}

export default connection => new CategoriesModel(connection);
