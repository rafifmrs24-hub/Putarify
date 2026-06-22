import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Song } from "../types/Song";

const favoritesRef = (userId: string) =>
  collection(db, "users", userId, "favorites");

// Document ID = trackId lagu
export const saveFavoriteSong = async (
  userId: string,
  song: Song
): Promise<void> => {
  const docId = String(song.trackId);
  const docRef = doc(favoritesRef(userId), docId);
  await setDoc(docRef, {
    trackId: song.trackId,
    trackName: song.trackName,
    artistName: song.artistName,
    collectionName: song.collectionName,
    artworkUrl100: song.artworkUrl100,
    previewUrl: song.previewUrl ?? null,
    primaryGenreName: song.primaryGenreName ?? null,
    trackPrice: song.trackPrice ?? null,
    currency: song.currency ?? null,
    savedAt: serverTimestamp(),
  });
};

export const getFavoriteSongs = async (userId: string): Promise<Song[]> => {
  try {
    const q = query(favoritesRef(userId), orderBy("savedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as Song);
  } catch {
    return [];
  }
};

export const deleteFavoriteSong = async (
  userId: string,
  trackId: number
): Promise<void> => {
  await deleteDoc(doc(favoritesRef(userId), String(trackId)));
};

export const checkIsFavorite = async (
  userId: string,
  trackId: number
): Promise<boolean> => {
  const snapshot = await getDoc(doc(favoritesRef(userId), String(trackId)));
  return snapshot.exists();
};

export const getFavoriteCount = async (userId: string): Promise<number> => {
  try {
    const snapshot = await getDocs(favoritesRef(userId));
    return snapshot.size;
  } catch {
    return 0;
  }
};