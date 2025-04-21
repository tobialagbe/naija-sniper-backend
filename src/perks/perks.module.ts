import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerksService } from './perks.service';
import { PerksController } from './perks.controller';
import { UserPerk, UserPerkSchema } from './entities/user-perk.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPerk.name, schema: UserPerkSchema },
    ]),
    UserModule,
  ],
  controllers: [PerksController],
  providers: [PerksService],
  exports: [PerksService],
})
export class PerksModule {} 