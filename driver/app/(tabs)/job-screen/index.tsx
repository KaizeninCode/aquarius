import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebaseConfig";
import { useUser } from "@/context/UserContext";


type OrderStatus = "assigned" | "out_for_delivery";

type Job = {
  id: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  totalAmount: number;
  items: { name: string; quantity: number }[];
  deliveryAddress: { label: string; notes: string; lat: number; lng: number };
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  assigned: "New",
  out_for_delivery: "In Progress",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  assigned: "text-blue-500 px-2 py-1 bg-blue-100",
  out_for_delivery: "text-amber-500 px-2 py-1 bg-amber-100",
};

const JobScreen = () => {
  const router = useRouter();
  const {user} = useUser()
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch user's name from Firestore
  // useEffect(() => {
  //   const userId = getAuth().currentUser?.uid;
  //   if (!userId) return;
  //   (async () => {
  //     try {
  //       const userSnap = await getDoc(doc(db, "users", userId));
  //       if (userSnap.exists()) {
  //         setUserName(userSnap.data()?.name ?? null)
  //         setUserPhone(userSnap.data()?.phone ?? null)
  //         console.log(userName);
  //         console.log(userPhone);
  //       };
  //     } catch (error) {
  //       console.log("Failed to fetch user: ", error);
  //     }
  //   })();
  // }, []);

  // fetch jobs on mount
  // 1. Check if user is logged in
  useEffect(() => {
    const userId = getAuth().currentUser?.uid;
    // console.log(userId)
    if (!userId) {
      setError("Not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    // 2. fetch jobs from firestore
    const q = query(
      collection(db, "orders"),
      where("driverId", "==", userId),
      where("status", "in", ["assigned", "out_for_delivery"]),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setJobs(snap.docs.map((s) => ({ id: s.id, ...s.data() }) as Job));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load jobs: ", error);
        setError("Could not load jobs. Try again.");
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  // loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size={"large"} />
      </View>
    );
  }
  // console.log("User: ", user)

  // error
  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white" style={{paddingBottom: useSafeAreaInsets().bottom}}>
        <Text className="text-xl font-bold mb-4">
          Hi, {user?.name ?? "there"}!
        </Text>
        <View className="rounded-3xl h-40 bg-green-700 mb-4" />
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    );
  }

  // no jobs to show
  if (jobs.length === 0) {
    return (
      <SafeAreaView className="flex-1 p-6 bg-slate-50" style={{paddingBottom: useSafeAreaInsets().bottom}}>
        <Text className="text-xl font-bold mb-4">
          Hi, {user?.name ?? "there"}!
        </Text>
        <View className="rounded-3xl h-40 bg-green-700 mb-4" />
        <Text className="text-2xl font-bold mb-2">No deliveries right now</Text>
        <Text className="text-slate-500 text-center mt-auto mb-auto">
          New assignments will show up here automatically.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4" style={{paddingBottom: useSafeAreaInsets().bottom}}>
      <Text className="text-xl font-bold mb-4">Hi, {user?.name ?? "there"}!</Text>
      <View className="rounded-3xl h-40 bg-green-600 mb-4" />
      <Text className="text-2xl font-bold mb-4">Your Deliveries</Text>
      <FlatList
        data={jobs}
        keyExtractor={(job) => job.id}

        renderItem={({ item }) => {
          const itemSummary = item.items
            .map((i) => `${i.name} x ${i.quantity}`)
            .join(", ");

          return (
            <TouchableOpacity
              className="border border-slate-200 rounded-xl p-4 mb-3"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/job-screen/delivery-detail",
                  params: { orderId: item.id },
                })
              }
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-base font-semibold">
                  {item.customerName}
                </Text>
                <Text
                  className={`text-sm font-medium ${STATUS_COLORS[item.status]} px-2 py-1 rounded-lg`}
                >
                  {STATUS_LABELS[item.status]}
                </Text>
              </View>
              <Text className="text-slate-500 text-sm mb-1">
                {item.deliveryAddress.label}
              </Text>
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

export default JobScreen;
