import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firestore, auth } from "@/FirebaseConfig";
import { useCart } from "@/app/context/CartContext";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type Address = {
  id: string;
  label: string;
  lng: string;
  lat: string;
  notes: string;
};

const CheckoutPage = () => {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userId = getAuth().currentUser?.uid;
        if (!userId) return;

        const userSnap = await firestore().collection('users').doc(userId).get();
        const defaultAddressId = userSnap.data()?.defaultAddressId;

        if (!defaultAddressId) {
          setLoadingAddress(false);
          return;
        }

        const addressSnap = await firestore().collection('addresses').doc(defaultAddressId).get()
        if (addressSnap.exists())
          setAddress({ id: addressSnap.id, ...addressSnap.data() } as Address);
      } catch (error) {
        console.log("Failed to load address: ", error);
      } finally {
        setLoadingAddress(false);
      }
    })();
  }, []);

  const handlePlaceOrder = async () => {
    if (!address) {
      Alert.alert("No delivery address. Please add a delivery address first.");
      return;
    }

    if (items.length === 0) return;

    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert("Not signed in. Please log in again.");
      return;
    }

    setPlacingOrder(true);

    try {
      const userSnap = await firestore().collection('users').doc(userId).get();
      const customerName = userSnap.data()?.name ?? "Unknown";
      const customerPhone = auth.currentUser?.phoneNumber ?? "";

      const orderRef = await firestore().collection('orders').add({
        customerId: userId,
        customerName,
        customerPhone,

        driverId: null,
        driverName: null,

        // snapshot, frozen at the time of the order
        deliveryAddress: {
          lat: address.lat,
          lng: address.lng,
          label: address.label,
          notes: address.notes,
        },

        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        totalAmount: total,

        status: "placed",
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      clearCart();
      // TODO: Add this route
      router.replace(`/(tabs)/home/order-tracking?orderId=${orderRef.id}`)
    } catch (error) {
      console.log("Failed to place order: ", error);
      Alert.alert("Order failed. Something went wrong. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingAddress) {
    return (
      <View className="flex-1 items-center justify-center" style={{paddingBottom: useSafeAreaInsets().bottom}}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4" style={{paddingBottom: useSafeAreaInsets().bottom}}>
      <Text className="text-2xl font-bold mb-4">Checkout</Text>

      {/* delivery address section */}
      <View className="border border-slate-200 rounded-xl p-4 mb-4">
        <Text className="text-2xl font-bold mb-4">Deliver to</Text>
        {address ? (
          <>
            <Text className="text-base font-semibold">{address.label}</Text>
            {address.notes && (
              <Text className="text-slate-500 text-sm mt-1">
                {address.notes}
              </Text>
            )}
          </>
        ) : (
          <Text className="text-red-500">No saved address found.</Text>
        )}
        <TouchableOpacity
          className="mt-2"
          onPress={() => router.push("/(tabs)/home/edit-address")}
        >
          <Text className="text-blue-500 text-sm font-medium">
            Change address
          </Text>
        </TouchableOpacity>
      </View>

      {/* order summary */}
      <View className="border border-slate-200 rounded-xl p-4 mb-4">
        <Text className="text-sm text-slate-500 mb-2">Order Summary</Text>
        {items.map((item) => (
          <View key={item.productId} className="flex-row justify-between mb-1">
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
            <Text className="font-bold">KES {total}</Text>
        </View>
      </View>
      <TouchableOpacity className="bg-blue-500 p-4 rounded-2xl items-center mt-auto" onPress={handlePlaceOrder} disabled={placingOrder || !address}>
        <Text className="text-white font-bold text-base">
            {placingOrder ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CheckoutPage;
