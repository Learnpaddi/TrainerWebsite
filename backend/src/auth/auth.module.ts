import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FirebaseModule } from '../firebase/firebase.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    FirebaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}

