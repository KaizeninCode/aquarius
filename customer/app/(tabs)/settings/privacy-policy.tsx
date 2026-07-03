import { View, Text, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const PrivacyPolicyScreen = () => {
  const sections = [
    {
      title: "Information We Collect",
      body: "We collect your name, phone number, and delivery location (GPS coordinates).",
    },
    {
      title: "How We Use Your Information",
      body: "Your information is used solely to process and deliver your orders. Your name and phone number are shared with the delivery driver so that they can identify you during delivery. Your GPS pin is used to navigate to your location.",
    },
    {
      title: "Data Storage",
      body: "Your data is stored securely using Google Firebase, hosted on Google Cloud Infrastructure. We do not store or collect payment card information",
    },
    {
      title: "Third Parties",
      body: "We do not sell or share your personal information with third parties for marketing purposes. Delivery drivers are employees or contatctors of the shop and are bound by confidentiality.",
    },
    {
      title: "Push Notifications",
      body: "If you grant permission, we send push notifications to update you on your order status. You can withdraw this permission anytime through your device settings.",
    },
    {
      title: "Your Rights",
      body: "You may request deletion of your account and associated data at any time by contacting us. Upon request, all personal data will be permanently removed from our systems within 30 days.",
    },
    {
      title: "Contact",
      body: "For any privacy-related requests or questions, please contact us through the Help Center.",
    },
  ];
  return (
    <SafeAreaView className="flex-1 bg-white p-6" style={{paddingBottom: useSafeAreaInsets().bottom}}>
      <ScrollView>
        <Text className="text-2xl font-bold mb-2">Privacy Policy</Text>
        <Text className="text-slate-500 text-sm mb-8">
          Last Updated: {new Date().toLocaleString('en-KE', {month:'long', year:'numeric'})}
        </Text>
        {sections.map((section, i) => (
          <View key={i} className="mb-6">
            <Text className="text-base font-semibold text-slate-900 mb-2">
              {section.title}
            </Text>
            <Text className="text-slate-600 text-sm leading-relaxed">
              {section.body}
            </Text>
          </View>
        ))}
        <Text className="text-slate-400 text-xs text-center mt-4">
          By using this app, you agree to this policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
