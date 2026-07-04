import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { firestore, auth } from "@/FirebaseConfig";
import { registerPushToken } from "@/utils/registerPushToken";

type PermissionState = "loading" | "unavailable" | "granted" | "denied" | "undetermined";

const NOTIFICATION_TYPES = [
  {
    title: "Order Confirmed",
    description: "When the shop confirms your order",
  },
  {
    title: "Driver Assigned",
    description: "When a driver is assigned to your delivery",
  },
  {
    title: "Out for Delivery",
    description: "When your driver is on their way",
  },
  {
    title: "Order Delivered",
    description: "When your delivery has arrived",
  },
];

export default function NotificationsScreen() {
  const [permissionState, setPermissionState] = useState<PermissionState>("loading");
  const [updating, setUpdating] = useState(false);

  const checkPermission = useCallback(async () => {
    if (!Device.isDevice) {
      setPermissionState("unavailable");
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionState(status as PermissionState);
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handleEnable = async () => {
    setUpdating(true);
    try {
      const { status } = await Notifications.getPermissionsAsync();

      if (status === "denied") {
        // Already permanently denied — can only fix this in device settings
        await Linking.openSettings();
        return;
      }

      // Either undetermined (first ask) or previously granted
      await registerPushToken(auth().currentUser!.uid);
      await checkPermission(); // re-check after registering
    } catch (err) {
      console.error("Failed to enable notifications:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDisable = async () => {
    setUpdating(true);
    const userId = auth().currentUser?.uid;
    if (!userId) return;
    try {
      // Remove token from Firestore — Cloud Function won't find a token to send to
      await firestore().collection('users').doc(userId).update( { pushToken: null });
      // Note: we don't revoke the OS-level permission since that requires device settings.
      // Clearing the token is sufficient — no token = no notifications from our system.
      setPermissionState("denied");
    } catch (err) {
      console.error("Failed to disable notifications:", err);
    } finally {
      setUpdating(false);
    }
  };

  const isEnabled = permissionState === "granted";

  if (permissionState === "loading") {
    return (
      <View className="flex-1 justify-center items-center" style={{paddingBottom: useSafeAreaInsets().bottom}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" style={{paddingBottom: useSafeAreaInsets().bottom}}>
      <View className="p-6 flex-1">
        <Text className="text-2xl font-bold mb-2">Notifications</Text>
        <Text className="text-slate-500 text-sm mb-8">
          Control when this app can notify you about your orders.
        </Text>

        {/* Unavailable on simulator */}
        {permissionState === "unavailable" && (
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <Text className="text-amber-700 text-sm font-medium">
              Push notifications are only available on a real device.
            </Text>
          </View>
        )}

        {/* Main toggle card */}
        <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-slate-900">
                Order Notifications
              </Text>
              <Text className="text-sm text-slate-500 mt-0.5">
                {isEnabled
                  ? "You'll be notified at each step of your order."
                  : "Enable to get updates on your deliveries."}
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={isEnabled ? handleDisable : handleEnable}
              disabled={updating || permissionState === "unavailable"}
              trackColor={{ true: "#3b82f6", false: "#e2e8f0" }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Deep-link prompt if permanently denied */}
        {permissionState === "denied" && (
          <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
            <Text className="text-sm text-slate-600 mb-3">
              Notifications are blocked at the device level. To re-enable, go
              to your device settings and allow notifications for this app.
            </Text>
            <TouchableOpacity onPress={() => Linking.openSettings()}>
              <Text className="text-blue-500 text-sm font-medium">
                Open Settings ↗
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* What you'll receive — shown only when enabled */}
        {isEnabled && (
          <View>
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              You'll be notified when
            </Text>
            <View className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              {NOTIFICATION_TYPES.map((item, i) => (
                <View
                  key={i}
                  className={`px-4 py-3.5 ${
                    i < NOTIFICATION_TYPES.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <Text className="text-sm font-medium text-slate-800">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    {item.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}