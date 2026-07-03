// app/(tabs)/settings/help-center.tsx
import React from "react";
import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const faqs = [
  {
    q: "How do I place an order?",
    a: "From the home screen, add the water bottles you need to your cart, then proceed to checkout. Your saved delivery address will be used automatically.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery times vary depending on your location and driver availability. You'll receive a notification when a driver is assigned and again when they're on their way.",
  },
  {
    q: "Can I change my delivery address?",
    a: "Yes — go to Settings → Saved Addresses to update your pin or add a new address before placing an order.",
  },
  {
    q: "What if my order is wrong or damaged?",
    a: "Please contact us directly via phone or WhatsApp and we'll resolve it as quickly as possible.",
  },
  {
    q: "How do I cancel an order?",
    a: "Orders can only be cancelled before the shop confirms them. Once confirmed, please call us directly.",
  },
  {
    q: "How is payment handled?",
    a: "Payment is made on delivery. Please have the exact amount ready when the driver arrives.",
  },
];

const CONTACT_PHONE = "+254741026083"; // replace with real number -> business' contact

export default function HelpCenterScreen() {
  const handleCall = () => Linking.openURL(`tel:${CONTACT_PHONE}`);
  const handleWhatsApp = () =>
    Linking.openURL(`https://wa.me/${CONTACT_PHONE.replace("+", "")}`);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-2xl font-bold mb-2">Help Center</Text>
        <Text className="text-slate-500 text-sm mb-8">
          Answers to common questions, and how to reach us directly.
        </Text>

        {/* Contact buttons */}
        <View className="bg-slate-50 rounded-2xl p-4 mb-8">
          <Text className="text-sm font-semibold text-slate-700 mb-3">
            Contact us directly
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-xl items-center"
              onPress={handleCall}
            >
              <Text className="text-white font-semibold text-sm">📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-600 py-3 rounded-xl items-center"
              onPress={handleWhatsApp}
            >
              <Text className="text-white font-semibold text-sm">
                💬 WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <Text className="text-base font-semibold text-slate-900 mb-4">
          Frequently Asked Questions
        </Text>
        {faqs.map((faq, i) => (
          <View
            key={i}
            className="border-b border-slate-100 pb-5 mb-5 last:border-0"
          >
            <Text className="text-sm font-semibold text-slate-900 mb-1.5">
              {faq.q}
            </Text>
            <Text className="text-sm text-slate-600 leading-relaxed">
              {faq.a}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}