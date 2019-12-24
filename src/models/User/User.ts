import { UserDefinition, FollowerDefinition } from './UserDefinition';
import uuid from 'uuid/v4';
export class User implements UserDefinition {
  /** implements { @link UserDefinition } */
  version: number;
  id: string;
  userId: string;
  type: string;
  name: string;
  email: string;
  abo: string;
  following: FollowerDefinition[];

  constructor(email: string, name: string, abo: string, userId: string = uuid()) {
    this.version = User.version();
    this.id = userId;
    this.userId = userId;
    this.type = User.type();
    this.name = name;
    this.email = email;
    this.abo = abo;
    this.following = [];
  }

  static version(): number {
    return 1;
  }
  static type(): string {
    return 'user';
  }
}
