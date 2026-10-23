import { StreamableFile } from '@nestjs/common';

export function fileResponse(data: Uint8Array, filename: string, type: string): StreamableFile {
  return new StreamableFile(data, { type, disposition: `attachment; filename="${filename}"` });
}
