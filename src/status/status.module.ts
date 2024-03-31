import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Status } from './models/status.model';
import { Channel } from '../channels/models/channels.model';
import { Slots } from '../slots/models/slots.model';

@Module({
  providers: [StatusService],
  imports: [SequelizeModule.forFeature([Status, Channel, Slots])],
})
export class StatusModule {}
