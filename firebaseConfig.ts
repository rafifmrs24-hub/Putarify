import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBX63pINY2cMUdsPqPh1Aksx7iYarvmns4",
  authDomain: "musicapps-7628a.firebaseapp.com",
  projectId: "musicapps-7628a",
  storageBucket: "musicapps-7628a.firebasestorage.app",
  messagingSenderId: "427680206580",
  appId: "1:427680206580:web:a9e879f2695ff2c73418a1"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export service agar bisa digunakan di file lain
export const auth = getAuth(app);
export const db = getFirestore(app);
