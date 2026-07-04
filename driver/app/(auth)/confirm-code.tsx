import { View, Text, TextInput, Button, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSetup } from "../../context/SetupContext";
import { firestore, auth } from "@/firebaseConfig";
import { useRouter, useLocalSearchParams } from "expo-router";
import { registerPushToken } from "@/utils/registerPushToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmCodeScreen = () => {
  const { verificationId } = useLocalSearchParams<{
    verificationId: string;
    phone: string;
  }>();
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setupData, clearSetupData } = useSetup();

  const confirmCode = async () => {
    if (!code.trim()) {
      setError("Please enter the code.");
      return;
    }

    setConfirming(true);
    setError("");

    try {
      // confirm the code with RNF
      const credential = auth.PhoneAuthProvider.credential(
        verificationId,
        code,
      );
      const userCredential = await auth().signInWithCredential(credential);
      const userId = userCredential.user.uid;

      const userRef = await firestore().collection("users").doc(userId).get();
      if (userRef.exists()) return; // returning user. skip the firestore rewrite
      

      // persist address we collected earlier to the firestore now that we have a uid
      let addressId: string | undefined;
      if (setupData.address) {
        const addressRef = await firestore().collection("addresses").add({
          userId,
          label: setupData.address.label,
          lat: setupData.address.lat,
          lng: setupData.address.lng,
          notes: setupData.address.notes,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        addressId = addressRef.id;
      }

      // write user document to firestore
      await firestore()
        .collection("users")
        .doc(userId)
        .set({
          name: setupData.name,
          phone: userCredential.user.phoneNumber,
          role: "customer",
          onboardingComplete: true,
          defaultAddressId: addressId ?? null,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // register push token
      await registerPushToken(userId);

      await AsyncStorage.setItem("hasSeenIntro", "true");

      clearSetupData();

      // navigate to the home screen
      router.replace("/(tabs)/job-screen");
    } catch (error) {
      console.error("Invalid code: ", error);
      setError("Invalid code. Please try again.");
    }
  };

  const insets = useSafeAreaInsets()
  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-5" style={{paddingBottom: insets.bottom}}>
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
          keyboardType="phone-pad"
        />

        {error && <Text className="font-red-500 mb-2.5">{error}</Text>}

        <TouchableOpacity
          className={`py-4 rounded-2xl items-center ${confirming ? "bg-slate-200" : "bg-blue-500"}`}
          onPress={confirmCode}
          disabled={confirming}
        >
          <Text
            className={`font-bold text-base ${confirming ? "text-slate-400" : "text-white"}`}
          >
            {confirming ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ConfirmCodeScreen;
