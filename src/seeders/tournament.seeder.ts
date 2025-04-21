import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from '../tournament/entities/tournament.entity';

@Injectable()
export class TournamentSeeder {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
  ) {}

  async seed() {
    const tournaments = [
      {
        name: 'Weekly Fortnite Tournament',
        description: 'Join our weekly Fortnite tournament for a chance to win amazing prizes!',
        startDate: new Date('2024-04-15T10:00:00Z'),
        endDate: new Date('2024-04-15T18:00:00Z'),
        totalPrizeMoney: 1000,
        winnerPrizeMoney: 500,
        prizePool: 1000,
        entryFee: 10,
        maxParticipants: 100,
        game: 'Fortnite',
        platform: 'PC',
        active: true,
      },
      {
        name: 'Monthly Call of Duty Championship',
        description: 'Monthly Call of Duty tournament with cash prizes and exclusive rewards',
        startDate: new Date('2024-04-20T12:00:00Z'),
        endDate: new Date('2024-04-21T20:00:00Z'),
        totalPrizeMoney: 5000,
        winnerPrizeMoney: 2500,
        prizePool: 5000,
        entryFee: 25,
        maxParticipants: 200,
        game: 'Call of Duty: Warzone',
        platform: 'Cross-Platform',
        active: true,
      },
      {
        name: 'Valorant Community Cup',
        description: 'Community-driven Valorant tournament for all skill levels',
        startDate: new Date('2024-04-25T14:00:00Z'),
        endDate: new Date('2024-04-25T22:00:00Z'),
        totalPrizeMoney: 2000,
        winnerPrizeMoney: 1000,
        prizePool: 2000,
        entryFee: 15,
        maxParticipants: 128,
        game: 'Valorant',
        platform: 'PC',
        active: false,
      },
    ];

    // Clear existing tournaments
    await this.tournamentModel.deleteMany({});
    
    // Insert new tournaments
    await this.tournamentModel.insertMany(tournaments);
    
    console.log('Tournament seeding completed');
  }
} 