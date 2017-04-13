export default function apolloExpressFileUpload(options) {
  function isUpload(req) {
    return req.baseUrl === options.endpointURL
      && req.method === 'POST'
      && req.is('multipart/form-data');
  }

  return (req, res, next) => {
    if (!isUpload(req)) {
      return next();
    }

    const body = req.body;
    const variables = JSON.parse(body.variables);

    // append files to variables
    if (Object.keys(req.files).length) {
      req.files[Object.keys(req.files)[0]].forEach((file) => {
        if (!variables[file.fieldname]) {
          variables[file.fieldname] = [];
        }
        variables[file.fieldname].push(file);
      });
    } else {
      variables.images = [];
    }

    req.body = { // eslint-disable-line no-param-reassign
      operationName: body.operationName,
      query: body.query,
      variables,
    };
    return next();
  };
}
