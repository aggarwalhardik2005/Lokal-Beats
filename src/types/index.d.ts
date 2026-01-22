declare module '*.png'
declare module '*.jpg'
export interface Song {
  id: string;
  name: string;
  duration: number;
  language: string;
  year?: string;
  releaseDate?: string | null;
  label?: string;
  primaryArtists: string;
  primaryArtistsId?: string;
  featuredArtists?: string;
  explicitContent?: number;
  playCount?: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  album: {
    id: string;
    name: string;
    url?: string;
  };
  artists?: {
    primary: Array<{
      id: string;
      name: string;
    }>;
  };
  image: Array<{
    quality: string;
    link?: string;
    url?: string;
  }>;
  downloadUrl: Array<{
    quality: string;
    link?: string;
    url?: string;
  }>;
  localUri?: string;
  isDownloaded?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image?: Array<{
    quality: string;
    link: string;
  }>;
  followerCount?: string;
  fanCount?: string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: string;
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
}

export interface Album {
  id: string;
  name: string;
  year?: string;
  releaseDate?: string;
  songCount?: string;
  url?: string;
  primaryArtists?: string;
  image?: Array<{
    quality: string;
    link: string;
  }>;
  songs?: Song[];
}

export interface SearchResponse {
  status: string;
  data: {
    results: Song[];
    total: number;
    start: number;
  };
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
}

export type RootStackParamList = {
  Home: undefined;
  Player: undefined;
  Queue: undefined;
  Search: undefined;
};