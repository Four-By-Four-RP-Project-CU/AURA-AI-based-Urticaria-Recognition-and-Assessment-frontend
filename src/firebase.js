// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aura-1a366.firebaseapp.com",
  projectId: "aura-1a366",
  storageBucket: "aura-1a366.firebasestorage.app",
  messagingSenderId: "423937884768",
  appId: "1:423937884768:web:68e6c6099dde89ed727905",
  measurementId: "G-NFLWGSZLXJ"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();