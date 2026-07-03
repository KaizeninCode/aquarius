import { auth, db } from "@/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

type UserData = {
  name: string;
  phone: string;
  role: string;
  defaultAddressId: string | null;
};



type UserContextType = {
  user: UserData | null;
  loading: boolean
};

const UserContext = createContext<UserContextType>({user: null, loading: true}) 

export function UserProvider({children}:{children:React.ReactNode}) {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubscribeUser: (()=> void) | undefined
        // outer listener - waits for auth to rehydrate
        const unsubscribeAuth = onAuthStateChanged(auth, firebaseUser => {
            // clean up the previous firestore listener first
            if (unsubscribeUser) {
                unsubscribeUser()
                unsubscribeUser = undefined
            }
            if (!firebaseUser) {
                setUser(null)
                setLoading(false)
                return

            }

            //  inner listener - live firestore updates on the user doc
            unsubscribeUser = onSnapshot(
                doc(db, 'users', firebaseUser.uid),
                snap => {
                    if (snap.exists()) setUser(snap.data() as UserData)
                    setLoading(false)
                },
                error => {
                    console.error('Failed to load user doc: ', error)
                },
            )

            // clean up firestore listener when auth state changes again
            return unsubscribeUser
        })

        return unsubscribeAuth
    }, [])

    return (
        <UserContext.Provider value={{user, loading}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const ctx = useContext(UserContext)
    if(!ctx) throw new Error('useUser must be used within SetupProvider.')
    return ctx
}
