import { Module } from '@nestjs/common';
import { DisasterService } from './disaster.service';
import { DisasterController } from './disaster.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ProgramsModule } from '../programs/programs.module';

@Module({
  imports: [WalletsModule, TransactionsModule, ProgramsModule],
  providers: [DisasterService],
  controllers: [DisasterController],
})
export class DisasterModule {}
