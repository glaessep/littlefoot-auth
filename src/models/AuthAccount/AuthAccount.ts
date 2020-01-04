import { AuthAccountDefinition } from 'littlefoot-api';
import uuid4 from 'uuid/v4';

export class AuthAccount implements AuthAccountDefinition {
  id?: string;
  versoin: number;
  email: string;
  emailVerified: boolean;
  verifySecret: string;
  encrypted: string;
  userId: string;

  constructor(email: string, encrypted: string, userId: string, emailVerified = false) {
    this.versoin = AuthAccount.version();
    this.email = email;
    this.emailVerified = emailVerified;
    this.verifySecret = uuid4();
    this.encrypted = encrypted;
    this.userId = userId;
  }
  static version(): number {
    return 1;
  }
}
