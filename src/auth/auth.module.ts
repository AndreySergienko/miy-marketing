import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { PermissionModule } from '../permission/permission.module';
import { configSecretToken } from './auth.constants';
import { TokenModule } from '../token/token.module';
import { TokenService } from '../token/token.service';
import { NodemailerModule } from '../nodemailer/nodemailer.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaxRate } from 'src/user/models/user-taxrate.model';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenService],
  exports: [AuthService],
  imports: [
    PermissionModule,
    UserModule,
    PassportModule,
    TokenModule,
    NodemailerModule,
    JwtModule.register(configSecretToken),
    SequelizeModule.forFeature([TaxRate]),
  ],
})
export class AuthModule {}
