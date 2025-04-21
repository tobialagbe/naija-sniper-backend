import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { PerksService } from './perks.service';
import { CreateUserPerkDto } from './dto/create-user-perk.dto';
import { UpdateUserPerkDto } from './dto/update-user-perk.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('perks')
export class PerksController {
  constructor(private readonly perksService: PerksService) {}

  // Get all available perks
  @Get()
  getAllPerks() {
    return this.perksService.getAllPerks();
  }

  // Get a specific perk by key
  @Get('types/:key')
  getPerkByKey(@Param('key') key: string) {
    return this.perksService.getPerkByKey(key);
  }

  // Create a user perk (requires authentication)
  // @UseGuards(JwtAuthGuard)
  @Post('user')
  createUserPerk(@Body() createUserPerkDto: CreateUserPerkDto) {
    return this.perksService.createUserPerk(createUserPerkDto);
  }

  // Get all perks for a user
  @Get('user/:userId')
  getUserPerks(@Param('userId') userId: string) {
    return this.perksService.getUserPerks(userId);
  }

  // Get a specific user perk
  @Get('user/perk/:id')
  getUserPerk(@Param('id') id: string) {
    return this.perksService.getUserPerk(id);
  }

  // Update a user perk (requires authentication)
//   @UseGuards(JwtAuthGuard)
  @Put('user/perk/:id')
  updateUserPerk(
    @Param('id') id: string,
    @Body() updateUserPerkDto: UpdateUserPerkDto,
  ) {
    return this.perksService.updateUserPerk(id, updateUserPerkDto);
  }

  // Delete a user perk (requires authentication)
//   @UseGuards(JwtAuthGuard)
  @Delete('user/perk/:id')
  removeUserPerk(@Param('id') id: string) {
    return this.perksService.removeUserPerk(id);
  }

  // Use a perk (requires authentication)
//   @UseGuards(JwtAuthGuard)
  @Post('user/perk/:id/use')
  usePerk(
    @Param('id') id: string,
    @Body() body: { amount?: number }
  ) {
    return this.perksService.usePerk(id, body?.amount);
  }
} 