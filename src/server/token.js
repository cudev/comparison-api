import winston from 'winston';
import bcrypt from 'bcrypt';

import createUsersModel from './models/user';
import connection from './models/database';

const User = createUsersModel(connection);

const args = process.argv;

function createToken(siteName) {
  bcrypt.hash(siteName, 10, async (error, hash) => {
    if (error) {
      winston.error(error);
      return;
    }
    const { ops } = await User.insertOne({ username: siteName, token: hash });
    winston.info('Added site', ops[0]);
  });
}

async function deleteToken(siteName, token) {
  const { value } = await User.findOneAndDelete({ username: siteName, token });
  winston.info('Deleted site', value);
  return value;
}

switch (args[2]) {
  case 'createToken':
    createToken(args[3]);
    break;
  case 'deleteToken':
    deleteToken(args[3], args[4]);
    break;
  default:
    break;
}
