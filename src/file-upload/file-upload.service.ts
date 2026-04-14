import { BadRequestException, Injectable } from '@nestjs/common';
import cloudinary from './cloudinary/config';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class FileUploadService {
  async handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('no file uploaded');
    }

    // validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('invalid file type');
    }

    // validate file size (e.g., max 5mb)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('file is too large!');
    }

    //upload to cloudinary
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'book-store',
          },
          (error, result) => {
            if (error) return reject(new Error(error.message));
            if (!result) return reject(new Error('Upload failed!'));
            resolve(result);
          },
        )
        .end(file.buffer);
    });

    return {
      message: 'File uploaded successfully',
      url: result.secure_url,
    };
  }
}
