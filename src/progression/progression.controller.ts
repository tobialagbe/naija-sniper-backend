import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { AddMatchResultDto } from './dto/add-match-result.dto';
import { MilitaryRank } from './enums/ranks.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progression')
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  // Get progression for a specific user
  @Get('user/:userId')
  async getUserProgression(@Param('userId') userId: string) {
    return this.progressionService.getUserProgression(userId);
  }

  // Get just the rank for a specific user
  @Get('user/:userId/rank')
  async getUserRank(@Param('userId') userId: string) {
    return { rank: await this.progressionService.getUserRank(userId) };
  }

  // Add a match result
  @Post('match')
  @UseGuards(JwtAuthGuard)
  async addMatchResult(@Body() addMatchResultDto: AddMatchResultDto) {
    return this.progressionService.addMatchResult(addMatchResultDto);
  }

  // Get leaderboard
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit: number = 10) {
    return this.progressionService.getLeaderboard(limit);
  }

  // Get today's highest score
  @Get('today/highest')
  async getTodayHighestScore() {
    return this.progressionService.getTodayHighestScore();
  }

  // Get users with a specific rank
  @Get('rank/:rank')
  async getUsersByRank(@Param('rank') rank: MilitaryRank) {
    return this.progressionService.getUsersByRank(rank);
  }

  // Get all available ranks (for reference)
  @Get('ranks')
  getAllRanks() {
    return Object.values(MilitaryRank);
  }
} 