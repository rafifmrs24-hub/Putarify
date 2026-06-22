import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../firebaseConfig";
import {
  createUserProfile,
  getUsernameByUid,
  isUsernameAvailable,
  updateLastLogin,
} from "../services/userService";

interface AuthContextType {
  user: User | null;
  username: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  // userId yang dipakai sebagai path Firestore = username
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Ambil username dari Firestore berdasarkan UID
        const uname = await getUsernameByUid(firebaseUser.uid);
        setUsername(uname);
      } else {
        setUsername(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const uname = await getUsernameByUid(credential.user.uid);
    setUsername(uname);
    if (uname) await updateLastLogin(uname);
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ): Promise<void> => {
    // Cek username tersedia sebelum buat akun
    const available = await isUsernameAvailable(username);
    if (!available) {
      throw new Error("USERNAME_TAKEN");
    }

    let credential;
    try {
      // Buat akun Firebase Auth
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      // Error dari Firebase Auth (email duplikat, invalid password, dll)
      throw e;
    }

    try {
      // Simpan profil ke Firestore
      await createUserProfile(credential.user.uid, email, username);
      setUsername(username.toLowerCase());
    } catch (e: unknown) {
      // Jika gagal simpan ke Firestore, hapus akun Auth yang baru dibuat
      // agar tidak ada akun orphan
      if (credential?.user) {
        await credential.user.delete();
      }
      throw new Error("FIRESTORE_ERROR");
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUsername(null);
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    return await isUsernameAvailable(username);
  };

  // userId yang dipakai sebagai path Firestore = username (bukan UID)
  const userId = username;

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        loading,
        login,
        register,
        logout,
        checkUsername,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};