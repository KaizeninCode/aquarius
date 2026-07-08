import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const info = () => {
  const router = useRouter();
  return (
    <SafeAreaView
      className="flex-1 bg-white p-10 items-center justify-between"
      style={{ paddingBottom: useSafeAreaInsets().bottom }}
    >
      <Text className="text-5xl font-semibold">
        Making home deliveries easier.
      </Text>
      <View className="h-2/5 w-full shadow-md bg-slate-200 rounded-3xl outline" />
      <Text className="text-2xl mb-10">
        Reducing the hassle of traditional home deliveries.
      </Text>
      <TouchableOpacity
        className="bg-green-600 p-4 rounded-lg"
        onPress={() => router.replace("/(account-setup)/name-entry")}
      >
        <Text className="uppercase text-white">Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mb-10" onPress={() => router.replace("/(auth)/login")}>
        <Text className="uppercase text-green-600">
          I already have an account
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default info;
