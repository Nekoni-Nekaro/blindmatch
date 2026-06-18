import {
  Controller, Post, UseGuards, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilesService } from './files.service';
import { User } from '../users/entities/user.entity';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('photo')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const url = await this.filesService.uploadPhoto(file, user.id);
    return { url };
  }

  @Post('voice')
  @ApiOperation({ summary: 'Upload voice intro' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadVoice(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const url = await this.filesService.uploadVoice(file, user.id);
    return { url };
  }
}
