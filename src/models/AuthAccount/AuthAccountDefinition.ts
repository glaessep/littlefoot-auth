import uuid from 'uuid/v4';

export class AuthAccountDefinition {
  version: number;
  email: string;
  emailVerified: boolean;
  verifySecret: string;
  encrypted: string;
  userId: string;

  constructor(mail: string, encrypted: string, userId: string, emailVerified = false) {
    this.version = AuthAccountDefinition.version();
    this.email = mail;
    this.emailVerified = emailVerified;
    this.verifySecret = uuid();
    this.encrypted = encrypted;
    this.userId = userId;
  }

  static version(): number {
    return 1;
  }
}
