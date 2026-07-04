import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { firestore, auth } from "@/FirebaseConfig";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type OrderSummary = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  items: { name: string; quantity: number }[];
  createdAt: { seconds: number } | null;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  assigned: "Driver Assigned",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  placed: "text-slate-500 bg-slate-200",
  confirmed: "text-blue-500 bg-blue-200",
  assigned: "text-blue-500 bg-blue-200",
  out_for_delivery: "text-amber-500  bg-amber-200",
  delivered: "text-green-600 bg-green-200",
  cancelled: "text-red-500 bg-red-200",
};

const OrderHistory = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch orders from firestore
  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      setError("Not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    const q = firestore()
      .collection("orders")
      .where("customerId", "==", userId)
      .orderBy("createdAt", "desc");

    const unsubscribe = firestore()
      .collection("orders")
      .where("customerId", "==", userId)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snap) => {
          setOrders(
            snap.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as OrderSummary,
            ),
          );
          setLoading(false);
        },
        (error) => {
          console.log("Failed to load orders: ", error);
          setError("Could not load your orders");
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  // loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  const insets = useSafeAreaInsets()

  // error
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50" style={{paddingBottom: insets.bottom}}>
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  // no orders to show
  if (orders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-slate-50"style={{paddingBottom: insets.bottom}}>
        <Text className="text-2xl font-bold mb-2">No orders yet</Text>
        <Text className="text-slate-500 text-center mb-6">
          Your past and current orders will show up here.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-xl"
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text className="text-white font-semibold text-base">
            Browse Products
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-slate-50"style={{paddingBottom: insets.bottom}}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text className="text-2xl font-bold mb-4">Your Orders</Text>
        }
        renderItem={({ item }) => {
          const itemSummary = item.items
            .map((i) => `${i.name} x ${i.quantity}`)
            .join(", ");
          const date =
            item.createdAt &&
            new Date(item.createdAt.seconds * 1000).toLocaleDateString(
              "en-KE",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            );

          return (
            <TouchableOpacity
              className="shadow-sm shadow-black bg-white border-slate-200 rounded-xl p-4 mb-3"
              onPress={() =>
                router.push(`/(tabs)/home/order-tracking?orderId=${item.id}`)
              }
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-semibold">{date}</Text>
                <Text
                  className={`text-sm font-medium ${STATUS_COLORS[item.status]} px-2 py-1 rounded-lg`}
                >
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
              <Text className="text-slate-500 text-sm mb-2" numberOfLines={1}>
                {itemSummary}
              </Text>
              <Text className="text-base font-bold">
                KES {item.totalAmount}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default OrderHistory;
