import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProgression, UserProgressionDocument } from './entities/user-progression.entity';
import { AddMatchResultDto } from './dto/add-match-result.dto';
import { MilitaryRank, MilitaryRankLabels } from './enums/ranks.enum';

@Injectable()
export class ProgressionService {
  // Rank thresholds based on score and kills combined
  private readonly rankThresholds = {
    [MilitaryRank.SECOND_LIEUTENANT]: 0,       // Starting rank
    [MilitaryRank.LIEUTENANT]: 200000,         // 200,000 points
    [MilitaryRank.CAPTAIN]: 750000,            // 750,000 points
    [MilitaryRank.MAJOR]: 1200000,             // 1,200,000 points
    [MilitaryRank.LIEUTENANT_COLONEL]: 1800000, // 1,800,000 points
    [MilitaryRank.COLONEL]: 2500000,           // 2,500,000 points
    [MilitaryRank.BRIGADIER_GENERAL]: 3500000, // 3,500,000 points
    [MilitaryRank.MAJOR_GENERAL]: 5000000,     // 5,000,000 points
    [MilitaryRank.LIEUTENANT_GENERAL]: 7000000, // 7,000,000 points
    [MilitaryRank.GENERAL]: 9000000,           // 9,000,000 points
    [MilitaryRank.FIELD_MARSHAL]: 10000000,    // 10,000,000 points - highest rank
  };

  constructor(
    @InjectModel(UserProgression.name)
    private userProgressionModel: Model<UserProgressionDocument>,
  ) {}

  /**
   * Get a user's progression data
   */
  async getUserProgression(userId: string) {
    const progression = await this.userProgressionModel.findOne({ userId }).exec();
    if (!progression) {
      // Create a new progression record if one doesn't exist
      return this.createUserProgression(userId);
    }
    return progression;
  }

  /**
   * Create a new user progression record
   */
  async createUserProgression(userId: string) {
    const newProgression = new this.userProgressionModel({
      userId,
      rank: MilitaryRank.SECOND_LIEUTENANT,
      lifetimeScore: 0,
      lifetimeKills: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
    });
    return newProgression.save();
  }

  /**
   * Add a match result and update progression
   */
  async addMatchResult(matchResultDto: AddMatchResultDto) {
    const { userId, score, kills, isWin } = matchResultDto;
    
    // Find existing progression
    let progression = await this.userProgressionModel.findOne({ userId }).exec();
    
    // Create a new progression if it doesn't exist
    if (!progression) {
      return this.createUserProgression(userId).then(newProgression => {
        // Apply match result to the new progression
        return this.updateProgressionWithMatchResult(newProgression, score, kills, isWin);
      });
    }
    
    // Update existing progression
    return this.updateProgressionWithMatchResult(progression, score, kills, isWin);
  }
  
  /**
   * Helper method to update progression with match result
   */
  private async updateProgressionWithMatchResult(progression: UserProgressionDocument, score: number, kills: number, isWin?: boolean) {
    // Update progression data
    progression.lifetimeScore += score;
    progression.lifetimeKills += kills;
    progression.matchesPlayed += 1;
    
    // Update win/loss count if isWin is provided
    if (typeof isWin !== 'undefined') {
      if (isWin) {
        progression.wins += 1;
      } else {
        progression.losses += 1;
      }
    }
    
    // Update highest scores if applicable
    if (score > progression.highestScore) {
      progression.highestScore = score;
    }
    
    if (kills > progression.highestKills) {
      progression.highestKills = kills;
    }
    
    progression.lastMatchDate = new Date();
    
    // Calculate new rank
    progression.rank = this.calculateRank(progression.lifetimeScore, progression.lifetimeKills);
    
    // Save and return updated progression
    return progression.save();
  }

  /**
   * Calculate rank based on lifetime score and kills
   */
  private calculateRank(score: number, kills: number): MilitaryRank {
    // For ranking, we'll use a formula that combines score and kills
    // Each kill is worth 100 points in the ranking system
    const totalPoints = score + (kills * 100);
    
    // Determine rank based on thresholds
    if (totalPoints >= this.rankThresholds[MilitaryRank.FIELD_MARSHAL]) {
      return MilitaryRank.FIELD_MARSHAL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.GENERAL]) {
      return MilitaryRank.GENERAL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.LIEUTENANT_GENERAL]) {
      return MilitaryRank.LIEUTENANT_GENERAL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.MAJOR_GENERAL]) {
      return MilitaryRank.MAJOR_GENERAL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.BRIGADIER_GENERAL]) {
      return MilitaryRank.BRIGADIER_GENERAL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.COLONEL]) {
      return MilitaryRank.COLONEL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.LIEUTENANT_COLONEL]) {
      return MilitaryRank.LIEUTENANT_COLONEL;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.MAJOR]) {
      return MilitaryRank.MAJOR;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.CAPTAIN]) {
      return MilitaryRank.CAPTAIN;
    } else if (totalPoints >= this.rankThresholds[MilitaryRank.LIEUTENANT]) {
      return MilitaryRank.LIEUTENANT;
    } else {
      return MilitaryRank.SECOND_LIEUTENANT;
    }
  }

  /**
   * Get leaderboard based on total points (score + kills)
   */
  async getLeaderboard(limit = 10) {
    return this.userProgressionModel.find()
      .sort({ lifetimeScore: -1, lifetimeKills: -1 }) // Sort by score, then kills
      .limit(limit)
      .exec();
  }

  /**
   * Get users with a specific rank
   */
  async getUsersByRank(rank: MilitaryRank) {
    return this.userProgressionModel.find({ rank }).exec();
  }

  /**
   * Get just a user's rank
   * @param userId The user's ID
   * @returns The user's military rank label or "Second Lieutenant" if no progression exists
   */
  async getUserRank(userId: string): Promise<string> {
    const progression = await this.userProgressionModel.findOne({ userId }).exec();
    const rank = progression?.rank || MilitaryRank.SECOND_LIEUTENANT;
    return MilitaryRankLabels[rank];
  }
  
  /**
   * Get the highest score for today
   * @returns The highest score for today with user information
   */
  async getTodayHighestScore() {
    // Get today's start and end dates (midnight to midnight)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    // Find progressions that were updated today
    const todayProgressions = await this.userProgressionModel
      .find({
        lastMatchDate: { $gte: startOfDay, $lte: endOfDay }
      })
      .sort({ highestScore: -1 }) // Sort by highest score
      .limit(1)
      .populate('userId', 'username email') // Populate user details
      .exec();
      
    if (!todayProgressions || todayProgressions.length === 0) {
      return { message: 'No scores recorded today' };
    }
    
    const topProgression = todayProgressions[0];
    const user = topProgression.userId as any; // Cast to any to access populated fields
    
    return {
      score: topProgression.highestScore,
      kills: topProgression.highestKills,
      rank: topProgression.rank,
      username: user.username,
      userId: user._id,
      date: topProgression.lastMatchDate
    };
  }
} 