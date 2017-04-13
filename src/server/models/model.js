import { ObjectID } from 'mongodb';
import winston from 'winston';
import DataLoader from 'dataloader';
import md5 from 'blueimp-md5';
import path from 'path';
import * as fs from 'async-file';

const pathTo = {
  client: path.normalize(`${__dirname}/../../client`),
  images: path.normalize(`${__dirname}/../../client/images`),
};

export default class Model {
  constructor(connection, name) {
    this.connection = connection;
    this.name = name;
    this.collection = null;
    this.dataLoader = new DataLoader(this.findManyByIds.bind(this));
    this.pathToEntity = `${pathTo.images}/${name}`;
  }

  async getCollection() {
    if (this.collection === null) {
      try {
        const database = await this.connection;
        this.collection = await database.collection(this.name);
      } catch (error) {
        winston.error(error);
      }
    }
    return this.collection;
  }

  async runCommand(command, ...rest) {
    const collection = await this.getCollection();
    return collection[command](...rest);
  }

  // 1:1 method mappings with mongodb-native collection to use internally:
  find(query) {
    return this.runCommand('find', query);
  }

  findOne(query, options) {
    return this.runCommand('findOne', query, options);
  }

  async insertOne(document, options) {
    return this.runCommand('insertOne', document, options);
  }

  async insertMany(documents, options) {
    return this.runCommand('insertMany', documents, options);
  }

  findOneAndUpdate(query, document, options) {
    return this.runCommand('findOneAndUpdate', query, document, options);
  }

  findOneAndDelete(query, options) {
    return this.runCommand('findOneAndDelete', query, options);
  }

  findOneAndReplace(query, document, options) {
    return this.runCommand('findOneAndReplace', query, document, options);
  }

  deleteMany(query, options) {
    return this.runCommand('deleteMany', query, options);
  }

  async aggregate(query) {
    const collection = await this.getCollection();
    const cursor = await collection.aggregate(query);
    return cursor.toArray();
  }

  // MongoDB method wrappers to avoid boilerplate:
  async findAll() {
    const cursor = await this.find();
    return cursor.toArray();
  }

  async getItemsCursor(query) {
    if (!query) {
      return this.find();
    }
    return this.find({
      $or: [
        { $text: { $search: query } },
        { 'name.content': { $regex: new RegExp(query, 'i') } },
      ],
    });
  }

  async getComparisonsCursor(query, ids) {
    if (!query) {
      return this.find();
    }
    const objectIds = ids.map(ObjectID);
    return this.find({
      $or: [
        { $text: { $search: query } },
        { 'title.content': { $regex: new RegExp(query, 'i') } },
        { items: { $in: objectIds } },
      ],
    });
  }

  findOneById(id) {
    return this.dataLoader.load(id);
  }

  async findManyByIds(ids) {
    const objectIds = ids.map(ObjectID);
    const cursor = await this.find({ _id: { $in: objectIds } });
    const resolved = await cursor.toArray();
    const finalResult = ids.map(id => resolved.find(resolve => resolve._id.equals(id)));
    return Promise.resolve(finalResult);
  }

  async findManyByQuery(query) {
    const cursor = await this.find(query);
    return cursor.toArray();
  }

  async deleteOneById(id) {
    const { value: deleted } = await this.findOneAndDelete({ _id: new ObjectID(id) });
    if (deleted) {
      this.dataLoader.clear(id);
    }
    return deleted || null;
  }

  async deleteManyById(ids) {
    const query = { _id: { $in: ids.map(ObjectID) } };
    const cursor = await this.find(query);
    const deleted = await cursor.toArray();
    await this.deleteMany(query);
    ids.map(id => this.dataLoader.clear(id));
    return deleted;
  }

  async replaceOneById(id, document) {
    const { value: replaced } = await this.findOneAndReplace(
      { _id: new ObjectID(id) },
      document,
      { returnOriginal: false },
    );
    if (replaced) {
      this.dataLoader.clear(id);
    }
    return replaced || null;
  }

  static getBuffer(filePath) {
    return fs.readFile(filePath);
  }

  static async getImageName(image) {
    const buffer = await Model.getBuffer(image.path);
    return md5(buffer) + path.extname(image.originalname);
  }

  async saveImages(entityId, images) {
    const entityPromises = images.map(async (image) => {
      const buffer = await Model.getBuffer(image.path);
      const imageName = await Model.getImageName(image);

      this.saveImage(buffer, imageName, entityId);
      const { value } = await this.findOneAndUpdate(
        { _id: new ObjectID(entityId) },
        {
          $push: {
            images: imageName,
          },
        },
        { returnOriginal: false },
      );
      return value;
    });
    return entityPromises.pop();
  }

  async saveImage(data, imageName, entityId) {
    const pathToImageFolder = `${this.pathToEntity}/${entityId}`;

    if (!await fs.exists(this.pathToEntity)) {
      try {
        await fs.mkdirp(this.pathToEntity);
      } catch (error) {
        winston.error(error);
      }
    }

    if (!await fs.exists(pathToImageFolder)) {
      try {
        await fs.mkdirp(pathToImageFolder);
      } catch (error) {
        winston.error(error);
      }
    }

    try {
      await fs.writeFile(`${pathToImageFolder}/${imageName}`, data);
    } catch (error) {
      winston.error(error);
    }
  }

  async deleteDirectoryById(entityId) {
    const pathToImageFolder = `${this.pathToEntity}/${entityId}`;
    try {
      await fs.delete(pathToImageFolder);
    } catch (error) {
      winston.error(error);
    }
  }

  static async deleteFileByName(imageName) {
    const pathToImage = `${pathTo.client}${imageName}`;
    try {
      await fs.unlink(pathToImage);
    } catch (error) {
      winston.error(error);
    }
  }
}
