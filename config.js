const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.DB_ENDPOINT; // Add your endpoint
const key = process.env.DB_MASTER_KEY; // Add the masterkey of the endpoint
const client = new CosmosClient({ endpoint, key });

const databaseID = process.env.DB_DATABASE_ID;
const ChildrenContainerID = process.env.DB_CONTAINER_CHILDREN;
const UsersContainerID = process.env.DB_CONTAINER_USERS;

const database = client.database(databaseID);

module.exports = {
  ChildrenContainerID,
  UsersContainerID,
  database
};
