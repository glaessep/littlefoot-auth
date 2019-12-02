const config = require('../utils/config');

function requestCharge(r) {
  return r.headers ? r.headers[config.CosmosConstants.HttpHeaders.RequestCharge] : 0.0;
}

function isDBError(r) {
  return r.code ? r.code >= config.StatusCodes.BadRequest : true;
}

function genDBResult(success, data, charge, code) {
  return {
    success,
    data,
    charge: Number(charge),
    code
  };
}

function genDBError(err) {
  return genDBResult(false, err.stack || err.body.message || '', requestCharge(err), err.code || config.StatusCodes.BadRequest);
}

function genDBResponse(success, resp, charge = 0.0) {
  return genDBResult(
    success,
    resp.resource || resp.resources,
    charge || requestCharge(resp),
    resp.statusCode || (success ? config.StatusCodes.Ok : config.StatusCodes.BadRequest)
  );
}

module.exports = {
  requestCharge,
  isDBError,
  genDBResult,
  genDBError,
  genDBResponse
};
