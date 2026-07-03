import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useCart } from "@/app/context/CartContext";

const CartPage = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  if (items.length == 0) {
    return (
      <View className="flex-1 justify-center items-center p-6 bg-slate-50">
        <Text className="text-2xl font-bold mb-2">Your cart is empty</Text>
        <Text className="text-slate-500 text-center mb-6">
          Add some water bottles from the home screen
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
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* item list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text className="text-2xl font-bold mb-4">Your Cart</Text>
        }
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center border border-slate-200 rounded-xl p-4 mb-3">
            {/* product info */}
            <View className="flex-1">
              <Text className="text-base font-semibold">{item.name}</Text>
              <Text className="text-slate-500 text-sm">
                KES {item.price} each
              </Text>
              <Text className="text-slate-700 font-medium mt-1">
                Subtotal: KES {item.price * item.quantity}
              </Text>
            </View>
            {/* quantity controls */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                className="size-8 rounded-full bg-slate-100 items-center justify-center"
                onPress={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
              >
                <Text className="text-lg font-bold text-slate-700">-</Text>
              </TouchableOpacity>
              <Text className="text-base font-semibold text-center w-4">
                {item.quantity}
              </Text>
              <TouchableOpacity
                className="size-8 rounded-full bg-slate-100 items-center justify-center"
                onPress={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
              >
                <Text className="text-lg font-bold text-slate-700">+</Text>
              </TouchableOpacity>

              {/* remove entirely */}
              <TouchableOpacity
                className="ml-2"
                onPress={() => removeItem(item.productId)}
              >
                <Text className="text-sm text-red-400">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
            <View className="mt-2">
                <TouchableOpacity className="self-start" onPress={clearCart}>
                    <Text className="text-slate-400 text-sm">Clear Cart</Text>
                </TouchableOpacity>
            </View>
        }
      />

      {/* sticky checkout footer */}
      <View className="border-t border-slate-200 p-4 bg-white">
        <View className="flex-row justify-between mb-4">
            <Text className="text-lg font-semibold">Total</Text>
            <Text className="text-lg font-bold">KES {total}</Text>
        </View>
        <TouchableOpacity className="bg-blue-500 p-4 rounded-2xl items-center" onPress={() => router.push('/(tabs)/home/checkout')}>
                    <Text className="text-white font-bold text-base">Proceed to Checkout</Text>
                </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CartPage;
