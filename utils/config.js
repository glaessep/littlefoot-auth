const { CosmosClient, Constants, StatusCodes } = require('@azure/cosmos');

const endpoint = process.env.DB_ENDPOINT; // Add your endpoint
const key = process.env.DB_MASTER_KEY; // Add the masterkey of the endpoint
const client = new CosmosClient({ endpoint, key });

const DatabaseId = process.env.DB_DATABASE_ID;
const AuthContainerId = process.env.DB_CONTAINER_AUTH;
const ChildrenContainerId = process.env.DB_CONTAINER_CHILDREN;
const UsersContainerId = process.env.DB_CONTAINER_USERS;
const TokenSecret = process.env.TOKEN_SECRET; // generated at https://mkjwk.org/

const database = client.database(DatabaseId);
const CosmosConstants = Constants;

module.exports = {
  TokenSecret,
  AuthContainerId,
  ChildrenContainerId,
  UsersContainerId,
  database,
  CosmosConstants,
  StatusCodes
};
