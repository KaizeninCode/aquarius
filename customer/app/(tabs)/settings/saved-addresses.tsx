import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import { db } from "@/FirebaseConfig";
import { useUser } from "../../context/UserContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

type Address = {
  id: string;
  label: string;
  notes: string;
  lat: number;
  lng: number;
};

export default function SavedAddressesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const userId = getAuth().currentUser?.uid;

  // Live listener on addresses collection
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "addresses"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setAddresses(
          snap.docs.map((d) => ({ id: d.id, ...d.data() } as Address))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load addresses:", err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const handleSetDefault = async (addressId: string) => {
    if (!userId || addressId === user?.defaultAddressId) return;
    setUpdating(addressId);
    try {
      await updateDoc(doc(db, "users", userId), {
        defaultAddressId: addressId,
      });
    } catch (err) {
      console.error("Failed to set default:", err);
      Alert.alert("Error", "Could not set default address.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = (address: Address) => {
    if (address.id === user?.defaultAddressId) {
      Alert.alert(
        "Can't delete default address",
        "Set another address as default before deleting this one."
      );
      return;
    }

    Alert.alert(
      "Delete address",
      `Remove "${address.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setUpdating(address.id);
            try {
              await deleteDoc(doc(db, "addresses", address.id));
            } catch (err) {
              console.error("Failed to delete address:", err);
              Alert.alert("Error", "Could not delete address.");
            } finally {
              setUpdating(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-2xl font-bold mb-2">Saved Addresses</Text>
            <Text className="text-slate-500 text-sm">
              Your default address is used automatically at checkout.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={48}
              color="#cbd5e1"
            />
            <Text className="text-slate-400 mt-3 text-base">
              No saved addresses yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDefault = item.id === user?.defaultAddressId;
          const isBusy = updating === item.id;

          return (
            <View
              className={`border rounded-2xl p-4 mb-3 ${
                isDefault
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Label + default badge */}
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-base font-semibold text-slate-900 flex-1 mr-2">
                  {item.label}
                </Text>
                {isDefault && (
                  <View className="bg-blue-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-medium">
                      Default
                    </Text>
                  </View>
                )}
              </View>

              {/* Notes */}
              {item.notes ? (
                <Text className="text-sm text-slate-500 mb-3">
                  {item.notes}
                </Text>
              ) : (
                <Text className="text-sm text-slate-300 mb-3 italic">
                  No notes added
                </Text>
              )}

              {/* Actions */}
              <View className="flex-row gap-2">
                {/* Set as default */}
                {!isDefault && (
                  <TouchableOpacity
                    className="flex-row items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-lg"
                    onPress={() => handleSetDefault(item.id)}
                    disabled={isBusy}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#475569"
                    />
                    <Text className="text-slate-600 text-xs font-medium">
                      {isBusy ? "Setting..." : "Set as default"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Delete */}
                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg"
                  onPress={() => handleDelete(item)}
                  disabled={isBusy}
                >
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs font-medium">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <TouchableOpacity
            className="border-2 border-dashed border-slate-200 rounded-2xl p-4 items-center mt-2"
            onPress={() => router.push("/(account-setup)/address-picker")}
          >
            <Ionicons name="add-circle-outline" size={24} color="#94a3b8" />
            <Text className="text-slate-400 text-sm font-medium mt-1">
              Add new address
            </Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}