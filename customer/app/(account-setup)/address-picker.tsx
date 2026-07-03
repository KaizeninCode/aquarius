import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSetup } from "../context/SetupContext";
import { auth, firestore } from "@/FirebaseConfig";

const AddressPicker = () => {
  const router = useRouter();
  const { setAddress } = useSetup();
  const insets = useSafeAreaInsets();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [label, setLabel] = useState("Home");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setRegion({
          latitude: -1.2921,
          longitude: 36.8219,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } catch (err) {
        console.error("getCurrentPositionAsync failed:", err);
        setRegion({
          latitude: -1.2921,
          longitude: 36.8219,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }); // fallback
      }
    })();
  }, []);

  const recenter = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const handleConfirm = async () => {
    if (!region) return;

    setSaving(true);
    setError("");
    try {
      if (returnTo === "settings") {
        // User is authenticated and adding address from settings
        const userId = auth().currentUser?.uid;
        if (!userId) {
          setError("Session expired. Please log in again.");
          setSaving(false);
          return;
        }
        // Save address to Firestore
        await firestore().collection("addresses").add({
          userId,
          label,
          lat: region.latitude,
          lng: region.longitude,
          notes,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
        router.back();
      } else {
        // New user during onboarding - save to SetupContext only
        setAddress({
          lat: region.latitude,
          lng: region.longitude,
          label,
          notes,
        });
        router.push("/(auth)/login");
      }
    } catch (error) {
      console.log("Failed to save address: ", error);
      setError("Could not save your address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!region) return <View className="flex-1" />;

  return (
    <SafeAreaView className="bg-slate-50 flex-1">
      <MapView
        ref={mapRef}
        className="flex-1"
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      />

      <View className="absolute top-1/2 left-1/2 -ml-3.75 -mt-7.5 bg-transparent">
        <Image className="size-10" source={require("../../assets/pin.png")} />
      </View>

      <TouchableOpacity
        className="absolute bottom-[220px] right-4 bg-white p-2.5 rounded-3xl shadow-sm"
        onPress={recenter}
      >
        <Text>🎯</Text>
      </TouchableOpacity>

      <View
        className="p-4 bg-white"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Text className="text-lg font-semibold mb-2.5">
          Where should we deliver?
        </Text>
        <TextInput
          className="border border-[#ddd] rounded-lg p-2.5 mb-2.5"
          placeholder="Enter your name"
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          className="border border-[#ddd] rounded-lg p-2.5 mb-2.5"
          placeholder="Notes (e.g. blue gate, near the school)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {error && <Text className="text-red-500 mb-2.5">{error}</Text>}

        <TouchableOpacity
          className="bg-blue-500 p-3.5 rounded-lg items-center"
          onPress={handleConfirm}
        >
          <Text className="text-white font-semibold">Continue to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddressPicker;
