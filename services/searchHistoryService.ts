import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { SearchHistory } from "../types/SearchHistory";

const historyRef = (userId: string) =>
  collection(db, "users", userId, "searchHistory");

// Document ID: keyword_tanggal_waktu
// Contoh: denny_caknan_20240619_143022
const makeHistoryId = (keyword: string): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const clean = keyword
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 20);
  return `${clean}_${date}_${time}`;
};

export const saveSearchHistory = async (
  userId: string,
  keyword: string
): Promise<void> => {
  if (!keyword.trim()) return;
  const docId = makeHistoryId(keyword);
  await setDoc(doc(historyRef(userId), docId), {
    id: docId,
    keyword: keyword.trim(),
    searchedAt: serverTimestamp(),
  });
};

export const getSearchHistory = async (
  userId: string
): Promise<SearchHistory[]> => {
  try {
    const q = query(historyRef(userId), orderBy("searchedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      keyword: d.data().keyword,
      createdAt: d.data().searchedAt?.toDate(),
    }));
  } catch {
    return [];
  }
};

export const deleteSearchHistory = async (
  userId: string,
  historyId: string
): Promise<void> => {
  await deleteDoc(doc(historyRef(userId), historyId));
};

export const clearSearchHistory = async (userId: string): Promise<void> => {
  const snapshot = await getDocs(historyRef(userId));
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
};

export const getSearchHistoryCount = async (
  userId: string
): Promise<number> => {
  try {
    const snapshot = await getDocs(historyRef(userId));
    return snapshot.size;
  } catch {
    return 0;
  }
};