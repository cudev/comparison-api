import Model from './model';

export const COLLECTION_NAME = 'users';

export class UsersModel extends Model {
  constructor(connection) {
    super(connection, COLLECTION_NAME);
  }
}

export default connection => new UsersModel(connection);
