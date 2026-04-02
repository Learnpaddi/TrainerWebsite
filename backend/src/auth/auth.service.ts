import { Injectable } from '@nestjs/common';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private firebaseAdmin: FirebaseAdminService,
    private jwtService: JwtService,
  ) {}

  async validateFirebaseToken(idToken: string): Promise<any> {
    const decodedToken = await this.firebaseAdmin.verifyIdToken(idToken);
    const userDoc = await this.firebaseAdmin.firebase.firestore.collection('users').doc(decodedToken.uid).get();
    let roles = [];
    let tenantId = null;
    if (userDoc.exists) {
      const userData = userDoc.data();
      roles = userData.roles || [];
      tenantId = userData.tenantId;
    }
    return { uid: decodedToken.uid, email: decodedToken.email, roles, tenantId };
  }

  async login(user: any) {
    const payload = { 
      uid: user.uid, 
      email: user.email, 
      roles: user.roles || [],
      tenantId: user.tenantId,
      sub: user.uid 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

