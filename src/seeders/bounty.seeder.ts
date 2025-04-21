import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bounty } from '../bounty/entities/bounty.entity';

@Injectable()
export class BountySeeder {
  constructor(
    @InjectModel(Bounty.name) private bountyModel: Model<Bounty>,
  ) {}

  async seed() {
    const bounties = [
      {
        name: 'Fortnite Victory Royale Bounty',
        description: 'Get a Victory Royale in Fortnite Battle Royale',
        reward: 50,
        amount: 50,
        numberOfWinners: 5,
        startDate: new Date('2024-04-15T00:00:00Z'),
        endDate: new Date('2024-04-22T23:59:59Z'),
        killCount: 10,
        game: 'Fortnite',
        platform: 'PC',
        active: true,
      },
      {
        name: 'Call of Duty Kill Streak Challenge',
        description: 'Achieve a 10-kill streak in Call of Duty: Warzone',
        reward: 75,
        amount: 75,
        numberOfWinners: 3,
        startDate: new Date('2024-04-20T00:00:00Z'),
        endDate: new Date('2024-04-27T23:59:59Z'),
        killCount: 10,
        game: 'Call of Duty: Warzone',
        platform: 'Cross-Platform',
        active: true,
      },
      {
        name: 'Valorant Ace Challenge',
        description: 'Get an Ace (5 kills in one round) in Valorant',
        reward: 100,
        amount: 100,
        numberOfWinners: 2,
        startDate: new Date('2024-04-25T00:00:00Z'),
        endDate: new Date('2024-05-02T23:59:59Z'),
        killCount: 5,
        game: 'Valorant',
        platform: 'PC',
        active: false,
      },
    ];

    // Clear existing bounties
    await this.bountyModel.deleteMany({});
    
    // Insert new bounties
    await this.bountyModel.insertMany(bounties);
    
    console.log('Bounty seeding completed');
  }
} 