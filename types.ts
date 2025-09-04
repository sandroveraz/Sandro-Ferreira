
export type Mode = 'create' | 'edit';
export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic';
export type EditFunction = 'add-remove' | 'retouch' | 'style' | 'compose';
export type AspectRatio = '1:1' | '16:9' | '9:16';

export interface ImageData {
  base64: string;
  mimeType: string;
}