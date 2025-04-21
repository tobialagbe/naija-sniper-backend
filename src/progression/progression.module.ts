import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressionService } from './progression.service';
import { ProgressionController } from './progression.controller';
import { UserProgression, UserProgressionSchema } from './entities/user-progression.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgression.name, schema: UserProgressionSchema },
    ]),
  ],
  controllers: [ProgressionController],
  providers: [ProgressionService],
  exports: [ProgressionService],
})
export class ProgressionModule {} 