import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { PermissionModule } from '../permission/permission.module';
import { configSecretToken } from './auth.constants';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
  imports: [
    PermissionModule,
    UserModule,
    PassportModule,
    JwtModule.register(configSecretToken),
  ],
})
export class AuthModule {}
