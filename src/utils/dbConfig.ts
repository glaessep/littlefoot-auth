import { CosmosClient, Constants as CosmosConstants } from '@azure/cosmos';


const endpoint: string = process.env.DB_ENDPOINT; // Add your endpoint
const key: string = process.env.DB_MASTER_KEY; // Add the masterkey of the endpoint
export const DatabaseId: string = process.env.DB_DATABASE_ID;
export const AuthContainerId: string = process.env.DB_CONTAINER_AUTH;
export const ChildrenContainerId: string = process.env.DB_CONTAINER_CHILDREN;
export const UsersContainerId: string = process.env.DB_CONTAINER_USERS;

export const dbClient = new CosmosClient({ endpoint, key });
export const database = dbClient.database(DatabaseId);

export { CosmosConstants };

export class DbResult<TData> {
  constructor(readonly success: boolean, readonly data: TData, readonly charge: number, readonly code: number) { }
}