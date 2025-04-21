import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async seed() {
    const predefinedPassword = 'password123'; // Common password for all seeded users
    const hashedPassword = await bcrypt.hash(predefinedPassword, 10);

    const users = [
      {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: hashedPassword,
        phoneNumber: '08012345678',
        instagramHandle: 'johndoe',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: hashedPassword,
        phoneNumber: '08023456789',
        instagramHandle: 'janesmith',
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        username: 'mikejohnson',
        email: 'mike@example.com',
        password: hashedPassword,
        phoneNumber: '08034567890',
        instagramHandle: 'mikejohnson',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        username: 'sarahwilliams',
        email: 'sarah@example.com',
        password: hashedPassword,
        phoneNumber: '08045678901',
        instagramHandle: 'sarahwilliams',
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        username: 'davidbrown',
        email: 'david@example.com',
        password: hashedPassword,
        phoneNumber: '08056789012',
        instagramHandle: 'davidbrown',
      },
    ];

    // Clear existing users
    await this.userModel.deleteMany({});
    
    // Insert new users
    await this.userModel.insertMany(users);
    
    console.log('User seeding completed');
  }
} 