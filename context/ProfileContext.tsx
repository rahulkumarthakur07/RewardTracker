// context/ProfileContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import React, { createContext, useEffect, useState } from "react";
import { Alert, Platform } from 'react-native';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (name: string, username: string) => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<void>;
  pickAvatar: () => Promise<void>;
  clearProfile: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: false,
  isSaving: false,
  loadProfile: async () => {},
  updateProfile: async () => {},
  updateAvatar: async () => {},
  pickAvatar: async () => {},
  clearProfile: async () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const PROFILE_KEY = "USER_PROFILE";
  const AVATAR_KEY = "USER_AVATAR";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Load profile from storage
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const profileJson = await AsyncStorage.getItem(PROFILE_KEY);
      const avatarUri = await AsyncStorage.getItem(AVATAR_KEY);

      if (profileJson) {
        const savedProfile = JSON.parse(profileJson);
        setProfile({
          ...savedProfile,
          avatarUrl: avatarUri || savedProfile.avatarUrl || '',
        });
      } else {
        const defaultProfile: UserProfile = {
          id: generateId(),
          name: "Your Name",
          username: "yourusername",
          avatarUrl: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      const minimalProfile: UserProfile = {
        id: generateId(),
        name: "User",
        username: "user",
        avatarUrl: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(minimalProfile);
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile name & username
  const updateProfile = async (name: string, username: string) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      if (!name.trim()) throw new Error("Name is required");
      if (!username.trim()) throw new Error("Username is required");
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) throw new Error("Invalid username");
      if (username.length < 3) throw new Error("Username too short");
      if (username.length > 20) throw new Error("Username too long");

      const updatedProfile: UserProfile = {
        ...profile,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Update avatar
  const updateAvatar = async (imageUri: string) => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(AVATAR_KEY, imageUri);
      const updatedProfile: UserProfile = {
        ...profile,
        avatarUrl: imageUri,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Pick avatar using ImagePicker
  const pickAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera roll permissions are required!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0].uri) {
        await updateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking avatar:", error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  // Clear profile completely
const clearProfile = async () => {
  try {
    await AsyncStorage.multiRemove([PROFILE_KEY, AVATAR_KEY]);
    
    // Reset to a valid default profile
    const defaultProfile: UserProfile = {
      id: generateId(),
      name: "User",
      username: "user",
      avatarUrl: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to storage immediately
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    setProfile(defaultProfile);

    console.log("Profile cleared successfully!");
  } catch (error) {
    console.error("Error clearing profile:", error);
    throw error;
  }
};


  useEffect(() => {
    loadProfile();
  }, []);

  const value: ProfileContextType = {
    profile,
    isLoading,
    isSaving,
    loadProfile,
    updateProfile,
    updateAvatar,
    pickAvatar,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook
export const useProfile = () => {
  const context = React.useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
