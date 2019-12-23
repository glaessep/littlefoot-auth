import { CosmosClient } from '@azure/cosmos';
import { ContainerDefinition } from '../common/ContainerDefinition';

export const client = new CosmosClient({
  endpoint: process.env.DB_ENDPOINT,
  key: process.env.DB_MASTER_KEY,
});

export const DatabaseId: string = process.env.DB_DATABASE_ID;

export const AuthContainer = new ContainerDefinition(
  process.env.DB_CONTAINER_AUTH,
  'email',
  client.database(DatabaseId).container(process.env.DB_CONTAINER_AUTH).url,
);

export const ChildrenContainer = new ContainerDefinition(
  process.env.DB_CONTAINER_CHILDREN,
  'childId',
  client.database(DatabaseId).container(process.env.DB_CONTAINER_CHILDREN).url,
);

export const UsersContainer = new ContainerDefinition(
  process.env.DB_CONTAINER_USERS,
  'userId',
  client.database(DatabaseId).container(process.env.DB_CONTAINER_USERS).url,
);

// export const AuthContainerId: string = process.env.DB_CONTAINER_AUTH;
// export const ChildrenContainerId: string = process.env.DB_CONTAINER_CHILDREN;
// export const UsersContainerId: string = process.env.DB_CONTAINER_USERS;

export const ResourceTokenExpirySeconds: number = Number.parseInt(process.env.DB_TOKEN_EXPIRY_SECONDS);
export const MaxAttemptsDbUser: number = Number.parseInt(process.env.MAX_ATTEMPTS_DB_USER);
