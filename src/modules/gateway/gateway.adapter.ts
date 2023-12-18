import { IoAdapter } from "@nestjs/platform-socket.io";
import { AuthService } from "../auth/auth.service";
import { AuthenticatedSocket } from "./interface/AuthenticatedSocket.interface";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";

export class WebsocketAdapter extends IoAdapter {
  constructor(
    app,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwt: JwtService
  ) {
    super(app);
  }
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.use(async (socket: AuthenticatedSocket, next) => {
      const authHeader = socket.handshake.headers.authorization;
      console.log('Inside Websocket Adapter Middleware');
      console.log((authHeader as string).split(' ')[1]);
      if (authHeader === null) {
        console.log('Client has no access token');
        return next(new Error('Not Authenticated'))
      }
      const payload = await this.jwt.verify(authHeader.split(' ')[1], {
        secret: this.configService.get('JWT_AT_SECRET'),
      });
      socket.user = await this.userService.findOne(payload['sub'])
      next()
    })
    return server;
  }
}