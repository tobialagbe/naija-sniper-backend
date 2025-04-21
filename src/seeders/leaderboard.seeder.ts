import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from '../tournament/entities/tournament.entity';
import { User } from '../user/entities/user.entity';
import { Leaderboard } from '../tournament/entities/leaderboard.entity';

@Injectable()
export class LeaderboardSeeder {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<Tournament>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Leaderboard.name) private leaderboardModel: Model<Leaderboard>,
  ) {}

  async seed() {
    // Get all tournaments
    const tournaments = await this.tournamentModel.find().exec();
    
    // Get all users
    const users = await this.userModel.find().exec();
    
    // Clear existing leaderboard entries
    await this.leaderboardModel.deleteMany({});
    
    const leaderboardEntries = [];
    
    // Generate leaderboard data for each tournament
    for (const tournament of tournaments) {
      // For each tournament, assign random scores to each user
      // We'll make sure that at least 3 users have entries for each tournament
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const usersForThisTournament = shuffledUsers.slice(0, Math.min(5, users.length));
      
      for (const user of usersForThisTournament) {
        // Generate a random score between 100 and 1000
        const score = Math.floor(Math.random() * 900) + 100;
        
        leaderboardEntries.push({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          tournamentId: tournament._id,
          tournamentName: tournament.name,
          score: score,
          userId: user._id,
        });
      }
    }
    
    // Insert all leaderboard entries
    if (leaderboardEntries.length > 0) {
      await this.leaderboardModel.insertMany(leaderboardEntries);
    }
    
    console.log(`Leaderboard seeding completed: ${leaderboardEntries.length} entries created`);
  }
} 