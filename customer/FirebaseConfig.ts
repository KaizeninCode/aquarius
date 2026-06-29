// firebaseConfig.ts
import { initializeApp } from "firebase/app";
// @ts-ignore: getReactNativePersistence exists in the RN bundle but is missing from public TS types
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-MGds9AJLgql_KXKQR5nyHKwmvf-zGTA",
  authDomain: "aquarius-3c41b.firebaseapp.com",
  projectId: "aquarius-3c41b",
  storageBucket: "aquarius-3c41b.firebasestorage.app",
  messagingSenderId: "545829874187",
  appId: "1:545829874187:web:bdeaf87d1c14ae81a7350e",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);