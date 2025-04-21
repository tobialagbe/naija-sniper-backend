import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { Bounty, BountyDocument } from './entities/bounty.entity';
import { BountyWinner, BountyWinnerDocument } from './entities/bounty-winner.entity';
import { CreateBountyWinnerDto } from './dto/create-bounty-winner.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class BountyService {
  constructor(
    @InjectModel(Bounty.name) private bountyModel: Model<BountyDocument>,
    @InjectModel(BountyWinner.name) private bountyWinnerModel: Model<BountyWinnerDocument>,
    private readonly userService: UserService,
  ) {}

  async create(createBountyDto: CreateBountyDto): Promise<Bounty> {
    const createdBounty = new this.bountyModel(createBountyDto);
    return createdBounty.save();
  }

  async findAll(): Promise<Bounty[]> {
    return this.bountyModel.find().exec();
  }

  async findOne(id: string): Promise<{ bounty: Bounty; winnersReached: boolean }> {
    const bounty = await this.bountyModel.findById(id).exec();
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }
    
    // Count current winners
    const winnersCount = await this.bountyWinnerModel.countDocuments({ bountyId: id }).exec();
    
    // Check if number of winners has been reached
    const winnersReached = winnersCount >= bounty.numberOfWinners;
    
    return { bounty, winnersReached };
  }

  async update(id: string, updateBountyDto: UpdateBountyDto): Promise<Bounty> {
    const bounty = await this.bountyModel
      .findByIdAndUpdate(id, updateBountyDto, { new: true })
      .exec();
    
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }
    
    return bounty;
  }

  async remove(id: string): Promise<Bounty> {
    const bounty = await this.bountyModel.findByIdAndDelete(id).exec();
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${id} not found`);
    }
    return bounty;
  }

  async createBountyWinner(createBountyWinnerDto: CreateBountyWinnerDto): Promise<{ message: string; winner?: BountyWinner }> {
    const { bountyId, userId, killCount = 0 } = createBountyWinnerDto;
    
    // Check if bounty exists
    const bounty = await this.bountyModel.findById(bountyId).exec();
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${bountyId} not found`);
    }
    
    // Check if user exists
    const user = await this.userService.findOne(userId);
    
    // Check if this user is already a winner for this bounty
    const existingWinner = await this.bountyWinnerModel.findOne({
      bountyId,
      userId,
    }).exec();
    
    if (existingWinner) {
      return { message: 'User is already a winner for this bounty' };
    }
    
    // Count current winners
    const winnersCount = await this.bountyWinnerModel.countDocuments({ bountyId }).exec();
    
    // Check if number of winners has been reached
    if (winnersCount >= bounty.numberOfWinners) {
      return { message: 'Maximum number of winners has been reached for this bounty' };
    }
    
    // Check if the killCount requirement is met
    if (bounty.killCount > 0 && killCount < bounty.killCount) {
      return { message: `Kill count does not meet the requirement of ${bounty.killCount}` };
    }
    
    // Create a new bounty winner entry
    const bountyWinner = new this.bountyWinnerModel({
      bountyId,
      bountyName: bounty.name,
      userId,
      username: user.username,
      killCount,
    });
    
    const savedWinner = await bountyWinner.save();
    return { 
      message: `Congratulations! You've successfully claimed the bounty!`, 
      winner: savedWinner 
    };
  }

  async findAllBountyWinners(bountyId: string): Promise<BountyWinner[]> {
    // Check if bounty exists
    const bounty = await this.bountyModel.findById(bountyId).exec();
    if (!bounty) {
      throw new NotFoundException(`Bounty with ID ${bountyId} not found`);
    }
    
    return this.bountyWinnerModel.find({ bountyId }).exec();
  }

  async removeBountyWinner(id: string): Promise<BountyWinner> {
    const bountyWinner = await this.bountyWinnerModel.findByIdAndDelete(id).exec();
    if (!bountyWinner) {
      throw new NotFoundException(`Bounty winner with ID ${id} not found`);
    }
    return bountyWinner;
  }

  async findActiveBounties(): Promise<{ hasActive: boolean; bounty?: Bounty }> {
    const activeBounties = await this.bountyModel.find({ active: true }).exec();
    if (activeBounties.length === 0) {
      return { hasActive: false };
    }
    return { hasActive: true, bounty: activeBounties[0] };
  }
} 