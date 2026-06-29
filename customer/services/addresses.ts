import {collection, addDoc, doc, updateDoc, serverTimestamp} from 'firebase/firestore'
import { db, auth } from '../FirebaseConfig'

interface SaveAddressParams {
    lat: number
    long: number
    label: string
    notes: string
}

export async function saveAddress({lat, long, label, notes}: SaveAddressParams) {
    const userId = auth.currentUser?.uid
    if(!userId) throw new Error('Not signed in.')
    
    const addressRef = await addDoc(collection(db, 'addresses'), {
        userId, label, lat, long, notes, createdAt: serverTimestamp() 
    })

    await updateDoc(doc(db, 'users', userId), {
        onboardingComplete: true,
        defaultAddressId: addressRef.id
    })

    return addressRef
}

