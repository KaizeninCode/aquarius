import { firestore, auth } from "../FirebaseConfig";

interface SaveAddressParams {
  lat: number;
  long: number;
  label: string;
  notes: string;
}

export async function saveAddress({
  lat,
  long,
  label,
  notes,
}: SaveAddressParams) {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error("Not signed in.");

  const addressRef = await firestore()
    .collection("users")
    .doc(userId)
    .collection("addresses")
    .add({
      label,
      lat,
      long,
      notes,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

  await firestore().collection("users").doc(userId).update({
    onboardingComplete: true,
    defaultAddressId: addressRef.id,
  });

  return addressRef;
}
