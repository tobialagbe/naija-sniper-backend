import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/entities/user.entity';
import { Tournament, TournamentSchema } from '../tournament/entities/tournament.entity';
import { Bounty, BountySchema } from '../bounty/entities/bounty.entity';
import { BountyWinner, BountyWinnerSchema } from '../bounty/entities/bounty-winner.entity';
import { Leaderboard, LeaderboardSchema } from '../tournament/entities/leaderboard.entity';
import { UserPerk, UserPerkSchema } from '../perks/entities/user-perk.entity';
import { SeederService } from './seeder.service';
import { UserSeeder } from './user.seeder';
import { TournamentSeeder } from './tournament.seeder';
import { BountySeeder } from './bounty.seeder';
import { LeaderboardSeeder } from './leaderboard.seeder';
import { UserPerkSeeder } from './user-perk.seeder';
import { UserModule } from '../user/user.module';
import { TournamentModule } from '../tournament/tournament.module';
import { BountyModule } from '../bounty/bounty.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tournament.name, schema: TournamentSchema },
      { name: Bounty.name, schema: BountySchema },
      { name: BountyWinner.name, schema: BountyWinnerSchema },
      { name: Leaderboard.name, schema: LeaderboardSchema },
      { name: UserPerk.name, schema: UserPerkSchema },
    ]),
    UserModule,
    TournamentModule,
    BountyModule,
  ],
  providers: [
    SeederService, 
    UserSeeder, 
    TournamentSeeder, 
    BountySeeder, 
    LeaderboardSeeder,
    UserPerkSeeder
  ],
  exports: [SeederService],
})
export class SeederModule {} 