import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Status } from './models/status.model';

@Module({
  providers: [StatusService],
  imports: [SequelizeModule.forFeature([Status])],
})
export class StatusModule {}
