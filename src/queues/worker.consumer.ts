import { Processor } from '@nestjs/bull';

@Processor('worker')
export class WorkerConsumer {}
