import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private firebaseAdmin: FirebaseAdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request: any, rawJwtToken: any, done: any) =>
        this.firebaseAdmin.verifyIdToken(rawJwtToken).then(
          (decoded) => done(null, decoded),
          (err) => done(err, false),
        ),
    });
  }

  async validate(payload: any) {
    if (!payload.uid) {
      throw new UnauthorizedException();
    }
    return {
      uid: payload.uid, 
      email: payload.email,
      roles: payload.roles || [],
      tenantId: payload.tenantId 
    };
  }
}

