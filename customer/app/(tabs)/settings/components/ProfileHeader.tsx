import { View, Text } from "react-native";
import React from "react";

type Props = {
  name: string;
  phone: string;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const ProfileHeader = ({ name, phone }: Props) => {
  return (
    <View className="items-center py-8">
      <View className="size-20 rounded-full bg-blue-500 items-center justify-center mb-4">
        <Text className="text-white text-2xl font-bold">
          {getInitials(name)}
        </Text>
      </View>
      <Text className="text-xl font-bold text-slate-900">{name}</Text>
      <Text className="text-sm text-slate-500 mt-1">{phone}</Text>
    </View>
  );
};

export default ProfileHeader;