import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../../entities/room.entity';
import { PaginationDto } from '../dto/pagination.dto';
import { User } from '../../../entities';
import { RoomI } from '../interfaces/room.interface';
import { paginate } from "nestjs-typeorm-paginate";
import { UserI } from "../../user/interface/user.interface";

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async createRoom(room: RoomI, user: User) {
    const newRoom = await this.addCreatorToRoom(room, user);
    return this.roomRepository.save(newRoom);
  }

  async getRoom(roomId: number): Promise<RoomI> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['users'],
    });
  }

  async getRoomsForUser(userId: number, options: PaginationDto) {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updated_at', 'DESC');

    return paginate(query, options);
  }

  async addCreatorToRoom(room: RoomI, creator: User) {
    room.users.push(creator);
    return room;
  }
}
