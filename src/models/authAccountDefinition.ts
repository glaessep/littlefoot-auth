import uuid4 from 'uuid/v4';

// Container Definition
// const container = {
//   name: 'auth',
//   partitionKey: 'email',
//   uniqueKey: 'email'
// };

export default class AuthAccountDefinition {
  readonly version: number;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly verifySecret: string;
  readonly encrypted: string;
  readonly userId: string;

  constructor(mail: string, encrypted: string, userId: string, version = AuthAccountDefinition.version(), emailVerified=false, verifySecret = uuid4()) {
    this.version = version;
    this.email = mail;
    this.emailVerified = emailVerified;
    this.verifySecret = verifySecret;
    this.encrypted = encrypted;
    this.userId = userId;
  }

  static version(): number { return 1; }

  verify(verifySecret: string): AuthAccountDefinition {
    if (verifySecret === this.verifySecret) {
      return new AuthAccountDefinition(this.email, this.encrypted, this.userId, this.version, true, this.verifySecret);
    }
    return null;
  }
}
