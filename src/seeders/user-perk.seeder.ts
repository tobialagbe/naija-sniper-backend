import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserPerk } from '../perks/entities/user-perk.entity';
import { User } from '../user/entities/user.entity';
import { PERKS } from '../perks/data/perks';

@Injectable()
export class UserPerkSeeder {
  constructor(
    @InjectModel(UserPerk.name) private userPerkModel: Model<UserPerk>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async seed() {
    // Get all users
    const users = await this.userModel.find().exec();
    
    // Clear existing user perks
    await this.userPerkModel.deleteMany({});
    
    const userPerks = [];
    
    // For each user, assign random perks
    for (const user of users) {
      // Select random perks for this user (between 1 and 3 different perks)
      const numberOfPerks = Math.floor(Math.random() * 3) + 1;
      const shuffledPerks = [...PERKS].sort(() => 0.5 - Math.random());
      const perksForUser = shuffledPerks.slice(0, numberOfPerks);
      
      for (const perk of perksForUser) {
        // Give random count of each perk (between 1 and 5)
        const count = Math.floor(Math.random() * 5) + 1;
        
        userPerks.push({
          userId: user._id,
          perkKey: perk.key,
          perkName: perk.name,
          count,
          used: false,
        });
      }
    }
    
    // Insert all user perks
    if (userPerks.length > 0) {
      await this.userPerkModel.insertMany(userPerks);
    }
    
    console.log(`User perk seeding completed: ${userPerks.length} perks assigned to users`);
  }
} 