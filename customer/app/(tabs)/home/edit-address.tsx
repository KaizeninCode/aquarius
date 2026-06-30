import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/FirebaseConfig";

export default function EditAddressScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [label, setLabel] = useState("Home");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [existingAddressId, setExistingAddressId] = useState<string | null>(null);

  // Load existing default address (if any) to pre-fill, otherwise fall back to GPS
  useEffect(() => {
    (async () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) return;

      const userSnap = await getDoc(doc(db, "users", userId));
      const defaultAddressId = userSnap.data()?.defaultAddressId;

      if (defaultAddressId) {
        const addrSnap = await getDoc(doc(db, "addresses", defaultAddressId));
        if (addrSnap.exists()) {
          const data = addrSnap.data();
          setExistingAddressId(addrSnap.id);
          setLabel(data.label);
          setNotes(data.notes);
          setRegion({
            latitude: data.lat,
            longitude: data.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          return;
        }
      }

      // No existing address — fall back to GPS, same as account-setup version
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setRegion({ latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.01, longitudeDelta: 0.01 });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
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

  const handleSave = async () => {
    if (!region) return;
    const userId = getAuth().currentUser?.uid;
    if (!userId) {
      Alert.alert("Not signed in", "Please log in again.");
      return;
    }

    setSaving(true);
    try {
      if (existingAddressId) {
        // Update the existing saved address in place
        await updateDoc(doc(db, "addresses", existingAddressId), {
          label,
          lat: region.latitude,
          lng: region.longitude,
          notes,
        });
      } else {
        // No address existed yet — create one and set it as default
        const ref = await addDoc(collection(db, "addresses"), {
          userId,
          label,
          lat: region.latitude,
          lng: region.longitude,
          notes,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "users", userId), { defaultAddressId: ref.id });
      }
      router.back();
    } catch (err) {
      console.error("Failed to save address:", err);
      Alert.alert("Error", "Could not save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!region) return <View className="flex-1" />;

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      />
      <View className="absolute top-1/2 left-1/2 -ml-[15px] -mt-[30px]" pointerEvents="none">
        <Image source={require("../../../assets/pin.png")} style={{ width: 30, height: 30 }} />
      </View>
      <TouchableOpacity
        className="absolute bottom-56 right-4 bg-white p-2.5 rounded-full"
        onPress={recenter}
      >
        <Text>🎯</Text>
      </TouchableOpacity>

      <View className="p-4 bg-white">
        <TextInput
          className="border border-slate-200 rounded-lg p-3 mb-2"
          placeholder="Label (e.g. Home)"
          value={label}
          onChangeText={setLabel}
        />
        <TextInput
          className="border border-slate-200 rounded-lg p-3 mb-2"
          placeholder="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-2xl items-center"
          onPress={handleSave}
          disabled={saving}
        >
          <Text className="text-white font-bold">{saving ? "Saving..." : "Save Address"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}