import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectedUser } from "../../../entities/connected-user.entity";
import { User } from "../../../entities";

@Injectable()
export class ConnectedUserService {
  constructor(
    @InjectRepository(ConnectedUser)
    private readonly connectedUserRepository: Repository<ConnectedUser>,
  ) {}

  async create(connectedUser: {
    socketId: string;
    user: User;
  }): Promise<ConnectedUser> {
    return this.connectedUserRepository.save(connectedUser);
  }

  async findByUser(user: User): Promise<ConnectedUser[]> {
    return this.connectedUserRepository.find({ where: user });
  }

  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.connectedUserRepository.createQueryBuilder().delete().execute();
  }
}
