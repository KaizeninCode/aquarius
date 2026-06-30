import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/FirebaseConfig";
import { SetupProvider } from "./context/SetupContext";
import { CartProvider } from "./context/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppState = "loading" | "signedOut" | "main";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // check hasSeenIntro flag once on mount
  useEffect(() => {
    const loadIntroFlag = async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenIntro");
        setHasSeenIntro(seen === "true");
      } catch (error) {
        console.warn("Failed to read intro flag", error);
        setHasSeenIntro(false);
      }
    };

    loadIntroFlag();
  }, []);

  // listen for auth state. This determines what the user will be shown
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      // console.log("===== AUTH CHANGED =====");
      // console.log("User:", user);
      // console.log("UID:", user?.uid);
      // console.log("Email:", user?.email);

      setAppState(user ? "main" : "signedOut");
    });
    return unsubscribe;
  }, []);

  // redirect based on state, comparing against the current route group
  useEffect(() => {
    if (appState === "loading") return;
    const group = segments[0];
    // console.log('Redirect check — appState:', appState, 'group:', group, 'segments:', segments)

    const inIntroGroup = group === "(intro)";
    const inAccountSetupGroup = group === "(account-setup)";
    const inAuthGroup = group === "(auth)";
    const inTabsGroup = group === "(tabs)";

    /* Allow free movement through intro -> account-setup -> auth without forcing a redirect at every step. Redirect only when they're in a place they're not supposed to be in  */

    if (appState === "signedOut") {
      if (!inIntroGroup && !inAccountSetupGroup && !inAuthGroup) {
        router.replace(hasSeenIntro ? "/(auth)/login" : "/(intro)/welcome");
      }
    } else if (appState === "main" && !inTabsGroup) {
      router.replace("/(tabs)/home");
    }
  }, [appState, hasSeenIntro, segments, router]);

  if (appState === "loading") {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <SetupProvider>
      <StatusBar style="dark" />
      <CartProvider>
        <Slot />
      </CartProvider>
    </SetupProvider>
  );
}
