import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TournamentModule } from './tournament/tournament.module';
import { BountyModule } from './bounty/bounty.module';
import { PerksModule } from './perks/perks.module';
import { PaystackModule } from './paystack/paystack.module';
import { ProgressionModule } from './progression/progression.module';
import { KillStreakModule } from './kill-streak/kill-streak.module';

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
    AuthModule,
    TournamentModule,
    BountyModule,
    PerksModule,
    PaystackModule,
    ProgressionModule,
    KillStreakModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
