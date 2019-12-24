import { AuthAccountDefinition } from './AuthAccountDefinition';
import uuid from 'uuid/v4';

export class AuthAccount implements AuthAccountDefinition {
  version: number;
  email: string;
  emailVerified: boolean;
  verifySecret: string;
  encrypted: string;
  userId: string;

  constructor(mail: string, encrypted: string, userId: string, emailVerified = false) {
    this.version = AuthAccount.version();
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
