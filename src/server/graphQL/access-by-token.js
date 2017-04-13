import createUsersModel from '../models/user';
import connection from '../models/database';

const User = createUsersModel(connection);

async function isUser(token) {
  if (!token) {
    return null;
  }
  return User.findOne({ token });
}

async function apolloExpressAccessByToken(req, res, next) {
  const tokenData = req.get('Token');
  if (!tokenData) {
    res.sendStatus(403).end();
  } else if (await isUser(tokenData)) {
    if (req.body.query && req.body.query.includes('mutation')) {
      res.sendStatus(403).end();
    } else {
      next();
    }
  } else {
    res.sendStatus(403).end();
  }
}

export default apolloExpressAccessByToken;
