import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDKgFibOIl4qngKGyMeTJrBG2HC5QlGQsA",
  authDomain: "timevora-40aa8.firebaseapp.com",
  projectId: "timevora-40aa8",
  storageBucket: "timevora-40aa8.firebasestorage.app",
  messagingSenderId: "67219700156",
  appId: "1:67219700156:web:106ec864a7b5e29dbc13b9",
  measurementId: "G-9C47JTVD2W"
};

// Firebase is now hardcoded with provided keys
export const isFirebaseConfigured = true;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics lazily
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
