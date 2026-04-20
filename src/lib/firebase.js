import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZwF7FFWcG6ciU9zOVQsAJtQzeR4v9bBM",
  authDomain: "beyond-the-pain.firebaseapp.com",
  projectId: "beyond-the-pain",
  storageBucket: "beyond-the-pain.firebasestorage.app",
  messagingSenderId: "1052035165713",
  appId: "1:1052035165713:web:9cdfbe6bbb179a1238cbb0",
  measurementId: "G-BVH72X84ZP"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
