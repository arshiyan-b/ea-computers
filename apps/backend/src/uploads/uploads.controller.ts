import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { join, normalize } from 'path';
import { existsSync } from 'fs';
import { UploadsService } from './uploads.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Upload a product/category/brand image' })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    return this.uploadsService.uploadImage(file, folder);
  }

  // Serves files written by the local storage provider. Not used when
  // STORAGE_PROVIDER is "s3" or "cloudinary", which return fully public URLs.
  @Public()
  @Get('static/:folder/:filename')
  serveLocalFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads');
    const filePath = normalize(join(uploadsDir, folder, filename));
    if (!filePath.startsWith(uploadsDir) || !existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    return res.sendFile(filePath);
  }
}
