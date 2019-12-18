
import { JwtSecret } from './secrets';
import { sign as _sign, verify as _verify, VerifyErrors, SignOptions, VerifyOptions } from 'jsonwebtoken';

export { JsonWebTokenError, TokenExpiredError, NotBeforeError, VerifyErrors, SignOptions, VerifyOptions } from 'jsonwebtoken';


export class SignResult {
  readonly err: Error;
  readonly encoded: string;

  constructor(err: Error, encoded: string) {
    this.err = err;
    this.encoded = encoded;
  }
};

export class VerifyResult {
  readonly err: VerifyErrors;
  readonly decoded: object | string;

  constructor(err: VerifyErrors, decoded: object | string) {
    this.err = err;
    this.decoded = decoded;
  }
};


export async function sign(payload: string | Buffer | object, options: SignOptions): Promise<SignResult> {
  const o = options;
  o.algorithm = 'HS256';
  o.expiresIn = '1h';
  return await new Promise<SignResult>((resolve, _reject) => {
    _sign(payload, JwtSecret, o, (err, encoded) => {
      resolve(new SignResult(err, encoded));
    });
  });
}


export async function verify(token: string, options: VerifyOptions): Promise<VerifyResult> {
  return await new Promise<VerifyResult>((resolve, _reject) => {
    _verify(token, JwtSecret, options, (err, decoded) => {
      resolve(new VerifyResult(err, decoded));
    });
  });
}

