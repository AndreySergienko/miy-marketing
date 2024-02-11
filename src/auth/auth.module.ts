import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './auth.constants';
import { LocalStrategy } from './local.strategy';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
})
export class AuthModule {}
