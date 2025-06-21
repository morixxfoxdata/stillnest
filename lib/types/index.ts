export type LayoutStyle = 'masonry' | 'grid' | 'single-column' | 'staggered';

export interface Photo {
  id: string;
  user_id: string;
  title?: string;
  caption?: string;
  file_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  tags?: string[];
  series_id?: string;
  display_order?: number;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  equipment?: string;
  created_at: string;
}

export interface Series {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_photo_id?: string;
  is_public: boolean;
  created_at: string;
}

export interface PhotoCardProps {
  photo: Photo;
  showTitle?: boolean;
  showCaption?: boolean;
  enableLike?: boolean;
}

export interface GallerySettings {
  layout: LayoutStyle;
  photoOrder: 'custom' | 'chronological' | 'reverse-chronological';
  showCaptions: boolean;
  theme: 'light' | 'dark';
}