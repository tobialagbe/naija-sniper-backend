import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KillStreakService } from './kill-streak.service';
import { KillStreakController } from './kill-streak.controller';
import { TimedChallenge, TimedChallengeSchema } from './entities/timed-challenge.entity';
import { StreakSubmission, StreakSubmissionSchema } from './entities/streak-submission.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimedChallenge.name, schema: TimedChallengeSchema },
      { name: StreakSubmission.name, schema: StreakSubmissionSchema },
    ]),
    UserModule,
  ],
  controllers: [KillStreakController],
  providers: [KillStreakService],
  exports: [KillStreakService],
})
export class KillStreakModule {} 