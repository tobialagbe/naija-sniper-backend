import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { Tournament, TournamentDocument } from './entities/tournament.entity';
import { Leaderboard, LeaderboardDocument } from './entities/leaderboard.entity';
import { Registration, RegistrationDocument } from './entities/registration.entity';
import { RecordScoreDto } from './dto/record-score.dto';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';
import { CheckRegistrationDto } from './dto/check-registration.dto';
import { RegisterTournamentDto } from './dto/register-tournament.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class TournamentService {
  constructor(
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Leaderboard.name) private leaderboardModel: Model<LeaderboardDocument>,
    @InjectModel(Registration.name) private registrationModel: Model<RegistrationDocument>,
    private readonly userService: UserService,
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const createdTournament = new this.tournamentModel(createTournamentDto);
    return createdTournament.save();
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournamentModel.find().exec();
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournamentModel.findById(id).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.tournamentModel
      .findByIdAndUpdate(id, updateTournamentDto, { new: true })
      .exec();
    
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    
    return tournament;
  }

  async remove(id: string): Promise<Tournament> {
    const tournament = await this.tournamentModel.findByIdAndDelete(id).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
  }

  async recordScore(recordScoreDto: RecordScoreDto): Promise<Leaderboard> {
    const { tournamentId, userId, score } = recordScoreDto;
    
    // Check if tournament exists
    const tournament = await this.tournamentModel.findById(tournamentId).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Check if user exists
    const user = await this.userService.findOne(userId);
    
    // Check if user is registered for the tournament
    const registration = await this.registrationModel.findOne({
      tournamentId,
      userId,
      active: true,
    }).exec();
    
    if (!registration) {
      throw new BadRequestException(`User is not registered for tournament with ID ${tournamentId}`);
    }
    
    // Check if user already has a score for this tournament
    const existingRecord = await this.leaderboardModel.findOne({
      tournamentId,
      userId,
    }).exec();
    
    if (existingRecord) {
      // If new score is higher, update it
      if (score > existingRecord.score) {
        existingRecord.score = score;
        return existingRecord.save();
      }
      // If not higher, return existing record without updating
      return existingRecord;
    }
    
    // Create a new leaderboard entry
    const leaderboardEntry = new this.leaderboardModel({
      tournamentId,
      tournamentName: tournament.name,
      userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      score,
    });
    
    return leaderboardEntry.save();
  }

  async getLeaderboard(getLeaderboardDto: GetLeaderboardDto): Promise<{
    tournament: Tournament;
    leaderboard: Leaderboard[];
  }> {
    const { tournamentId, limit } = getLeaderboardDto;

    // Check if tournament exists
    const tournament = await this.tournamentModel.findById(tournamentId).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Get leaderboard entries, sorted by score in descending order
    let leaderboardQuery = this.leaderboardModel
      .find({ tournamentId })
      .sort({ score: -1 });
    
    // Apply limit if provided
    if (limit) {
      leaderboardQuery = leaderboardQuery.limit(limit);
    }
    
    const leaderboard = await leaderboardQuery.exec();
    
    return {
      tournament,
      leaderboard,
    };
  }

  async findActiveTournaments(): Promise<{ hasActive: boolean; tournament?: Tournament }> {
    const activeTournaments = await this.tournamentModel.find({ active: true }).exec();
    if (activeTournaments.length === 0) {
      return { hasActive: false };
    }
    return { hasActive: true, tournament: activeTournaments[0] };
  }

  /**
   * Register a user for a tournament
   * @param registerTournamentDto - The DTO containing tournament and user IDs
   * @returns The registration record
   */
  async registerForTournament(registerTournamentDto: RegisterTournamentDto): Promise<Registration> {
    const { tournamentId, userId } = registerTournamentDto;
    
    // Check if tournament exists
    const tournament = await this.tournamentModel.findById(tournamentId).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Check if user exists
    const user = await this.userService.findOne(userId);
    
    // Check if user is already registered
    const existingRegistration = await this.registrationModel.findOne({
      tournamentId,
      userId,
      active: true,
    }).exec();
    
    if (existingRegistration) {
      throw new BadRequestException(`User is already registered for tournament with ID ${tournamentId}`);
    }
    
    // Create a new registration
    const registration = new this.registrationModel({
      tournamentId,
      tournamentName: tournament.name,
      userId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      registeredAt: new Date(),
      active: true,
    });
    
    return registration.save();
  }

  /**
   * Cancel a user's registration for a tournament
   * @param registerTournamentDto - The DTO containing tournament and user IDs
   * @returns The updated registration record
   */
  async cancelRegistration(registerTournamentDto: RegisterTournamentDto): Promise<Registration> {
    const { tournamentId, userId } = registerTournamentDto;
    
    // Check if registration exists
    const registration = await this.registrationModel.findOne({
      tournamentId,
      userId,
      active: true,
    }).exec();
    
    if (!registration) {
      throw new NotFoundException(`User is not registered for tournament with ID ${tournamentId}`);
    }
    
    // Deactivate registration
    registration.active = false;
    return registration.save();
  }

  /**
   * Check if a user is registered for a tournament
   * @param checkRegistrationDto - The DTO containing tournament and user IDs
   * @returns An object indicating registration status and details
   */
  async checkUserRegistration(checkRegistrationDto: CheckRegistrationDto): Promise<{
    isRegistered: boolean;
    tournamentInfo?: Tournament;
    registrationDate?: Date;
  }> {
    const { tournamentId, userId } = checkRegistrationDto;
    
    // Check if tournament exists
    const tournament = await this.tournamentModel.findById(tournamentId).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Check if user exists
    await this.userService.findOne(userId);
    
    // Check if user is registered
    const registration = await this.registrationModel.findOne({
      tournamentId,
      userId,
      active: true,
    }).exec();
    
    if (!registration) {
      return { isRegistered: false, tournamentInfo: tournament };
    }
    
    // User is registered
    return {
      isRegistered: true,
      tournamentInfo: tournament,
      registrationDate: registration.registeredAt,
    };
  }

  /**
   * Get all registered users for a tournament
   * @param tournamentId - The ID of the tournament
   * @returns List of registrations for the tournament
   */
  async getTournamentRegistrations(tournamentId: string): Promise<Registration[]> {
    // Check if tournament exists
    const tournament = await this.tournamentModel.findById(tournamentId).exec();
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }
    
    // Get all active registrations for the tournament
    return this.registrationModel.find({
      tournamentId,
      active: true,
    }).exec();
  }

  /**
   * Get the top player from the active tournament's leaderboard
   * @returns The top player with score and tournament details, or null if no active tournament
   */
  async getActiveLeaderboardTopPlayer(): Promise<{
    hasActive: boolean;
    tournament?: Tournament;
    topPlayer?: {
      userId: string;
      username: string;
      firstName: string;
      lastName: string;
      score: number;
    };
  }> {
    // Find the active tournament
    const activeTournaments = await this.tournamentModel.find({ active: true }).exec();
    
    if (activeTournaments.length === 0) {
      return { hasActive: false };
    }
    
    const tournament = activeTournaments[0];
    const tournamentId = tournament.id; // Using id instead of _id
    
    // Get the top player from the leaderboard
    const topPlayer = await this.leaderboardModel
      .findOne({ tournamentId })
      .sort({ score: -1 })
      .limit(1)
      .exec();
    
    if (!topPlayer) {
      return { 
        hasActive: true, 
        tournament,
        topPlayer: null 
      };
    }
    
    return {
      hasActive: true,
      tournament,
      topPlayer: {
        userId: topPlayer.userId,
        username: topPlayer.username,
        firstName: topPlayer.firstName,
        lastName: topPlayer.lastName,
        score: topPlayer.score
      }
    };
  }
} 