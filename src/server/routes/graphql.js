import { Router } from 'express';
import { apolloExpress, graphiqlExpress } from 'apollo-server';
import bodyParser from 'body-parser';
import multer from 'multer';

import connection from '../models/database';
import executableSchema from '../graphQL';
import createCategoriesModel from '../models/categories';
import createItemsModel from '../models/items';
import createComparisonsModel from '../models/comparisons';
import accessByToken from '../graphQL/access-by-token';

const graphqlRouter = new Router({ mergeParams: true });
const upload = multer({ dest: '/tmp/uploads' });

const config = { endpointURL: '/graphql' };

graphqlRouter.use(
  config.endpointURL,
  bodyParser.json(),
  upload.fields([{ name: 'images' }, { name: 'image' }]),
  accessByToken,
  apolloExpress({
    schema: executableSchema,
    context: {
      categoriesModel: createCategoriesModel(connection),
      itemsModel: createItemsModel(connection),
      comparisonsModel: createComparisonsModel(connection),
    },
  }),
);

graphqlRouter.use(
  '/graphiql',
  (req, res, next) => {
    if (!req.user) {
      res.redirect('/login');
    } else {
      next();
    }
  },
  graphiqlExpress(config),
);

export default graphqlRouter;
