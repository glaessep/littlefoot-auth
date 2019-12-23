export interface FollowingDefinition {
  childId: string;
  permission: string;
}

export interface UserDefinition {
  version: number;
  id: string;
  userId: string;
  type: string;
  name: string;
  email: string;
  abo: string;
  following: FollowingDefinition[];
}
