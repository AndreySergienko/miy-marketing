import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './auth.constants';
import { LocalStrategy } from './local.strategy';
import {SequelizeModule} from "@nestjs/sequelize";
import {Auth} from "./models/auth.model";


@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
  imports: [
      SequelizeModule.forFeature([Auth]),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
})
export class AuthModule {}
