// Container Definition
// const container = {
//   name: 'users',
//   partitionKey: 'userId'
// };

export default class UserDefinition {
  version: number;
  id: string;
  userId: string;
  type: string;
  name: string;
  email: string;
  abo: string;
  following: {
    childId: string;
    permission: string;
  }[];

  constructor(userId: string, email: string, name: string, abo: string) {
    this.version = UserDefinition.version();
    this.id = userId;
    this.userId = userId;
    this.type = UserDefinition.type();
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
