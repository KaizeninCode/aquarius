import {
  View,
  Text,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { auth, firestore } from "@/firebaseConfig";

type OrderStatus = "assigned" | "out_for_delivery" | "delivered";

type Job = {
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { label: string; notes: string; lat: number; lng: number };
};

const DeliveryDetail = () => {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // fetch orders
  useEffect(() => {
    if (!orderId) {
      setError("No delivery specified.");
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection("orders")
      .doc(orderId)
      .onSnapshot(
        (snap) => {
          if (!snap.exists()) {
            setError("Delivery not found.");
            setJob(null);
          } else setJob(snap.data() as Job);

          setLoading(false);
        },
        (error) => {
          console.log("Failed to load delivery: ", error);
          setError("Could not fetch delivery details. Try again.");
          setLoading(false);
        },
      );

    return unsubscribe;
  }, [orderId]);

  const handleNavigate = () => {
    if (!job) return;
    const { lat, lng } = job.deliveryAddress;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat}, ${lng}`;
    Linking.openURL(url).catch((error) => {
      console.error("Failed to open maps: ", error);
      Alert.alert(
        "Could not open maps. Please check that Google Maps is installed on your device.",
      );
    });
  };

  const handleCall = () => {
    if (!job?.customerPhone) return;
    Linking.openURL(`tel:${job.customerPhone}`).catch((error) =>
      console.error("Failed to open dialer: ", error),
    );
  };

  const handleStartDelivery = async () => {
    if (!orderId) return;
    setUpdating(true);

    try {
      await firestore().collection('orders').doc(orderId).update({
        status: "out_for_delivery",
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to update: ", error);
      Alert.alert("Error", "Could not update delivery status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!orderId) return;
    Alert.alert("Confirm delivery", "Mark this order as delivered?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          setUpdating(true);
          try {
            await firestore().collection('orders').doc(orderId).update({
              status: "delivered",
              updatedAt: firestore.FieldValue.serverTimestamp(),
            });
            router.back();
          } catch (error) {
            console.error("Failed to update status: ", error);
            Alert.alert("Error", "Could not update delivery status.");
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  // loading state
  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ paddingBottom: useSafeAreaInsets().bottom }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // error
  if (error || !job) {
    return (
      <View
        className="flex-1 justify-center items-center p-6"
        style={{ paddingBottom: useSafeAreaInsets().bottom }}
      >
        <Text className="text-red-500">{error || "Something went wrong."}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-slate-50 p-4"
      style={{ paddingBottom: useSafeAreaInsets().bottom }}
    >
      <Text className="text-2xl font-bold mb-6">Delivery Details</Text>

      {/* CUSTOMER INFO */}
      <View className="border border-slate-200 rounded-xl p-4 mb-4">
        <Text className="text-sm text-slate-500 mb-1">Customer</Text>
        <Text className="text-base font-semibold mb-2">{job.customerName}</Text>
        <TouchableOpacity onPress={handleCall}>
          <Text className="text-blue-500 font-medium">{job.customerPhone}</Text>
        </TouchableOpacity>
      </View>

      {/* Address + notes */}
      <View className="border border-slate-200 rounded-xl p-4 mb-4">
        <Text className="text-sm text-slate-500 mb-1">Delivery Address</Text>
        <Text className="text-base font-semibold">
          {job.deliveryAddress.label}
        </Text>
        {job.deliveryAddress.notes ? (
          <Text className="text-slate-500 text-sm mt-1">
            {job.deliveryAddress.notes}
          </Text>
        ) : null}

        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-xl items-center mt-3"
          onPress={handleNavigate}
        >
          <Text className="text-white font-semibold">Navigate</Text>
        </TouchableOpacity>
      </View>

      {/* Order summary */}
      <View className="border border-slate-200 rounded-xl p-4 mb-6">
        <Text className="text-sm text-slate-500 mb-2">Items</Text>
        {job.items.map((item, i) => (
          <View key={i} className="flex-row justify-between mb-1">
            <Text className="text-slate-700">
              {item.name} x {item.quantity}
            </Text>
            <Text className="text-slate-700">
              KES {item.price * item.quantity}
            </Text>
          </View>
        ))}
        <View className="flex-row justify-between mt-3 pt-3 border-t border-slate-100">
          <Text className="font-semibold">Total</Text>
          <Text className="font-bold">KES {job.totalAmount}</Text>
        </View>
      </View>

      {/* Status action button */}
      {job.status === "assigned" && (
        <TouchableOpacity
          className="bg-amber-500 p-4 rounded-2xl items-center"
          onPress={handleStartDelivery}
          disabled={updating}
        >
          <Text className="text-white font-bold text-base">
            {updating ? "Updating..." : "Start Delivery"}
          </Text>
        </TouchableOpacity>
      )}

      {job.status === "out_for_delivery" && (
        <TouchableOpacity
          className="bg-green-600 p-4 rounded-2xl items-center"
          onPress={handleMarkDelivered}
          disabled={updating}
        >
          <Text className="text-white font-bold text-base">
            {updating ? "Updating..." : "Mark Delivered"}
          </Text>
        </TouchableOpacity>
      )}

      {job.status === "delivered" && (
        <View className="p-4 items-center">
          <Text className="text-green-600 font-semibold">✓ Delivered</Text>
        </View>
      )}

      {/* back button */}
      <TouchableOpacity
        className="bg-blue-500 p-3 rounded-xl items-center mt-auto w-3/5 mx-auto"
        onPress={() => router.back()}
      >
        <Text className="text-white font-semibold">Back to orders</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DeliveryDetail;
