export interface Track {
  id: string;
  title: string;
  artist?: string;
  artwork?: string;
  url: string;
  duration?: number;
}

export type Playlist = {
  name: string;
  tracks: Track[];
  artworkPreview: string;
};

export type Artist = {
  name: string;
  tracks: Track[];
};

export type TrackWithPlaylist = Track & { playlist?: string[] };
