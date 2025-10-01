export type Mode = 'create' | 'edit' | 'video';

export type CreateFunction = 'free' | 'sticker' | 'text' | 'comic' | 'photorealistic';

export type EditFunction = 'add-remove' | 'retouch' | 'style' | 'compose' | 'upscale';

export interface UploadedImage {
  file: File;
  base64: string;
  mimeType: string;
}

export const artisticStyles = ['Nenhum', 'Vintage', 'Cyberpunk', 'Impressionist', 'Pop Art', 'Steampunk'] as const;
export type ArtisticStyle = typeof artisticStyles[number];

export const visualFilters = ['Grayscale', 'Sepia', 'Invert'] as const;
export type VisualFilter = typeof visualFilters[number];

export const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'] as const;
export type AspectRatio = typeof aspectRatios[number];

export interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  tags: string[];
  creationMode: string;
}

export interface HistoryItem {
  url: string;
  text: string | null;
  action: string;
  type: 'image' | 'video';
}