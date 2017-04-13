import express from 'express';
import React from 'react';
import { createMemoryHistory, match, RouterContext } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import winston from 'winston';
import 'isomorphic-fetch';
import config from './config';

import graphqlRouter from './routes/graphql';
import { setupIndexes, seed } from './models/initialize-database';

injectTapEventPlugin();

const app = express();
app.use(graphqlRouter);

app.listen(config.port, '0.0.0.0', async () => {
  await setupIndexes();
  await seed();
});
