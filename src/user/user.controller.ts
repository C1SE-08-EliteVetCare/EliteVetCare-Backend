import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Put,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator, Patch, Query
} from "@nestjs/common";
import { UserService } from './user.service';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from '../auth/guard/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/user.decorator';
import { User } from '../entities';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilterUserDto } from "./dto/filter-user.dto";

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(new RoleGuard(['Pet Owner', 'Vet', 'Admin']))
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Get('me')
  getCurrentUser(@GetUser() user: User) {
    return this.userService.getCurrentUser(user);
  }

  @UseGuards(new RoleGuard(['Admin']))
  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: FilterUserDto): Promise<any> {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/update-profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @GetUser('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/upload-avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(
    @GetUser('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(id, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @GetUser('id') id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, changePasswordDto);
  }

  @UseGuards(new RoleGuard(['Admin']))
  @UseGuards(AuthGuard('jwt'))
  @Patch('/update-role')
  updateRole(@Body() body: {userId: string, roleId: string}) {
    return this.userService.updateRole(+body.userId, +body.roleId)
  }
}
