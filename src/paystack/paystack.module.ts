import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { Payment, PaymentSchema } from './entities/payment.entity';
import { TournamentModule } from '../tournament/tournament.module';
import { UserModule } from '../user/user.module';
import { PerksModule } from '../perks/perks.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
    TournamentModule,
    UserModule,
    PerksModule,
  ],
  controllers: [PaystackController],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {} 