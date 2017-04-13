import * as mongo from 'mongodb';

export default function getConnection(databaseName) {
  return mongo.MongoClient.connect(`mongodb://mongo:27017/${databaseName}`);
}

export async function cleanup(connection) {
  const database = await connection;
  return database.dropDatabase();
}
