const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.DB_ENDPOINT; // Add your endpoint
const key = process.env.DB_MASTER_KEY; // Add the masterkey of the endpoint
const client = new CosmosClient({ endpoint, key });

const databaseId = process.env.DB_DATABASE_ID;
const AccountsContainerId = process.env.DB_CONTAINER_ACCOUNTS;
const ChildrenContainerId = process.env.DB_CONTAINER_CHILDREN;
const UsersContainerId = process.env.DB_CONTAINER_USERS;

const database = client.database(databaseId);

module.exports = {
  AccountsContainerId,
  ChildrenContainerId,
  UsersContainerId,
  database
};
