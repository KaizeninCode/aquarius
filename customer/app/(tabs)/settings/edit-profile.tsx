import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { firestore, auth } from "@/FirebaseConfig";
import { useUser } from "../../context/UserContext";

const EditProfileScreen = () => {
  const { user, loading } = useUser();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // pre fill with current name once loaded
  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const isDirty = name.trim() !== (user?.name ?? "");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (isDirty) return;

    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert("Session expired. Please log in again.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await firestore().collection("users").doc(userId).update({
        name: name.trim(),
      });
      Alert.alert("Saved", "Your name has been updated.");
    } catch (error) {
      console.error("Failed to update name: ", error);
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-sate-50" style={{paddingBottom: useSafeAreaInsets().bottom}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 p-4" style={{paddingBottom: useSafeAreaInsets().bottom}}>
      <View className="flex-1">
        <Text className="text-2xl font-bold mb-2">Edit Profile</Text>
        <Text className="text-slate-500 text-sm mb-8">
          Update your display name. This is what customers will see on their
          order screen.
        </Text>

        {/* Phone — read only, not editable */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Phone Number
        </Text>
        <View className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 mb-6">
          <Text className="text-slate-400">{user?.phone ?? "—"}</Text>
        </View>

        {/* Name — editable */}
        <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Name
        </Text>
        <TextInput
          className={`border rounded-xl px-4 py-3.5 text-base mb-2 ${
            error ? "border-red-400" : "border-slate-200"
          }`}
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError("");
          }}
          placeholder="Your name"
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        {error ? (
          <Text className="text-red-500 text-sm mb-4">{error}</Text>
        ) : null}

        {/* Save button — only visually active when something changed */}
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center mt-4 ${
            isDirty && !saving ? "bg-green-600" : "bg-slate-200"
          }`}
          onPress={handleSave}
          disabled={!isDirty || saving}
        >
          <Text
            className={`font-bold text-base ${
              isDirty && !saving ? "text-white" : "text-slate-400"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
