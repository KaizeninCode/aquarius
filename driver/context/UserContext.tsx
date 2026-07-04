import { auth, firestore } from "@/firebaseConfig";
import { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  name: string;
  phone: string;
  role: string;
  defaultAddressId: string | null;
};

type UserContextType = {
  user: UserData | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    // outer listener - waits for auth to rehydrate
    const unsubscribeAuth = auth().onAuthStateChanged((firebaseUser) => {
      // clean up the previous firestore listener first
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = undefined;
      }
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      //  inner listener - live firestore updates on the user doc
      unsubscribeUser = firestore()
        .collection("users")
        .doc(firebaseUser.uid)
        .onSnapshot(
          (snap) => {
            if (snap.exists()) setUser(snap.data() as UserData);
            setLoading(false);
          },
          (error) => {
            console.error("Failed to load user doc: ", error);
            setLoading(false);
          },
        );

      // clean up firestore listener when auth state changes again
      return unsubscribeUser;
    });

    return unsubscribeAuth;
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within SetupProvider.");
  return ctx;
}
