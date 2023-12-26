import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable, NotFoundException
} from "@nestjs/common";
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, Message, User } from '../../entities';
import { UserService } from '../user/user.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly converRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  isCreated(userId: number, recipientId: number) {
    return this.converRepository.findOne({
      where: [
        {
          creator: { id: userId },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: userId },
        },
      ],
    });
  }

  async create(user: User, createConversationDto: CreateConversationDto) {
    const recipient = await this.userService.findByEmail(createConversationDto.email)

    if (!recipient) throw new NotFoundException('Recipient not found')
    if (user.id === recipient.id) throw new BadRequestException('Cannot Create Conversation')

    const existingConversation = await this.isCreated(user.id, recipient.id)

    if (existingConversation)
      throw new ConflictException('Conversation exists');

    const newConversation = this.converRepository.create({
      creator: user,
      recipient: recipient,
    });
    const conversation = await this.converRepository.save(newConversation)

    const newMessage = this.messageRepository.create({
      content: createConversationDto.message,
      conversation,
      author: user,
    });
    const message = await this.messageRepository.save(newMessage);

    await this.converRepository.update(
      { id: conversation.id },
      {
        lastMessageSent: message
      },
    );

    return {
      id: conversation.id,
      ...conversation,
      lastMessageSent: {
        id: message.id,
        content: message.content,
        imgUrl: message.imgUrl,
        createdAt: message.createdAt
      }
    };
  }

  findOne(id: number) {
    return this.converRepository.createQueryBuilder('conversation')
      .leftJoin('conversation.creator', 'creator')
      .addSelect([
        'creator.id',
        'creator.fullName',
        'creator.email',
        'creator.avatar',
      ])
      .leftJoin('conversation.recipient', 'recipient')
      .addSelect([
        'recipient.id',
        'recipient.fullName',
        'recipient.email',
        'recipient.avatar',
      ])
      .getOne()
  }

  async findAll(id: number) {
    // return this.participantService.findParticipantConversation(userId);
    return this.converRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.creator', 'creator')
      .addSelect([
        'creator.id',
        'creator.fullName',
        'creator.email',
        'creator.avatar',
      ])
      .leftJoin('conversation.recipient', 'recipient')
      .addSelect([
        'recipient.id',
        'recipient.fullName',
        'recipient.email',
        'recipient.avatar',
      ])
      .leftJoin('conversation.lastMessageSent', 'lastMessageSent')
      .addSelect([
        'lastMessageSent', 'lastMessageSent.author'
      ])
      .leftJoin('lastMessageSent.author', 'author')
      .addSelect([
        'author.id',
        'author.fullName',
        'author.email',
        'author.avatar',
      ])
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
