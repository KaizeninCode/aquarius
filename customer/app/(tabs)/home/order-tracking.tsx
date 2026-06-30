import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type Order = {
  status: OrderStatus;
  driverName: string | null;
  totalAmount: number;
  items: { name: string; quantity: number; price: number }[];
  deliveryAddress: { label: string; notes: string };
};

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "assigned", label: "Driver Assigned" },
  { key: "out_for_delivery", label: "Out For Delivery" },
  { key: "delivered", label: "Delivered" },
];

const OrderTrackingScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("No order specified.");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "orders", orderId),
      (snap) => {
        if (!snap.exists()) {
          setError("Order not found.");
          setOrder(null);
        } else {
          setOrder(snap.data() as Order);
          setError("");
        }

        setLoading(false);
      },
      (err) => {
        console.error("Failed to listen to order: ", error);
        setError("Could not load order status.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [orderId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-lg text-red-500 mb-4">
          {error || "Something went wrong."}
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
          <Text className="text-blue-500 font-medium">Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (order.status === "cancelled") {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-2xl font-bold mb-2">Order Cancelled</Text>
        <Text className="text-slate-500 text-center mb-6">
          This order was cancelled. Contact the shop if you have questions.
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
          <Text className="text-blue-500 font-medium">Order Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status,
  );

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Order Status</Text>
      {/* STATUS TIMELINE */}
      <View className="mb-6">
        {STATUS_STEPS.map((step, index) => {
          const isComplete = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <View className="flex-row items-center mb-3" key={step.key}>
              <View
                className={`size-6 rounded-full items-center justify-center ${isComplete ? "bg-blue-500" : "bg-slate-200"}`}
              >
                {isComplete && <Text className="text-white text-xs">✓</Text>}
              </View>
              <Text
                className={`ml-3 text-base ${isCurrent ? "font-bold text-blue-600" : isComplete ? "font-medium" : "text-slate-400"}`}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
      {/* Driver info once assigned */}
      {order.driverName && (
        <View className="border border-slate-200 rounded-xl p-4 mb-4">
          <Text className="text-sm text-slate-500 mb-1">Your driver</Text>
          <Text className="text-base font-semibold">{order.driverName}</Text>
        </View>
      )}
      {/* Delivery Address */}
      <View className="border border-slate-200 rounded-xl p-4 mb-4">
        <Text className="text-sm text-slate-500 mb-1">Delivering to</Text>
        <Text className="text-base font-semibold">
          {order.deliveryAddress.label}
        </Text>
        {order.deliveryAddress.notes && (
          <Text className="text-slate-500 text-sm mt-1">
            {order.deliveryAddress.notes}
          </Text>
        )}
      </View>
      {/* ORDER SUMMARY */}
      <View className="border border-slate-200 rounded-xl p-4">
        <Text className="text-sm text-slate-500 mb-2">Order Summary</Text>
        {order.items.map((item, i) => (
          <View className="flex-row justify-between mb-1" key={i}>
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
          <Text className="font-bold">KES {order.totalAmount}</Text>
        </View>

      </View>
        {/* buttons to navigate elsewhere */}
        <View className="flex-row justify-center gap-16 mt-auto">
          <TouchableOpacity onPress={() => router.replace("/(tabs)/home")}>
            <Text className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium">Place new order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/OrderHistory")}>
            <Text className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium">See your orders</Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

export default OrderTrackingScreen;
