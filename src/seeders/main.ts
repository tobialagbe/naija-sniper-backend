import { CommandFactory } from 'nest-commander';
import { SeedersModule } from './seeders.module';

async function bootstrap() {
  try {
    await CommandFactory.run(SeedersModule, ['log', 'error', 'warn']);
  } catch (error) {
    console.error('Failed to run seed command:', error);
    process.exit(1);
  }
}

bootstrap(); 