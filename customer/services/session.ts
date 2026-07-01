import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/FirebaseConfig";

const SESSION_TOKEN_KEY = "active_session_token";

function createSessionToken() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  const timePart = Date.now().toString(36);
  return `sess_${timePart}_${randomPart}`;
}

export async function getStoredSessionToken(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_TOKEN_KEY);
}

export async function clearStoredSessionToken(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
}

export async function activateSession(user: User | null): Promise<boolean> {
  if (!user) {
    await clearStoredSessionToken();
    return false;
  }

  const localToken = await getStoredSessionToken();
  const userDocRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userDocRef);
  const remoteToken = snapshot.data()?.activeSessionToken ?? null;

  if (localToken && localToken === remoteToken) {
    return true;
  }

  const nextToken = createSessionToken();

  await setDoc(
    userDocRef,
    {
      activeSessionToken: nextToken,
      sessionUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await AsyncStorage.setItem(SESSION_TOKEN_KEY, nextToken);
  return true;
}

export async function validateSession(user: User | null): Promise<boolean> {
  if (!user) {
    await clearStoredSessionToken();
    return false;
  }

  const localToken = await getStoredSessionToken();
  const userDocRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userDocRef);
  const remoteToken = snapshot.data()?.activeSessionToken ?? null;

  if (!remoteToken) {
    await activateSession(user);
    return true;
  }

  if (!localToken) {
    await AsyncStorage.setItem(SESSION_TOKEN_KEY, remoteToken);
    return true;
  }

  if (localToken !== remoteToken) {
    await clearStoredSessionToken();
    return false;
  }

  return true;
}
