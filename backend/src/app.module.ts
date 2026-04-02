import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    FirebaseModule,  // Firebase Admin SDK
    AuthModule,
    CoursesModule,
    PaymentsModule,
    UsersModule,
    TenantsModule,
  ],
  exports: [TenantsModule],
})
export class AppModule {}

