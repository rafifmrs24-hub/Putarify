import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../firebaseConfig";
import { Playlist } from "../types/Playlist";
import { Song } from "../types/Song";

const playlistsRef = (userId: string) =>
  collection(db, "users", userId, "playlists");

// Document ID: nama_playlist_tanggal_waktu
// Contoh: favorit_pagi_20240619_143022
const makePlaylistId = (name: string): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 20);
  return `${clean}_${date}_${time}`;
};

export const createPlaylist = async (
  userId: string,
  name: string,
  description?: string
): Promise<void> => {
  const docId = makePlaylistId(name);
  await setDoc(doc(playlistsRef(userId), docId), {
    id: docId,
    name,
    description: description ?? "",
    songs: [],
    totalSongs: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getPlaylists = async (userId: string): Promise<Playlist[]> => {
  try {
    const q = query(playlistsRef(userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      description: d.data().description,
      songs: d.data().songs ?? [],
      createdAt: d.data().createdAt?.toDate(),
    }));
  } catch {
    return [];
  }
};

export const deletePlaylist = async (
  userId: string,
  playlistId: string
): Promise<void> => {
  await deleteDoc(doc(playlistsRef(userId), playlistId));
};

export const addSongToPlaylist = async (
  userId: string,
  playlistId: string,
  song: Song
): Promise<void> => {
  const alreadyIn = await checkSongInPlaylist(userId, playlistId, song.trackId);
  if (alreadyIn) {
    Alert.alert("Info", "Lagu sudah ada di playlist ini.");
    return;
  }
  const docRef = doc(playlistsRef(userId), playlistId);
  const snapshot = await getDoc(docRef);
  const currentSongs: Song[] = snapshot.data()?.songs ?? [];
  await updateDoc(docRef, {
    songs: arrayUnion(song),
    totalSongs: currentSongs.length + 1,
    updatedAt: serverTimestamp(),
  });
};

export const removeSongFromPlaylist = async (
  userId: string,
  playlistId: string,
  trackId: number
): Promise<void> => {
  const docRef = doc(playlistsRef(userId), playlistId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return;
  const songs: Song[] = snapshot.data().songs ?? [];
  const songToRemove = songs.find((s) => s.trackId === trackId);
  if (songToRemove) {
    await updateDoc(docRef, {
      songs: arrayRemove(songToRemove),
      totalSongs: Math.max(0, songs.length - 1),
      updatedAt: serverTimestamp(),
    });
  }
};

export const checkSongInPlaylist = async (
  userId: string,
  playlistId: string,
  trackId: number
): Promise<boolean> => {
  const snapshot = await getDoc(doc(playlistsRef(userId), playlistId));
  if (!snapshot.exists()) return false;
  const songs: Song[] = snapshot.data().songs ?? [];
  return songs.some((s) => s.trackId === trackId);
};

export const getPlaylistCount = async (userId: string): Promise<number> => {
  try {
    const snapshot = await getDocs(playlistsRef(userId));
    return snapshot.size;
  } catch {
    return 0;
  }
};