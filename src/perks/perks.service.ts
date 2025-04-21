import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPerk, UserPerkDocument } from './entities/user-perk.entity';
import { CreateUserPerkDto } from './dto/create-user-perk.dto';
import { UpdateUserPerkDto } from './dto/update-user-perk.dto';
import { PERKS, getPerkByKey } from './data/perks';

@Injectable()
export class PerksService {
  constructor(
    @InjectModel(UserPerk.name) private userPerkModel: Model<UserPerkDocument>,
  ) {}

  // Get all available perks
  getAllPerks() {
    return PERKS;
  }

  // Get a specific perk by key
  getPerkByKey(key: string) {
    const perk = getPerkByKey(key);
    if (!perk) {
      throw new NotFoundException(`Perk with key ${key} not found`);
    }
    return perk;
  }

  // Create a user perk
  async createUserPerk(createUserPerkDto: CreateUserPerkDto): Promise<UserPerk> {
    const { userId, perkKey, count = 1 } = createUserPerkDto;

    // Check if perk exists
    const perk = getPerkByKey(perkKey);
    if (!perk) {
      throw new BadRequestException(`Perk with key ${perkKey} does not exist`);
    }

    // Check if user already has this perk
    const existingUserPerk = await this.userPerkModel.findOne({
      userId,
      perkKey,
    }).exec();

    if (existingUserPerk) {
      // Update count if user already has this perk
      existingUserPerk.count += count;
      return existingUserPerk.save();
    }

    // Create new user perk
    const userPerk = new this.userPerkModel({
      userId,
      perkKey,
      perkName: perk.name,
      count,
    });

    return userPerk.save();
  }

  // Get all perks for a user
  async getUserPerks(userId: string): Promise<UserPerk[]> {
    return this.userPerkModel.find({ userId }).exec();
  }

  // Get a specific user perk
  async getUserPerk(id: string): Promise<UserPerk> {
    const userPerk = await this.userPerkModel.findById(id).exec();
    if (!userPerk) {
      throw new NotFoundException(`User perk with ID ${id} not found`);
    }
    return userPerk;
  }

  // Update a user perk
  async updateUserPerk(id: string, updateUserPerkDto: UpdateUserPerkDto): Promise<UserPerk> {
    const userPerk = await this.userPerkModel
      .findByIdAndUpdate(id, updateUserPerkDto, { new: true })
      .exec();
    
    if (!userPerk) {
      throw new NotFoundException(`User perk with ID ${id} not found`);
    }
    
    return userPerk;
  }

  // Delete a user perk
  async removeUserPerk(id: string): Promise<UserPerk> {
    const userPerk = await this.userPerkModel.findByIdAndDelete(id).exec();
    if (!userPerk) {
      throw new NotFoundException(`User perk with ID ${id} not found`);
    }
    return userPerk;
  }

  // Use a perk
  async usePerk(id: string, amount = 1): Promise<UserPerk> {
    const userPerk = await this.userPerkModel.findById(id).exec();
    if (!userPerk) {
      throw new NotFoundException(`User perk with ID ${id} not found`);
    }

    if (userPerk.count < amount) {
      throw new BadRequestException(`Not enough perks remaining. You have ${userPerk.count} but trying to use ${amount}`);
    }

    userPerk.count -= amount;
    userPerk.used = true;
    userPerk.usedAt = new Date();

    return userPerk.save();
  }
} 