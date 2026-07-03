import { View, Text } from "react-native";
import React from "react";

type Props = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection = ({ title, children }: Props) => {
  return (
    <View className="mb-6">
      <Text className="px-1 mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </Text>
      <View className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm ">
        {children}
      </View>
    </View>
  );
};

export default SettingsSection;