import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  Put, Query
} from "@nestjs/common";
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from '../auth/guard/role.guard';
import { GetUser } from '../user/decorator/user.decorator';
import { IsOptional } from 'class-validator';
import { FilterPetDto } from "./dto/filter-pet.dto";

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @UseGuards(new RoleGuard(['Pet Owner']))
  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @UseInterceptors(FileInterceptor('avatar'))
  create(
    @GetUser('id') id: number,
    @Body() createPetDto: CreatePetDto,
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
    return this.petService.create(id, createPetDto, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('pets')
  @HttpCode(HttpStatus.OK)
  findAll(@GetUser('id') ownerId: number, @Query() query: FilterPetDto) {
    return this.petService.findAll(ownerId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  update(
    @Param('id') id: string,
    @GetUser('id') ownerId: number,
    @Body() updatePetDto: UpdatePetDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.petService.update(+id, ownerId, updatePetDto, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @GetUser('id') ownerId: number) {
    return this.petService.remove(+id, ownerId);
  }
}
