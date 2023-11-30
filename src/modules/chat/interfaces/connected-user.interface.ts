import { UserI } from "../../user/interface/user.interface";
export interface ConnectedUserI {
  id?: number;
  socketId: string;
  user: UserI;
}