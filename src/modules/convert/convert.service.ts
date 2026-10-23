import { Injectable, NotImplementedException } from '@nestjs/common';
import type { ImageFormat } from './dto/pdf-to-image.dto';

@Injectable()
export class ConvertService {
  async imageToPdf(_images: Buffer[]): Promise<Uint8Array> {
    throw new NotImplementedException('Image to PDF is not implemented yet');
  }

  /** Returns a ZIP with one image per page. */
  async pdfToImage(_file: Buffer, _format: ImageFormat): Promise<Uint8Array> {
    throw new NotImplementedException('PDF to image is not implemented yet');
  }
}
