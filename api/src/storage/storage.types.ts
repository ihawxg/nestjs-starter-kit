export interface LocalUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
}

export interface DownloadableStoredFile {
  absolutePath: string;
  filename: string;
  mimeType: string;
  size: number;
}
