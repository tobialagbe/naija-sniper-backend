import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { TournamentSeeder } from './tournament.seeder';
import { BountySeeder } from './bounty.seeder';
import { LeaderboardSeeder } from './leaderboard.seeder';
import { UserPerkSeeder } from './user-perk.seeder';

@Injectable()
export class SeederService {
  constructor(
    private readonly userSeeder: UserSeeder,
    private readonly tournamentSeeder: TournamentSeeder,
    private readonly bountySeeder: BountySeeder,
    private readonly leaderboardSeeder: LeaderboardSeeder,
    private readonly userPerkSeeder: UserPerkSeeder,
  ) {}

  async seed() {
    try {
      console.log('Seeding users...');
      await this.userSeeder.seed();
      console.log('Users seeded successfully!');
      
      console.log('Seeding tournaments...');
      await this.tournamentSeeder.seed();
      console.log('Tournaments seeded successfully!');
      
      console.log('Seeding bounties...');
      await this.bountySeeder.seed();
      console.log('Bounties seeded successfully!');
      
      console.log('Seeding leaderboards...');
      await this.leaderboardSeeder.seed();
      console.log('Leaderboards seeded successfully!');
      
      console.log('Seeding user perks...');
      await this.userPerkSeeder.seed();
      console.log('User perks seeded successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
} 