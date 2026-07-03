import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
};

const SettingsItem = ({
  title,
  subtitle,
  icon,
  danger,
  onPress,
  showChevron = true,
  isLast = false,
}: Props) => {
  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        className="flex-row items-center px-4 py-3.5"
      >
        {/* Icon */}
        {icon && (
          <View
            className={`size-8 rounded-lg items-center justify-center mr-3 ${
              danger ? "bg-red-50" : "bg-slate-100"
            }`}
          >
            {icon}
          </View>
        )}

        {/* Text */}
        <View className="flex-1">
          <Text
            className={`text-base ${
              danger ? "text-red-500 font-medium" : "text-slate-800"
            }`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-xs text-slate-400 mt-0.5">{subtitle}</Text>
          )}
        </View>

        {/* Chevron */}
        {showChevron && !danger && (
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        )}
      </TouchableOpacity>

      {/* Separator — hidden on last item */}
      {!isLast && (
        <View className="mx-16 border-b border-slate-200" />
      )}
    </>
  );
};

export default SettingsItem;