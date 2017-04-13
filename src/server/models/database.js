import * as mongo from 'mongodb';

import config from '../config';

export default mongo.MongoClient.connect(`mongodb://${config.host}:${config.mongoPort}/comparisons`);
