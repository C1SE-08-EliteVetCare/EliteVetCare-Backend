import {
  BadRequestException, ConflictException,
  Inject,
  Injectable
} from "@nestjs/common";
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, User } from '../../entities';
import { UserService } from '../user/user.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly converRepository: Repository<Conversation>,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async create(user: User, createConversationDto: CreateConversationDto) {
    if (user.id === createConversationDto.recipientId)
      throw new BadRequestException(
        'Cannot Create Conversation',
      );

    const existingConversation = await this.converRepository.findOne({
      where: [
        {
          creator: { id: user.id },
          recipient: { id: createConversationDto.recipientId },
        },
        {
          creator: { id: createConversationDto.recipientId },
          recipient: { id: user.id },
        },
      ],
    });

    if (existingConversation)
      throw new ConflictException('Conversation exists');

    const recipient = await this.userService.findOne(createConversationDto.recipientId);

    if (!recipient)
      throw new BadRequestException('Recipient not found');

    const conversation = this.converRepository.create({
      creator: user,
      recipient: recipient,
    });
    return this.converRepository.save(conversation);
  }

  findOne(id: number) {
    return this.converRepository.findOne({
      where: { id },
    });
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
        'creator.avatar'
      ])
      .leftJoin('conversation.recipient', 'recipient')
      .addSelect([
        'recipient.id',
        'recipient.fullName',
        'recipient.email',
        'recipient.avatar'
      ])
      .leftJoin('conversation.lastMessageSent', 'lastMessageSent')
      .addSelect([
        'lastMessageSent'
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
