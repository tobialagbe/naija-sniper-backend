import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { Tournament, TournamentSchema } from './entities/tournament.entity';
import { Leaderboard, LeaderboardSchema } from './entities/leaderboard.entity';
import { Registration, RegistrationSchema } from './entities/registration.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: Leaderboard.name, schema: LeaderboardSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    UserModule,
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentModule {} 