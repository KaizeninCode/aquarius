import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { auth, firestore } from "@/firebaseConfig";
import * as Notifications from 'expo-notifications'
import { SetupProvider } from "@/context/SetupContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProvider } from "@/context/UserContext";

type AppState = "loading" | "signedOut" | "main";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null)
  const router = useRouter();
  const segments = useSegments();

    // check hasSeenIntro flag once on mount
  useEffect(() => {
    const loadIntroFlag = async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenIntro");
        // console.log("Raw AsyncStorage value:", seen) // test log to confirm the existence & state of the flag
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
    const unsubscribe = auth().onAuthStateChanged(async (user:any) => {
      // console.log("===== AUTH CHANGED =====");
      // console.log("User:", user);
      // console.log("UID:", user?.uid);
      // console.log("Email:", user?.email);
      await AsyncStorage.setItem("hasSeenIntro", "true");
      setHasSeenIntro(true);

      setAppState(user ? "main" : "signedOut");
    });
    return unsubscribe;
  }, []);

  // redirect based on state, comparing against the current route group
  useEffect(() => {
    if (appState === "loading") return;
    if (hasSeenIntro === null) return;
    const group = segments[0];
    // console.log("hasSeenIntro:", hasSeenIntro)

    const inIntroGroup = group === "(intro)";
    const inAccountSetupGroup = group === "(account-setup)";
    const inAuthGroup = group === "(auth)";
    const inTabsGroup = group === "(tabs)";


    if (appState === "signedOut" && !inIntroGroup && !inAccountSetupGroup && !inAuthGroup) {
      router.replace(hasSeenIntro ? "/(auth)/login" : '/(intro)/welcome' );
      
    } else if (appState === "main" && !inTabsGroup) {
      router.replace("/(tabs)/job-screen");
    }
  }, [appState, hasSeenIntro, segments, router]);

// navigate to order/delivery tracking when notification is tapped
  useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const orderId = response.notification.request.content.data?.orderId;
      if (orderId) {
        router.push(`/(tabs)/job-screen/delivery-detail?orderId=${orderId}`);
      }
    }
  );
  return () => subscription.remove();
}, []);

  if (appState === "loading" || hasSeenIntro === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} />
        <Text>hasSeenIntro: {String(hasSeenIntro)}</Text>
      </View>
    );
  }

  return (
    <SetupProvider>
      <UserProvider>
        <StatusBar style="dark" />
        <Slot />
      </UserProvider>
    </SetupProvider>
  );
}
