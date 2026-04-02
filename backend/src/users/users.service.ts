import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private firebase: FirebaseService) {}

  async findAll(tenantId?: string) {
    return await this.firebase.getDocuments('users', tenantId);
  }

  async findOne(uid: string, tenantId?: string) {
    return await this.firebase.getDocument('users', uid, tenantId);
  }

  async update(uid: string, updateData: any, tenantId?: string) {
    return await this.firebase.firestore.collection('users').doc(uid).update(updateData);
  }
}

