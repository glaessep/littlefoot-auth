import { JwtSecret } from './secrets';
import { sign as _sign, verify as _verify, VerifyErrors, SignOptions, VerifyOptions } from 'jsonwebtoken';

export {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
  VerifyErrors,
  SignOptions,
  VerifyOptions,
} from 'jsonwebtoken';

export class SignResult {
  constructor(readonly err: Error, readonly encoded: string) {}
}

export class VerifyResult {
  constructor(readonly err: VerifyErrors, readonly decoded: object | string) {}
}

export class Jwt {
  static async sign(payload: string | Buffer | object, options: SignOptions): Promise<SignResult> {
    const o = options;
    o.algorithm = 'HS256';
    o.expiresIn = '5h';
    return await new Promise<SignResult>((resolve, _reject) => {
      _sign(payload, JwtSecret, o, (err, encoded) => {
        resolve(new SignResult(err, encoded));
      });
    });
  }

  static async verify(token: string, options: VerifyOptions): Promise<VerifyResult> {
    return await new Promise<VerifyResult>((resolve, _reject) => {
      _verify(token, JwtSecret, options, (err, decoded) => {
        resolve(new VerifyResult(err, decoded));
      });
    });
  }
}
