// screens/ProfileSetupScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useProfile } from "@/context/ProfileContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileSetupScreen() {
  const { profile, updateProfile, updateAvatar, isSaving, loadProfile, pickAvatar } = useProfile();

  const [form, setForm] = useState({
    name: "",
    username: "",
    avatar: "",
  });

  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});
  const [loading, setLoading] = useState(false);

  // Initialize form from profile
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        username: profile.username || "",
        avatar: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors: { name?: string; username?: string } = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (form.username.trim().length < 3)
      newErrors.username = "Username must be at least 3 characters";
    else if (form.username.trim().length > 20)
      newErrors.username = "Username must be less than 20 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim()))
      newErrors.username = "Username can only contain letters, numbers, and underscores";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickAvatar = async () => {
    try {
      await pickAvatar();
      if (profile?.avatarUrl) setForm({ ...form, avatar: profile.avatarUrl });
    } catch (error) {
      console.error("Avatar pick error:", error);
      Alert.alert("Oops!", "Failed to pick image.");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Save profile using form state
      await updateProfile(form.name, form.username.toLowerCase());

      if (form.avatar && form.avatar !== profile?.avatarUrl) {
        await updateAvatar(form.avatar);
      }

      await loadProfile();
      await AsyncStorage.setItem("userdataAvailable", "true");
      await AsyncStorage.setItem("profileSetupComplete", "true");

      Alert.alert("🎉 Profile Complete!", "Your profile has been successfully set up!", [
        { text: "Let's Go!", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert("Something went wrong", error.message || "Couldn't save profile");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.name.trim().length >= 2 &&
    form.username.trim().length >= 3 &&
    /^[a-zA-Z0-9_]+$/.test(form.username.trim());

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.heading}>Create Your Profile</Text>
            <Text style={styles.subtitle}>Tell us a bit about yourself to get started</Text>
          </View>

          <View style={styles.avatarSection}>
            <Text style={styles.sectionLabel}>Profile Picture</Text>
            <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarContainer}>
              {form.avatar ? (
                <Image source={{ uri: form.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#8B5CF6" />
                </View>
              )}
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to upload a photo (optional)</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                placeholder="Enter your full name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                style={[styles.input, errors.name && styles.inputError]}
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username *</Text>
              <TextInput
                placeholder="Choose a username"
                value={form.username}
                onChangeText={(text) => setForm({ ...form, username: text.toLowerCase() })}
                style={[styles.input, errors.username && styles.inputError]}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.hintText}>
                {form.username.length}/30 • Letters, numbers, and underscores only
              </Text>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (!isFormValid || loading || isSaving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isFormValid || loading || isSaving}
          >
            {loading || isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>You can update your profile anytime in settings</Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// --- Keep your styles same as before ---


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  formSection: {
    width: "100%",
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  hintText: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  footerText: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
});