export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 20;

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
