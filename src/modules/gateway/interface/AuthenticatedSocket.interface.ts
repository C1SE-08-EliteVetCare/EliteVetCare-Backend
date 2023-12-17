import { Socket } from 'socket.io';
import { User } from "../../../entities";
export interface AuthenticatedSocket extends Socket {
  user?: User;
}