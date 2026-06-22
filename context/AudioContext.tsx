import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Song } from "../types/Song";

interface AudioContextType {
  currentSong: Song | null;
  songList: Song[];
  currentIndex: number;
  isPlaying: boolean;
  playSong: (song: Song, list?: Song[], index?: number) => void;
  pauseSong: () => void;
  stopSong: () => void;
  playNext: () => void;
  playPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songList, setSongList] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const player = useAudioPlayer(
    currentSong?.previewUrl ? { uri: currentSong.previewUrl } : null
  );
  const status = useAudioPlayerStatus(player);
  const isPlaying = status.playing ?? false;

  const hasNext = currentIndex < songList.length - 1;
  const hasPrev = currentIndex > 0;

  // Auto play saat lagu berubah
  useEffect(() => {
    if (currentSong?.previewUrl) {
      setTimeout(() => {
        try { player.play(); } catch {}
      }, 300);
    }
  }, [currentSong]);

  // Putar lagu — bisa dengan list dan index sekaligus
  const playSong = (song: Song, list?: Song[], index?: number) => {
    if (list) setSongList(list);
    if (index !== undefined) setCurrentIndex(index);

    if (currentSong?.trackId === song.trackId) {
      // Lagu sama — resume
      try { player.play(); } catch {}
    } else {
      setCurrentSong(song);
    }
  };

  const pauseSong = () => {
    try { player.pause(); } catch {}
  };

  const stopSong = () => {
    try { player.pause(); } catch {}
    setCurrentSong(null);
    setSongList([]);
    setCurrentIndex(0);
  };

  // Putar lagu berikutnya
  const playNext = () => {
    if (!hasNext) return;
    const newIndex = currentIndex + 1;
    const nextSong = songList[newIndex];
    if (!nextSong) return;
    setCurrentIndex(newIndex);
    setCurrentSong(nextSong);
  };

  // Putar lagu sebelumnya
  const playPrev = () => {
    if (!hasPrev) return;
    const newIndex = currentIndex - 1;
    const prevSong = songList[newIndex];
    if (!prevSong) return;
    setCurrentIndex(newIndex);
    setCurrentSong(prevSong);
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        songList,
        currentIndex,
        isPlaying,
        playSong,
        pauseSong,
        stopSong,
        playNext,
        playPrev,
        hasNext,
        hasPrev,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudioContext must be used within AudioProvider");
  return context;
};