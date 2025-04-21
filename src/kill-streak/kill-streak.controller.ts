import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { KillStreakService } from './kill-streak.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitStreakDto } from './dto/submit-streak.dto';
import { VerifySubmissionDto } from './dto/verify-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('kill-streak')
export class KillStreakController {
  constructor(private readonly killStreakService: KillStreakService) {}

  // Challenge management endpoints
  
  // Create a new challenge (admin only)
  // @UseGuards(JwtAuthGuard)
  @Post('challenges')
  createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    return this.killStreakService.createChallenge(createChallengeDto);
  }

  // Get all challenges
  @Get('challenges')
  getAllChallenges() {
    return this.killStreakService.getAllChallenges();
  }

  // Get active challenges
  @Get('challenges/active')
  getActiveChallenges() {
    return this.killStreakService.getActiveChallenges();
  }

  // Get upcoming challenges
  @Get('challenges/upcoming')
  getUpcomingChallenges() {
    return this.killStreakService.getUpcomingChallenges();
  }

  // Get a specific challenge
  @Get('challenges/:id')
  getChallenge(@Param('id') id: string) {
    return this.killStreakService.getChallenge(id);
  }

  // Cancel a challenge (admin only)
  // @UseGuards(JwtAuthGuard)
  @Put('challenges/:id/cancel')
  cancelChallenge(
    @Param('id') id: string,
    @Body('reason') reason: string
  ) {
    return this.killStreakService.cancelChallenge(id, reason);
  }

  // Submission management endpoints
  
  // Submit a kill streak
  // @UseGuards(JwtAuthGuard)
  @Post('submissions')
  submitStreak(@Body() submitStreakDto: SubmitStreakDto) {
    return this.killStreakService.submitStreak(submitStreakDto);
  }

  // Get all submissions for a challenge
  @Get('challenges/:challengeId/submissions')
  getChallengeSubmissions(@Param('challengeId') challengeId: string) {
    return this.killStreakService.getChallengeSubmissions(challengeId);
  }

  // Get eligible submissions for a challenge
  @Get('challenges/:challengeId/submissions/eligible')
  getEligibleSubmissions(@Param('challengeId') challengeId: string) {
    return this.killStreakService.getEligibleSubmissions(challengeId);
  }

  // Get submissions for a user
  // @UseGuards(JwtAuthGuard)
  @Get('users/:userId/submissions')
  getUserSubmissions(@Param('userId') userId: string) {
    return this.killStreakService.getUserSubmissions(userId);
  }

  // Verify a submission (admin only)
  // @UseGuards(JwtAuthGuard)
  @Put('submissions/verify')
  verifySubmission(@Body() verifySubmissionDto: VerifySubmissionDto) {
    return this.killStreakService.verifySubmission(verifySubmissionDto);
  }

  // Calculate winners for a challenge (admin only)
  // @UseGuards(JwtAuthGuard)
  @Post('challenges/:challengeId/calculate-winners')
  calculateChallengeWinners(@Param('challengeId') challengeId: string) {
    return this.killStreakService.calculateChallengeWinners(challengeId);
  }

  // Claim a prize (user)
  // @UseGuards(JwtAuthGuard)
  @Put('submissions/:submissionId/claim-prize')
  claimPrize(@Param('submissionId') submissionId: string) {
    return this.killStreakService.claimPrize(submissionId);
  }
} 