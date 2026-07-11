import { Module } from '@nestjs/common';
import { TransparencyService } from './transparency.service';
import { TransparencyController } from './transparency.controller';

@Module({
  providers: [TransparencyService],
  controllers: [TransparencyController],
})
export class TransparencyModule {}
