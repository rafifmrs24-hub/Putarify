export interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl?: string;
  primaryGenreName?: string;
  trackPrice?: number;
  currency?: string;
}
