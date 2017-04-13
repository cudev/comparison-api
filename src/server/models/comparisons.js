import { ObjectID } from 'mongodb';

import createCategoriesModel from './categories';
import createItemsModel from './items';
import Model from './model';

export const COLLECTION_NAME = 'comparisons';

export class ComparisonsModel extends Model {
  constructor(connection) {
    super(connection, COLLECTION_NAME);
    this.categoriesModel = createCategoriesModel(connection);
    this.itemsModel = createItemsModel(connection);
  }

  async addItem(comparisonId, itemId) {
    const item = await this.itemsModel.findOneById(itemId);
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(comparisonId) },
      {
        $push: {
          items: itemId,
        },
      },
    );
    this.dataLoader.clear(comparisonId);
    return value ? item : null;
  }

  async removeItem(comparisonId, itemId) {
    const item = await this.itemsModel.findOneById(itemId);
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(comparisonId) },
      {
        $pull: {
          items: itemId,
        },
      },
      { returnOriginal: false },
    );
    this.dataLoader.clear(comparisonId);
    return value ? item : null;
  }

  async findAttributeById(attributeId) {
    const { attributes } = await this.categoriesModel.findOne({
      'attributes.id': new ObjectID(attributeId),
    });

    return attributes.find(element => element.id.equals(attributeId));
  }

  async addAttribute(comparisonId, attributeId) {
    const attribute = await this.findAttributeById(attributeId);
    if (!attribute) {
      return null;
    }

    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(comparisonId) },
      {
        $push: {
          attributes: attributeId,
        },
      },
      { returnOriginal: false },
    );
    this.dataLoader.clear(comparisonId);
    return value ? attribute : null;
  }

  async removeAttribute(comparisonId, attributeId) {
    const attribute = await this.findAttributeById(attributeId);
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(comparisonId) },
      {
        $pull: {
          attributes: attributeId,
        },
      },
      { returnOriginal: false },
    );
    this.dataLoader.clear(comparisonId);
    return value ? attribute : null;
  }

  async findOneAndUpdate(comparisonId, comparison) {
    let items = [];
    if (comparison.items) {
      items = comparison.items.map(entry => new ObjectID(entry));
    }

    let attributes = [];
    if (comparison.attributes) {
      attributes = comparison.attributes.map(entry => new ObjectID(entry));
    }
    const { value } = await super.findOneAndUpdate(
      { _id: new ObjectID(comparisonId) },
      { $set: { ...comparison, items, attributes } },
      { returnOriginal: false },
    );
    this.dataLoader.clear(comparisonId);
    return value;
  }
}

export default connection => new ComparisonsModel(connection);
