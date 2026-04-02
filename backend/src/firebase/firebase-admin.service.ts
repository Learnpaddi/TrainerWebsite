import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Injectable()
export class FirebaseAdminService {
  constructor(public firebaseService: FirebaseService) {}

  async verifyIdToken(token: string) {
    return await this.firebaseService.auth.verifyIdToken(token);
  }

  async createCustomToken(uid: string, claims = {}) {
    return await this.firebaseService.auth.createCustomToken(uid, claims);
  }
}

