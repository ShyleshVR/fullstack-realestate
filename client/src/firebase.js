// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "fullstack-estate.firebaseapp.com",
  projectId: "fullstack-estate",
  storageBucket: "fullstack-estate.appspot.com",
  messagingSenderId: "253994425457",
  appId: "1:253994425457:web:e356560cd029aac43bcfd0",
  measurementId: "G-8FM6HN9SV2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);