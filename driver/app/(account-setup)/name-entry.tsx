import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useSetup } from "@/context/SetupContext";


const NameEntry = () => {
  const router = useRouter();
  const {setName} = useSetup();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    // console.log('Continue tapped, name: ', input)
    if (!input.trim()) {
      setError("Please enter your name.");
      return;
    }

    setName(input.trim())
    // console.log('Navigating to login screen...');
    router.push("/(auth)/login");
  };
  return (
    <KeyboardAvoidingView
      className="flex-1 p-6 justify-center bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text className="text-2xl font-bold mb-2">What's your name?</Text>
      <Text className="text-md text-[#666] mb-6">
        So our clients know who will be delivering their products.
      </Text>
      <TextInput
        className="border border-slate-300 rounded-lg p-3 text-base mb-6"
        placeholder="Enter your name"
        value={input}
        onChangeText={setInput}
        autoFocus
      />
      {error && <Text className="text-[#dc2626] mb-3">{error}</Text>}
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-2xl items-center"
        onPress={handleContinue}
        // disabled={saving}
      >
        <Text className="font-bold text-lg text-white">
          {/* {saving ? "Saving..." : "Continue"} */}
          Continue
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default NameEntry;
