import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "@/FirebaseConfig";
import { useCart } from "../../context/CartContext";
import { useUser } from "@/app/context/UserContext";


type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
};

const Home = () => {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem, total } = useCart();
  const { user } = useUser();

  

  // fetch products
  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true),
        );
        const snap = await getDocs(q);
        setProducts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
        );
      } catch (error) {
        console.error("Failed to load products: ", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  {
    if (loading)
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={"large"} />
        </View>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <Text className="text-xl font-bold mb-4">Hi, {user?.name ?? "there"}!</Text>
      <View className="rounded-3xl h-40 bg-blue-700 mb-4" />
      <Text className="text-2xl font-bold mb-4">Order Water</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const inCart = items.find((i) => i.productId === item.id);
          return (
            <View className="flex-row justify-between items-center border border-slate-200 rounded-lg p-4 mb-3">
              <View>
                <Text className="text-lg font-semibold">{item.name}</Text>
                <Text className="text-slate-500">KES {item.price}</Text>
              </View>
              <TouchableOpacity
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={() =>
                  addItem({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                  })
                }
              >
                <Text className="text-white font-semibold">
                  {inCart ? `In Cart (${inCart.quantity})` : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {items.length > 0 && (
        <View className="border-t border-slate-200 pt-4 mt-2 flex-row justify-between items-center">
          <Text className="text-lg font-semibold">Total: KES {total}</Text>
          <TouchableOpacity
            className="bg-green-500 px-4 py-2 rounded-lg"
            onPress={() => router.push('/(tabs)/home/cart')}
          >
            <Text className="text-white font-semibold">Proceed to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Home;
