import React from "react";
import { Tabs } from "expo-router";
import { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,

  })
})

interface TabIconProps {
  focused: boolean;
  size: number;
  color: ColorValue;
  name: React.ComponentProps<typeof Ionicons>["name"];
}

const TabIcon = ({ size, name, color }: TabIconProps) => (
  <Ionicons size={size} name={name} color={color} />
);

const TabsLayout = () => {
  return (
    <Tabs
      initialRouteName="job-screen"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        
      }}
    >
      <Tabs.Screen
        name="job-screen"
        options={{
          title: "Jobs",
          tabBarIcon: ({ focused, size, color }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="order-history"
        options={{
          title: "Order History",
          tabBarIcon: ({ focused, size, color }) => (
            <TabIcon
              name={focused ? "timer" : "timer-outline"}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "You",
          tabBarIcon: ({ focused, size, color }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
