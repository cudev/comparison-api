# Comparison-api

## What?
This application serves as a flexible back-end server to handle any needs of Comparison-alpha repository. 
Principally it is used for interacting with MongoDB within GraphQL query language.

It is written in Nodejs, Expressjs, MongoDb GraphQL and relies on a number of third party dependencies listed in package.json.

## How?

### Requirements
- MongoDb
- NodeJs
- Yarn

### Setup
It's necessary to install all dependencies before launching the project:
```bash
yarn
```

Configure database connection by changing environmental variables in start script (package.json). By default will be used settings listed in src/server/config.js.

And run:
```bash
yarn start
```

## Copyright and license
Code and documentation copyright 2017 Cudev Ltd. Code released under [the MIT license](https://github.com/cudev/browser-games-portal/blob/master/LICENSE).