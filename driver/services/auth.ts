import { signOut } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export const handleLogout = async () => {
  try {
    const userId = auth.currentUser?.uid
    // can be refactored to include an else statement later
    userId && await updateDoc(doc(db, 'users', userId), {isAvailable: false})
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};
