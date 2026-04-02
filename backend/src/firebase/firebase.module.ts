import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseAdminService } from './firebase-admin.service';

@Module({
  providers: [FirebaseService, FirebaseAdminService],
  exports: [FirebaseService, FirebaseAdminService],
})
export class FirebaseModule {}

