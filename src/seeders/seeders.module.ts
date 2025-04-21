import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { TournamentModule } from '../tournament/tournament.module';
import { BountyModule } from '../bounty/bounty.module';
import { SeederModule } from './seeder.module';
import { SeedCommand } from './seed.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // e.g. "mongodb+srv://versus:elemenop@dev-cluster.uxgsk.mongodb.net/?retryWrites=true&w=majority&appName=dev-cluster"
        const uri = configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017';
        return {
          uri,
          dbName: 'naija-sniper',
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
    UserModule,
    TournamentModule,
    BountyModule,
    SeederModule,
  ],
  providers: [SeedCommand],
})
export class SeedersModule {} 