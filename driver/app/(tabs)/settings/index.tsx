import { ScrollView } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfileHeader from "./components/ProfileHeader";
import SettingsItem from "./components/SettingsItem";
import SettingsSection from "./components/SettingsSection";
import { getAuth, signOut } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";




const SettingsScreen = () => {
    const settingsSections = [
      {
        title: "Account",
        subsections: [
          {
            title: "Edit Profile",
            icon: <FontAwesome6 name="user-gear" size={16} color="#475569" />,
            onPress: () => router.push('/(tabs)/settings/edit-profile'),
            danger: false,
          },
        //   {
        //     title: "Saved Addresses",
        //     icon: (
        //       <MaterialCommunityIcons
        //         name="map-marker-radius-outline"
        //         size={18}
        //         color="#475569"
        //       />
        //     ),
        //     onPress: undefined,
        //     danger: false,
        //   },
        ],
      },
      {
        title: "Preferences",
        subsections: [
          {
            title: "Notifications",
            icon: <Octicons name="bell" size={16} color="#475569" />,
            onPress: () => router.push('/(tabs)/settings/notifications'),
            danger: false,
          },
        ],
      },
      {
        title: "Support",
        subsections: [
          {
            title: "Help Center",
            icon: (
              <MaterialCommunityIcons
                name="help-circle-outline"
                size={18}
                color="#475569"
              />
            ),
            onPress: () => router.push('/(tabs)/settings/help-center'),
            danger: false,
          },
          {
            title: "Privacy Policy",
            icon: <Ionicons name="shield-outline" size={18} color="#475569" />,
            onPress: () => router.push('/(tabs)/settings/privacy-policy'),
            danger: false,
          },
        ],
      },
      {
        title: "Danger Zone",
        subsections: [
          {
            title: "Log Out",
            icon: (
              <MaterialCommunityIcons
                name="logout-variant"
                size={18}
                color="#ef4444"
              />
            ),
            onPress: () => signOut(auth),
            danger: true,
          },
        ],
      },
    ];
    const router = useRouter()
  const {user, loading} = useUser()
  
  const handleOnPress = (onPress: void) => router.push('/')

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader name={user?.name ?? ''} phone={user?.phone ?? ''} />

        {settingsSections.map((section, i) => (
          <SettingsSection key={i} title={section.title}>
            {section.subsections.map((sub, j) => (
              <SettingsItem
                key={j}
                title={sub.title}
                icon={sub.icon}
                onPress={sub.onPress}
                danger={sub.danger}
                isLast={j === section.subsections.length - 1}
              />
            ))}
          </SettingsSection>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
