// screens/EditProfileScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '@/context/ThemeContext';
import { useProfile } from '@/context/ProfileContext'; // Import the profile hook

export default function EditProfileScreen() {
  const { dark } = useContext(ThemeContext);
  const { 
    profile, 
    isLoading, 
    isSaving, 
    updateProfile, 
    updateAvatar, 
    pickAvatar 
  } = useProfile();
  
  const [form, setForm] = useState({
    name: '',
    username: '',
  });

  // Initialize form with profile data when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        username: profile.username || '',
      });
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      await pickAvatar();
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile picture');
    }
  };

// screens/EditProfileScreen.tsx - Updated handleSave function
const handleSave = async () => {
  if (!form.name.trim()) {
    Alert.alert('Error', 'Please enter your name');
    return;
  }

  if (!form.username.trim()) {
    Alert.alert('Error', 'Please enter a username');
    return;
  }

  try {
    console.log("Attempting to update profile..."); // Debug log
    console.log("Form data:", form); // Debug log
    
    // Call updateProfile with the form data
    await updateProfile(form.name, form.username);
    
    Alert.alert('Success', 'Profile updated successfully!');
    
    // Log success
    console.log("Profile update successful");
    
  } catch (error: any) {
    console.error("Profile update failed:", error); // Debug log
    Alert.alert('Error', error.message || 'Failed to update profile');
  }
};

  // Show loading while profile is loading
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dark ? '#60a5fa' : '#3b82f6'} />
          <Text style={[styles.loadingText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Edit Profile
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving || !profile}>
            {isSaving ? (
              <ActivityIndicator color={dark ? '#60a5fa' : '#3b82f6'} />
            ) : (
              <Text style={[styles.saveButton, { color: dark ? '#60a5fa' : '#3b82f6' }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* PROFILE IMAGE */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: profile?.avatarUrl || 'https://i.pravatar.cc/200?img=12' 
              }} 
              style={styles.profileImage} 
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.imageHint, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Tap to change photo
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Full Name *
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              style={[
                styles.input,
                {
                  backgroundColor: dark ? '#262626' : '#f8fafc',
                  color: dark ? '#f3f4f6' : '#111827',
                  borderColor: dark ? '#374151' : '#e5e7eb',
                }
              ]}
              placeholder="Enter your name"
              placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Username *
            </Text>
            <View style={styles.usernameContainer}>
              <Text style={[styles.atSymbol, { color: dark ? '#94a3b8' : '#6b7280' }]}>@</Text>
              <TextInput
                value={form.username}
                onChangeText={(text) => setForm({ ...form, username: text.toLowerCase().replace('@', '') })}
                style={[
                  styles.input,
                  styles.usernameInput,
                  {
                    backgroundColor: dark ? '#262626' : '#f8fafc',
                    color: dark ? '#f3f4f6' : '#111827',
                    borderColor: dark ? '#374151' : '#e5e7eb',
                  }
                ]}
                placeholder="username"
                placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
                autoCapitalize="none"
                maxLength={20}
              />
            </View>
            <Text style={[styles.inputHint, { color: dark ? '#6b7280' : '#9ca3af' }]}>
              Letters, numbers, and underscores only (3-20 characters)
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Member Since
            </Text>
            <View style={[
              styles.infoBox, 
              { 
                backgroundColor: dark ? '#262626' : '#f8fafc',
                borderColor: dark ? '#374151' : '#e5e7eb',
              }
            ]}>
              <Text style={[styles.infoText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                {profile ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Loading...'}
              </Text>
            </View>
          </View>
        </View>

        {/* STATS (Optional - you can remove or keep as is) */}
        <View style={[styles.statsCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.statsTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Account Info
          </Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={dark ? '#94a3b8' : '#6b7280'} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  Last Updated
                </Text>
                <Text style={[styles.infoValue, { color: dark ? '#f3f4f6' : '#111827' }]}>
                  {profile ? new Date(profile.updatedAt).toLocaleDateString() : 'Never'}
                </Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="key-outline" size={20} color={dark ? '#94a3b8' : '#6b7280'} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  User ID
                </Text>
                <Text style={[styles.infoValue, { color: dark ? '#f3f4f6' : '#111827' }]}>
                  {profile?.id?.substring(0, 8) || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* DANGER ZONE (Optional - you can remove or keep) */}
        <View style={[styles.dangerCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.dangerTitle, { color: '#ef4444' }]}>
            Reset Profile
          </Text>
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: '#ef4444' }]}
            onPress={() => Alert.alert(
              'Reset Profile',
              'This will reset your name, username, and profile picture to default. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Reset', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // You could add a reset function to ProfileContext if needed
                      // For now, just clear the avatar and reset name/username
                      await updateAvatar('');
                      await updateProfile('User', 'user');
                      Alert.alert('Success', 'Profile reset to default!');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to reset profile');
                    }
                  }
                },
              ]
            )}
          >
            <Ionicons name="refresh-outline" size={20} color="#ef4444" />
            <Text style={[styles.dangerButtonText, { color: '#ef4444' }]}>
              Reset to Default
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  imageHint: {
    fontSize: 14,
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    fontSize: 16,
    marginRight: 8,
  },
  usernameInput: {
    flex: 1,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 8,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 16,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  dangerCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});