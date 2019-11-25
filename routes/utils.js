const config = require('../config');

const requestCharge = r => (r.headers ? r.headers[config.CosmosConstants.HttpHeaders.RequestCharge] : 0);
const isError = r => (r.code ? r.code >= config.CosmosStatusCodes.BadRequest : true);

const genError = err => {
  return {
    done: false,
    data: err.stack || err.body.message || '',
    charge: requestCharge(err),
    code: err.code || config.CosmosStatusCodes.BadRequest
  };
};

const genResponse = (resp, done, charge = 0) => {
  const data = resp.resource || resp.resources;
  return {
    done,
    data,
    charge: charge + requestCharge(resp),
    code: resp.statusCode || done ? config.CosmosStatusCodes.Ok : config.CosmosStatusCodes.BadRequest
  };
};

module.exports = {
  requestCharge,
  isError,
  genError,
  genResponse
};
