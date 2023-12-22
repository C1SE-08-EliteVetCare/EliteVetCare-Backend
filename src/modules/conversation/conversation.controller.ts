import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { GetUser } from '../user/decorator/user.decorator';
import { User } from '../../entities';
import { AuthGuard } from '@nestjs/passport';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('conversation')
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly events: EventEmitter2,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @GetUser() user: User,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation = await this.conversationService.create(
      user,
      createConversationDto,
    );
    this.events.emit('conversation.create', conversation);
    return conversation;
  }

  @Get('conversations')
  @UseGuards(AuthGuard('jwt'))
  async getConversations(@GetUser() user: User) {
    return this.conversationService.findAll(user.id);
  }

  @Get(':id')
  getConversationById(@Param('id') id: string) {
    return this.conversationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }
}
