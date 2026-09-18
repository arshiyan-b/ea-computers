import { BadRequestException, Controller, Get, NotFoundException, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { extname, join, normalize } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { UploadsService } from './uploads.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiBearerAuth('access-token')
  @Roles('ADMIN')
  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '[Admin] Upload a product/category/brand image' })
  async upload(@Req() req: FastifyRequest, @Query('folder') folder?: string) {
    const data = await req.file();
    if (!data) throw new BadRequestException('No file uploaded');

    const buffer = await data.toBuffer();
    return this.uploadsService.uploadImage(
      {
        buffer,
        originalname: data.filename,
        mimetype: data.mimetype,
        size: buffer.length,
      },
      folder,
    );
  }

  // Serves files written by the local storage provider. Not used when
  // STORAGE_PROVIDER is "s3" or "cloudinary", which return fully public URLs.
  @Public()
  @Get('static/:folder/:filename')
  async serveLocalFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: FastifyReply,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads');
    const filePath = normalize(join(uploadsDir, folder, filename));
    if (!filePath.startsWith(uploadsDir) || !existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    const buffer = await readFile(filePath);
    const contentType = IMAGE_CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
    res.header('Content-Type', contentType).send(buffer);
  }
}
