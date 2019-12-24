export interface FollowerDefinition {
  /** Is childId or userId */
  id: string;
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
  following: FollowerDefinition[];
}
