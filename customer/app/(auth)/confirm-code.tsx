import { View, Text, TextInput, Button } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSetup } from "../context/SetupContext";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/FirebaseConfig";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { useRouter, useLocalSearchParams } from "expo-router";
import { registerPushToken } from "@/utils/registerPushToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmCodeScreen = () => {
  const { verificationId } = useLocalSearchParams<{
    verificationId: string;
    phone: string;
  }>();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setupData, clearSetupData } = useSetup();

  const confirmCode = async () => {
    try {
      // sign the user in using a credential
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await signInWithCredential(auth, credential);
      const userId = userCredential.user.uid;

      const userRef = doc(db, 'users', userId)
      const existing = await getDoc(userRef)

      if (existing.exists()) return // returning user. skip the firestore rewrite


      // persist address we collected earlier to the firestore now that we have a uid
      let addressId: string | undefined;
      if (setupData.address) {
        const addressRef = await addDoc(collection(db, "addresses"), {
          userId,
          label: setupData.address.label,
          lat: setupData.address.lat,
          lng: setupData.address.lng,
          notes: setupData.address.notes,
          createdAt: serverTimestamp(),
        });
        addressId = addressRef.id;
      }

      // write user document to firestore
      await setDoc(doc(db, "users", userId), {
        name: setupData.name,
        phone: userCredential.user.phoneNumber,
        role: "customer",
        onboardingComplete: true,
        defaultAddressId: addressId ?? null,
        createdAt: serverTimestamp(),
      });

      // register push token
      await registerPushToken(userId)

      await AsyncStorage.setItem('hasSeenIntro','true')

      clearSetupData();

      // navigate to the home screen
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Invalid code: ", error);
      setError("Invalid code. Please try again.");
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-5">
      <View className="rounded-lg p-5 w-full">
        <Text className="text-lg font-semibold text-black text-center">
          Enter the code sent to your phone
        </Text>
        <TextInput
          className="rounded-2xl border border-slate-200 p-3 mt-5 mb-3"
          placeholder="Enter code"
          placeholderTextColor={"gray"}
          value={code}
          onChangeText={setCode}
        />

        {error && <Text className="font-red-500 mb-2.5">{error}</Text>}

        <Button title="Confirm" onPress={confirmCode} />
      </View>
    </SafeAreaView>
  );
};

export default ConfirmCodeScreen;
