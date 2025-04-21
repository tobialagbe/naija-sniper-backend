import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { Bounty, BountySchema } from './entities/bounty.entity';
import { BountyWinner, BountyWinnerSchema } from './entities/bounty-winner.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bounty.name, schema: BountySchema },
      { name: BountyWinner.name, schema: BountyWinnerSchema },
    ]),
    UserModule,
  ],
  controllers: [BountyController],
  providers: [BountyService],
  exports: [BountyService],
})
export class BountyModule {} 