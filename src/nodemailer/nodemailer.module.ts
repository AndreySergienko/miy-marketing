import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Mail } from './model/nodemailer.model';
import { User } from '../user/models/user.model';

@Module({
  providers: [NodemailerService],
  exports: [NodemailerService],
  imports: [SequelizeModule.forFeature([Mail, User])],
})
export class NodemailerModule {}
