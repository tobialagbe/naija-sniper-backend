import { Command, CommandRunner } from 'nest-commander';
import { SeederService } from './seeder.service';

@Command({
  name: 'seed',
  description: 'Seed the database with initial data',
  options: { isDefault: true },
})
export class SeedCommand extends CommandRunner {
  constructor(private readonly seederService: SeederService) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting database seeding process...');
    try {
      await this.seederService.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during seeding:', error);
      process.exit(1);
    }
  }
} 