// Components
export { default as MusicPlayer } from './components/MusicPlayer';
export { default as LanguageSwitcher } from './components/LanguageSwitcher';
export { default as FileUpload } from './components/FileUpload';

// i18n
export { default as i18n } from './i18n';

// Types
export interface Track {
  id: number;
  title: string;
  artist: string;
  src: string;
  duration: number;
}

export interface MusicPlayerProps {
  tracks?: Track[];
  autoPlay?: boolean;
}

export interface LanguageSwitcherProps {
  variant?: 'icon' | 'text';
  size?: 'small' | 'medium' | 'large';
}