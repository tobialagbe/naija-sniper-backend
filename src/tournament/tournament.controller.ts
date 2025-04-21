import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { RecordScoreDto } from './dto/record-score.dto';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';
import { CheckRegistrationDto } from './dto/check-registration.dto';
import { RegisterTournamentDto } from './dto/register-tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  // @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentService.create(createTournamentDto);
  }

  @Get()
  findAll() {
    return this.tournamentService.findAll();
  }

  @Get('active')
  findActive() {
    return this.tournamentService.findActiveTournaments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  // @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentService.update(id, updateTournamentDto);
  }

  // @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }

  /**
   * Register a user for a tournament
   * @param registerTournamentDto - The tournament and user information
   * @returns Registration details
   */
  // @UseGuards(JwtAuthGuard)
  @Post('register')
  registerForTournament(@Body() registerTournamentDto: RegisterTournamentDto) {
    return this.tournamentService.registerForTournament(registerTournamentDto);
  }

  /**
   * Cancel a user's registration for a tournament
   * @param registerTournamentDto - The tournament and user information
   * @returns Updated registration details
   */
  // @UseGuards(JwtAuthGuard)
  @Post('cancel-registration')
  cancelRegistration(@Body() registerTournamentDto: RegisterTournamentDto) {
    return this.tournamentService.cancelRegistration(registerTournamentDto);
  }

  /**
   * Get all registered users for a tournament
   * @param tournamentId - The ID of the tournament
   * @returns List of registrations
   */
  // @UseGuards(JwtAuthGuard)
  @Get('registrations/:tournamentId')
  getTournamentRegistrations(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournamentRegistrations(tournamentId);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('record-score')
  recordScore(@Body() recordScoreDto: RecordScoreDto) {
    return this.tournamentService.recordScore(recordScoreDto);
  }

  @Get('leaderboard/:tournamentId')
  getLeaderboard(
    @Param('tournamentId') tournamentId: string,
    @Query('limit') limit?: number,
  ) {
    const getLeaderboardDto: GetLeaderboardDto = {
      tournamentId,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    };
    return this.tournamentService.getLeaderboard(getLeaderboardDto);
  }

  /**
   * Check if a user is registered for a tournament
   * @param userId - The ID of the user to check
   * @param tournamentId - The ID of the tournament to check
   * @returns Registration status and details
   */
  @Get('check-registration/:tournamentId/:userId')
  checkRegistration(
    @Param('tournamentId') tournamentId: string,
    @Param('userId') userId: string,
  ) {
    const checkRegistrationDto: CheckRegistrationDto = {
      tournamentId,
      userId,
    };
    return this.tournamentService.checkUserRegistration(checkRegistrationDto);
  }
}
