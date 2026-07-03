import React, { useState, useRef } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { PhoneAuthProvider } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const recaptchaVerifier = useRef(null);
  const [phone, setPhone] = useState("");

  const router = useRouter();

  const sendCode = async () => {
    try {
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(
        phone,
        recaptchaVerifier.current!,
      );
      router.push({
        pathname: "/(auth)/confirm-code",
        params: { verificationId: id, phone },
      });
    } catch (error) {
      console.error("Failed to send code: ", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-slate-50 p-5">
      <View className="rounded-lg p-5 bg-slate-100/40">
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={auth.app.options}
        //   className="flex-1 bg-red-300"
        />

        <Text className="text-2xl mb-5 font-bold text-center">Log in</Text>
        <Text className="text-lg mb-3 font-medium">Enter your phone number (start with +254)</Text>
        <TextInput
          placeholder="+254722777888"
          placeholderTextColor={'gray'}
          value={phone}
          onChangeText={setPhone}
          className="rounded-lg border border-slate-300 p-3 mb-6"
        />
        <Button title="Send Code" onPress={sendCode} />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
