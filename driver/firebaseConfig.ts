// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-MGds9AJLgql_KXKQR5nyHKwmvf-zGTA",
  authDomain: "aquarius-3c41b.firebaseapp.com",
  projectId: "aquarius-3c41b",
  storageBucket: "aquarius-3c41b.firebasestorage.app",
  messagingSenderId: "545829874187",
  appId: "1:545829874187:web:e58cff9d0ff17d89a7350e",
  measurementId: "G-9K7076BG8K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);