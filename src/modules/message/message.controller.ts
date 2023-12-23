import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseInterceptors
} from "@nestjs/common";
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../user/decorator/user.decorator';
import { User } from '../../entities';
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService,
  private eventEmitter: EventEmitter2

  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @GetUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
      file: Express.Multer.File,
  ) {
    console.log(createMessageDto);
    const message = await this.messageService.create(createMessageDto, user);
    this.eventEmitter.emit('message.create', message)
    return message;
  }

  @Post('upload-image')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('img'))
  async createByImage(
    @GetUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
      file: Express.Multer.File,
  ) {
    const message = await this.messageService.uploadImg(createMessageDto, user, file);
    this.eventEmitter.emit('message.create', message)
    return message;
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
