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
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorator/user.decorator';
import { User } from '../../entities';
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService,
  private eventEmitter: EventEmitter2

  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@GetUser() user: User, @Body() createMessageDto: CreateMessageDto) {
    const message = await this.messageService.create(createMessageDto, user);
    this.eventEmitter.emit('message.create', message)
  }

  @Get(':conversationId')
  @UseGuards(AuthGuard('jwt'))
  async getMessageFromConversation(
    @GetUser() user: User,
    @Param('conversationId') conversationId: string,
  ) {
    const messages = await this.messageService.findAll(user, +conversationId);
    return {
      id: parseInt(conversationId),
      data: messages
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
