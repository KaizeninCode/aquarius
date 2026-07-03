import React, { useState, useRef } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
// import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { PhoneAuthProvider } from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const recaptchaVerifier = useRef(null);
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const sendCode = async () => {
    if (!phone.trim()){
      setError('Please enter your phone number.')
      return
    }

    setSending(true)
    setError('')

    try {
      const confirmation = await auth().signInWithPhoneNumber(phone)

      router.push({
        pathname: "/(auth)/confirm-code",
        params: { verificationId: confirmation.verificationId },
      });
    } catch (error) {
      console.error("Failed to send code: ", error);
      setError('Could not send the code. Check the number and try again.')
    } finally {
      setSending(false)
    }
  };

  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView className="flex-1 justify-center bg-white p-5" style={{paddingBottom: insets.bottom}}>
      <View className="rounded-lg p-5">
        {/* <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={auth.app.options}
          // className="flex-1 bg-red-300"
        /> */}

        <Text className="text-2xl text-center mb-5 font-bold">Log In</Text>
        <Text className="text-lg mb-3 font-medium">Enter your phone number (start with +254). We'll send you a verification code.</Text>
        <TextInput
          placeholder="+254700123456"
          placeholderTextColor={'gray'}
          value={phone}
          onChangeText={setPhone}
          className="rounded-lg border border-slate-400/50 p-3"
          keyboardType="phone-pad"
        />
        <TouchableOpacity
        className={`py-4 rounded-2xl items-center ${sending ? "bg-slate-200" : "bg-blue-500"}`}
        onPress={sendCode}
        disabled={sending}
      >
        <Text className={`font-bold text-base ${sending ? "text-slate-400" : "text-white"}`}>
          {sending ? "Sending..." : "Send Code"}
        </Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
