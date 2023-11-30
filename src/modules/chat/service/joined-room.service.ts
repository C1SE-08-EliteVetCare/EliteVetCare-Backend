import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinedRoom } from "../../../entities/joined-room.entity";
import { JoinedRoomI } from "../interfaces/joined-room.interface";
import { UserI } from "../../user/interface/user.interface";
import { RoomI } from "../interfaces/room.interface";

@Injectable()
export class JoinedRoomService {

  constructor(
    @InjectRepository(JoinedRoom)
    private readonly joinedRoomRepository: Repository<JoinedRoom>
  ) { }

  async create(joinedRoom: JoinedRoomI): Promise<JoinedRoomI> {
    return this.joinedRoomRepository.save(joinedRoom);
  }

  async findByUser(user: UserI): Promise<JoinedRoomI[]> {
    return this.joinedRoomRepository.find({ where: {user} });
  }

  async findByRoom(room: RoomI): Promise<JoinedRoomI[]> {
    return this.joinedRoomRepository.find({ where: {room} });
  }

  async deleteBySocketId(socketId: string) {
    return this.joinedRoomRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.joinedRoomRepository
      .createQueryBuilder()
      .delete()
      .execute();
  }

}
