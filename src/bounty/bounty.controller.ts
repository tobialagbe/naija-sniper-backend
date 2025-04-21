import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { CreateBountyDto } from './dto/create-bounty.dto';
import { UpdateBountyDto } from './dto/update-bounty.dto';
import { CreateBountyWinnerDto } from './dto/create-bounty-winner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bounties')
export class BountyController {
  constructor(private readonly bountyService: BountyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBountyDto: CreateBountyDto) {
    return this.bountyService.create(createBountyDto);
  }

  @Get()
  findAll() {
    return this.bountyService.findAll();
  }

  @Get('active')
  findActive() {
    return this.bountyService.findActiveBounties();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bountyService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBountyDto: UpdateBountyDto) {
    return this.bountyService.update(id, updateBountyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bountyService.remove(id);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('winners')
  createBountyWinner(@Body() createBountyWinnerDto: CreateBountyWinnerDto) {
    return this.bountyService.createBountyWinner(createBountyWinnerDto);
  }

  @Get('winners/:bountyId')
  findAllBountyWinners(@Param('bountyId') bountyId: string) {
    return this.bountyService.findAllBountyWinners(bountyId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('winners/:id')
  removeBountyWinner(@Param('id') id: string) {
    return this.bountyService.removeBountyWinner(id);
  }
} 