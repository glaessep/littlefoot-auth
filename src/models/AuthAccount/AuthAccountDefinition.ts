export interface AuthAccountDefinition {
  version: number;
  email: string;
  emailVerified: boolean;
  verifySecret: string;
  encrypted: string;
  userId: string;
}
