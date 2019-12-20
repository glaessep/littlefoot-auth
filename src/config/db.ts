import { CosmosClient } from '@azure/cosmos';

export const DatabaseId: string = process.env.DB_DATABASE_ID;
export const AuthContainerId: string = process.env.DB_CONTAINER_AUTH;
export const ChildrenContainerId: string = process.env.DB_CONTAINER_CHILDREN;
export const UsersContainerId: string = process.env.DB_CONTAINER_USERS;

export const client = new CosmosClient({
  endpoint: process.env.DB_ENDPOINT,
  key: process.env.DB_MASTER_KEY,
});

export const ResourceTokenExpirySeconds: number = Number.parseInt(process.env.DB_TOKEN_EXPIRY_SECONDS);
