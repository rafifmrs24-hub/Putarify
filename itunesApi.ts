import axios from "axios";
import { Song } from "../types/Song";

const BASE_URL = "https://itunes.apple.com/search";

// Mengambil daftar lagu dari iTunes Search API berdasarkan keyword
export const searchSongs = async (keyword: string): Promise<Song[]> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        term: keyword,
        country: "ID",
        media: "music",
        entity: "song",
        limit: 30,
      },
    });
    return response.data.results as Song[];
  } catch (error) {
    console.error("iTunes API error:", error);
    return [];
  }
};
