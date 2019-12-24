import { Result, Id } from '../../common';
import { AuthAccount } from './AuthAccount';
export class AuthAccountResult extends Result<AuthAccount & Id> {}
