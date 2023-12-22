import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation, Message, User } from '../../entities';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async create({ content, conversationId }: CreateMessageDto, user: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['creator', 'recipient', 'lastMessageSent'],
    });
    const { creator, recipient } = conversation;
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (creator.id !== user.id && recipient.id !== user.id)
      throw new ForbiddenException('Cannot create message');

    // conversation.creator = instanceToPlain(conversation.creator) as User;
    // conversation.recipient = instanceToPlain(conversation.recipient) as User;
    //
    // create message
    const newMessage = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
    });
    const savedMessage = await this.messageRepository.save(newMessage);
    conversation.lastMessageSent = savedMessage;
    const updatedConversation = await this.conversationRepository.save(conversation);
    return {
      message: instanceToPlain(savedMessage),
      conversation: instanceToPlain(updatedConversation)
    };
  }

  findAll(user: User, conversationId: number) {
    // return this.messageRepository.find({
    //   where: { conversation: { id: conversationId } },
    //   order: {
    //     createdAt: 'DESC'
    //   },
    //   relations: ['author']
    // });
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.author', 'author')
      .addSelect([
        'author.id',
        'author.fullName',
        'author.avatar'
      ])
      .where('message.conversation.id = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
