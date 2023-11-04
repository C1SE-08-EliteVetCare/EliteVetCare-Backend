import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from "@nestjs/common";
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../user/decorator/user.decorator";
import { FilterFeedbackDto } from "./dto/filter-feedback.dto";

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@GetUser('id') userId: number, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(userId, createFeedbackDto);
  }

  @Get('feedbacks')
  findAll(@Query() query: FilterFeedbackDto) {
    return this.feedbackService.findAll(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('feedbacks/current')
  findAllCurrent(@GetUser('id') userId: number, @Query() query: FilterFeedbackDto) {
    return this.feedbackService.findAllCurrent(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
