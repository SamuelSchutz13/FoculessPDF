export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 20;
/** Each split range becomes a full PDF in memory, so cap how many one request can create. */
export const MAX_SPLIT_PARTS = 100;

export const MimeType = {
  PDF: 'application/pdf',
  ZIP: 'application/zip',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
} as const;

export const uploadOptions = {
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES },
};

export const PAGE_RANGES_PATTERN = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;

export const PAGE_ORDER_PATTERN = /^\d+(,\d+)*$/;
