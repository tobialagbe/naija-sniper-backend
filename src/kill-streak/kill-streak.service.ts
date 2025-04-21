import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimedChallenge, TimedChallengeDocument } from './entities/timed-challenge.entity';
import { StreakSubmission, StreakSubmissionDocument, SubmissionStatus } from './entities/streak-submission.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitStreakDto } from './dto/submit-streak.dto';
import { VerifySubmissionDto } from './dto/verify-submission.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class KillStreakService {
  constructor(
    @InjectModel(TimedChallenge.name) private timedChallengeModel: Model<TimedChallengeDocument>,
    @InjectModel(StreakSubmission.name) private streakSubmissionModel: Model<StreakSubmissionDocument>,
    private readonly userService: UserService,
  ) {}

  /**
   * Create a new timed kill streak challenge
   */
  async createChallenge(createChallengeDto: CreateChallengeDto): Promise<TimedChallenge> {
    // Validate dates
    const startDate = new Date(createChallengeDto.startDateTime);
    const endDate = new Date(createChallengeDto.endDateTime);
    
    if (startDate < new Date()) {
      throw new BadRequestException('Challenge start date cannot be in the past');
    }
    
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    
    // Create new challenge
    const challenge = new this.timedChallengeModel({
      title: createChallengeDto.title,
      description: createChallengeDto.description,
      startDateTime: startDate,
      endDateTime: endDate,
      requiredKillStreak: createChallengeDto.requiredKillStreak,
      prizePool: createChallengeDto.prizePool,
      maxWinners: createChallengeDto.maxWinners,
      currentParticipants: 0,
      completedParticipants: 0,
      isActive: true,
    });
    
    return challenge.save();
  }

  /**
   * Get all available challenges
   */
  async getAllChallenges(): Promise<TimedChallenge[]> {
    return this.timedChallengeModel.find().sort({ startDateTime: -1 }).exec();
  }

  /**
   * Get active challenges that are currently running
   */
  async getActiveChallenges(): Promise<TimedChallenge[]> {
    const now = new Date();
    
    return this.timedChallengeModel.find({
      startDateTime: { $lte: now },
      endDateTime: { $gte: now },
      isActive: true,
    }).exec();
  }

  /**
   * Get upcoming challenges (start date is in the future)
   */
  async getUpcomingChallenges(): Promise<TimedChallenge[]> {
    const now = new Date();
    
    return this.timedChallengeModel.find({
      startDateTime: { $gt: now },
      isActive: true,
    }).sort({ startDateTime: 1 }).exec();
  }

  /**
   * Get a specific challenge by ID
   */
  async getChallenge(id: string): Promise<TimedChallenge> {
    const challenge = await this.timedChallengeModel.findById(id).exec();
    
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
    
    return challenge;
  }

  /**
   * Cancel an active challenge
   */
  async cancelChallenge(id: string, reason: string): Promise<TimedChallenge> {
    const challenge = await this.getChallenge(id);
    
    if (!challenge.isActive) {
      throw new BadRequestException('Challenge is already inactive');
    }
    
    return this.timedChallengeModel.findByIdAndUpdate(
      id,
      {
        isActive: false,
        cancelledAt: new Date(),
        cancelReason: reason
      },
      { new: true }
    ).exec();
  }

  /**
   * Submit a kill streak for a challenge
   */
  async submitStreak(submitStreakDto: SubmitStreakDto): Promise<StreakSubmission> {
    const { userId, challengeId, killStreak, gameMetadata, submissionEvidence } = submitStreakDto;
    
    // Check if challenge exists and is active
    const challenge = await this.getChallenge(challengeId);
    const now = new Date();
    
    if (!challenge.isActive) {
      throw new BadRequestException('Challenge is not active');
    }
    
    if (now < challenge.startDateTime) {
      throw new BadRequestException('Challenge has not started yet');
    }
    
    if (now > challenge.endDateTime) {
      throw new BadRequestException('Challenge has already ended');
    }
    
    // Check if user exists
    const user = await this.userService.findOne(userId);
    
    // Check if user already submitted for this challenge
    const existingSubmission = await this.streakSubmissionModel.findOne({
      userId,
      challengeId,
    }).exec();
    
    if (existingSubmission) {
      // If existing submission has a lower kill streak, update it
      if (killStreak > existingSubmission.killStreak) {
        existingSubmission.killStreak = killStreak;
        existingSubmission.gameMetadata = gameMetadata;
        existingSubmission.submissionEvidence = submissionEvidence;
        existingSubmission.status = SubmissionStatus.PENDING;
        existingSubmission.isEligible = killStreak >= challenge.requiredKillStreak;
        
        return existingSubmission.save();
      }
      
      return existingSubmission;
    }
    
    // Create new submission
    const submission = new this.streakSubmissionModel({
      userId,
      username: user.username,
      challengeId,
      killStreak,
      isEligible: killStreak >= challenge.requiredKillStreak,
      status: SubmissionStatus.PENDING,
      gameMetadata,
      submissionEvidence,
    });
    
    // Update challenge participant count
    await this.timedChallengeModel.findByIdAndUpdate(
      challengeId,
      { $inc: { currentParticipants: 1 } }
    );
    
    return submission.save();
  }

  /**
   * Get submissions for a challenge
   */
  async getChallengeSubmissions(challengeId: string): Promise<StreakSubmission[]> {
    // Check if challenge exists
    await this.getChallenge(challengeId);
    
    return this.streakSubmissionModel.find({ challengeId })
      .sort({ killStreak: -1, createdAt: 1 })
      .exec();
  }

  /**
   * Get eligible submissions for a challenge (met kill streak requirement)
   */
  async getEligibleSubmissions(challengeId: string): Promise<StreakSubmission[]> {
    // Check if challenge exists
    await this.getChallenge(challengeId);
    
    return this.streakSubmissionModel.find({
      challengeId,
      isEligible: true,
    })
      .sort({ killStreak: -1, createdAt: 1 })
      .exec();
  }

  /**
   * Get submissions for a user
   */
  async getUserSubmissions(userId: string): Promise<StreakSubmission[]> {
    return this.streakSubmissionModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate('challengeId')
      .exec();
  }

  /**
   * Verify a submission (admin function)
   */
  async verifySubmission(verifySubmissionDto: VerifySubmissionDto): Promise<StreakSubmission> {
    const { submissionId, isVerified, status, rejectionReason } = verifySubmissionDto;
    
    const submission = await this.streakSubmissionModel.findById(submissionId).exec();
    
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
    
    // Update submission status
    submission.status = status;
    
    if (isVerified) {
      submission.verifiedAt = new Date();
    } else {
      submission.rejectionReason = rejectionReason;
    }
    
    return submission.save();
  }

  /**
   * Calculate winners for a completed challenge
   * This would typically be called by a scheduled job after challenge end time
   */
  async calculateChallengeWinners(challengeId: string): Promise<StreakSubmission[]> {
    const challenge = await this.getChallenge(challengeId);
    
    // Ensure challenge has ended
    const now = new Date();
    if (now < challenge.endDateTime) {
      throw new BadRequestException('Challenge has not ended yet');
    }
    
    // Get eligible and verified submissions
    const eligibleSubmissions = await this.streakSubmissionModel.find({
      challengeId,
      isEligible: true,
      status: SubmissionStatus.VERIFIED,
    })
      .sort({ killStreak: -1, createdAt: 1 })
      .limit(challenge.maxWinners)
      .exec();
    
    // No winners if no eligible submissions
    if (eligibleSubmissions.length === 0) {
      return [];
    }
    
    // Calculate prize per winner (equal distribution)
    const prizePerWinner = challenge.prizePool / eligibleSubmissions.length;
    
    // Update winners
    const winners = [];
    for (let i = 0; i < eligibleSubmissions.length; i++) {
      const submission = eligibleSubmissions[i];
      submission.status = SubmissionStatus.WINNER;
      submission.prizeAmount = prizePerWinner;
      submission.ranking = i + 1;
      
      winners.push(await submission.save());
    }
    
    return winners;
  }

  /**
   * Mark a prize as claimed
   */
  async claimPrize(submissionId: string): Promise<StreakSubmission> {
    const submission = await this.streakSubmissionModel.findById(submissionId).exec();
    
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }
    
    if (submission.status !== SubmissionStatus.WINNER) {
      throw new BadRequestException('Submission is not a winner');
    }
    
    if (submission.hasPrizeClaimed) {
      throw new BadRequestException('Prize has already been claimed');
    }
    
    submission.hasPrizeClaimed = true;
    submission.prizeClaimedAt = new Date();
    
    return submission.save();
  }
} 