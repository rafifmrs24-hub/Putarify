import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Cek apakah username sudah dipakai
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "usernames", username.toLowerCase());
    const snapshot = await getDoc(docRef);
    return !snapshot.exists();
  } catch {
    return false;
  }
};

// Gunakan batch write agar users dan usernames ditulis atomik (bersamaan)
export const createUserProfile = async (
  uid: string,
  email: string,
  username: string
): Promise<void> => {
  const batch = writeBatch(db);
  const cleanUsername = username.toLowerCase();

  // Document profil user
  const userRef = doc(db, "users", cleanUsername);
  batch.set(userRef, {
    uid,
    email,
    username: cleanUsername,
    displayName: username,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  // Reservasi username
  const usernameRef = doc(db, "usernames", cleanUsername);
  batch.set(usernameRef, {
    uid,
    email,
    username: cleanUsername,
    reservedAt: serverTimestamp(),
  });

  // Commit keduanya sekaligus
  await batch.commit();
};

// Ambil username dari UID
export const getUsernameByUid = async (uid: string): Promise<string | null> => {
  try {
    const q = query(
      collection(db, "usernames"),
      where("uid", "==", uid)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data().username;
  } catch {
    return null;
  }
};

// Update lastLoginAt saat login
export const updateLastLogin = async (username: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "users", username.toLowerCase()), {
      lastLoginAt: serverTimestamp(),
    });
  } catch {}
};