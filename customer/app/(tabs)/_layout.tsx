import React from "react";
import { Tabs } from "expo-router";
import { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
            backgroundColor: "#f8fafc",
          // borderColor: '#0a0a0a',
          // borderRadius: 40,
        //   paddingBottom: 30,
          overflow: "hidden",
          // marginHorizontal: 20,
          // marginBottom: 20,
        //   height: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          // animationName: 'slide'
          // position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
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
        name="OrderHistory"
        options={{
          title: "Orders",
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
