import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSetup } from "../context/SetupContext";


const AddressPicker = () => {
  const router = useRouter()
  const {setAddress} = useSetup()
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [label, setLabel] = useState("Home");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setRegion({ latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.01, longitudeDelta: 0.01 });
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
      console.error('getCurrentPositionAsync failed:', err);
      setRegion({ latitude: -1.2921, longitude: 36.8219, latitudeDelta: 0.01, longitudeDelta: 0.01 }); // fallback
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
    setAddress({
      lat: region.latitude,
      lng: region.longitude,
      label,
      notes
    })

    router.push('/(auth)/login')
  };

  if (!region) return <View className="flex-1" />;

  return (
    
    
    <SafeAreaView className="bg-white flex-1">
      <MapView
        ref={mapRef}
        className="flex-1 bg-slate-100/10"
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      />

      <View className="absolute top-1/2 left-1/2 -ml-3.75 -mt-7.5 bg-transparent">
        <Image className="size-10" source={require('../../assets/pin.png')}/>
      </View>

      <TouchableOpacity
        className="absolute bottom-[220px] right-4 bg-white p-2.5 rounded-3xl shadow-sm"
        onPress={recenter}
      >
        <Text>🎯</Text>
      </TouchableOpacity>

      <View className="p-4 bg-white">
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
          <Text className="text-white font-semibold">
            Continue to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  
};

export default AddressPicker;
