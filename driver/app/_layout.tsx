import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import * as Notifications from 'expo-notifications'

type AppState = "loading" | "signedOut" | "main";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppState>("loading");
  const router = useRouter();
  const segments = useSegments();


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

    const inAuthGroup = group === "(auth)";
    const inTabsGroup = group === "(tabs)";


    if (appState === "signedOut" && !inAuthGroup) {
      router.replace("/(auth)/login" );
      
    } else if (appState === "main" && !inTabsGroup) {
      router.replace("/(tabs)/job-screen");
    }
  }, [appState, segments, router]);

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

  if (appState === "loading") {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Slot />
    </>
  );
}
