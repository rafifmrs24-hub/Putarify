import { Song } from "./Song";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt?: Date;
}
