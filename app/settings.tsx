// screens/SettingsScreen.tsx
import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons,  } from '@expo/vector-icons';
import { ThemeContext } from '@/context/ThemeContext';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProfileContext } from '@/context/ProfileContext';

export default function SettingsScreen() {
  const { dark, toggleDark } = useContext(ThemeContext);
const { clearProfile } = useContext(ProfileContext);




const confirmAndClearAllData = () => {
  Alert.alert(
    "Clear All Data",
    "This will delete all your tracks, timeline entries, and reset your profile completely. This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Clear ALL AsyncStorage (timeline, tracks, settings...)
            await AsyncStorage.clear();

            // 2. Clear profile (name, username, avatar)
            await clearProfile();

            console.log("All app + profile data fully cleared!");

            Alert.alert("Success", "Your account has been reset.");

            // 3. Navigate to splash / onboarding
            router.replace("/");

          } catch (error) {
            console.error("Error clearing app data:", error);
            Alert.alert("Error", "Failed to clear data. Try again.");
          }
        },
      },
    ]
  );
};


  const settingsItems = [
    {
      title: 'Profile',
      subtitle: 'Edit your profile information',
      icon: 'person-outline',
      iconColor: '#4CAF50',
      onPress: () => router.push('/EditProfileScreen'),
    },
    {
      title: 'Theme',
      subtitle: 'Toggle between dark and light mode',
      icon: 'contrast-outline',
      iconColor: '#2196F3',
      type: 'toggle',
      value: dark,
      onPress: toggleDark,
    },
    {
      title: 'Tracks',
      subtitle: 'Manage your tracks',
      icon: 'list-outline',
      iconColor: '#FF9800',
      onPress: () => router.push('/tracks'),
    },
    {
      title: 'Feedback',
      subtitle: 'Send us your feedback',
      icon: 'chatbubble-outline',
      iconColor: '#9C27B0',
      onPress: () => router.push('/feedback'),
    },
    {
      title: 'About Us',
      subtitle: 'Learn about our app',
      icon: 'information-circle-outline',
      iconColor: '#00BCD4',
      onPress: () => router.push('/aboutus'),
    },
    {
      title: 'Support Us',
      subtitle: 'Buy us a coffee',
      icon: 'cafe-outline',
      iconColor: '#FF5722',
      onPress: () => router.push('/suppportus'),
    },
    {
      title: 'Export Data',
      subtitle: 'Export your timeline data',
      icon: 'download-outline',
      iconColor: '#607D8B',
      onPress: () => Alert.alert('Export', 'Data export feature coming soon!'),
    },
    {
      title: 'Clear All Data',
      subtitle: 'Delete all your data',
      icon: 'trash-outline',
      iconColor: '#F44336',
      onPress: confirmAndClearAllData
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
              Settings
            </Text>
            <Text style={[styles.headerSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
              Customize your experience
            </Text>
          </View>
        </View>
      </View>

      {/* SETTINGS LIST */}
      <ScrollView style={styles.settingsList}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={[
              styles.settingItem,
              { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
                <Ionicons name={item.icon} size={22} color={item.iconColor} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.settingSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  {item.subtitle}
                </Text>
              </View>
            </View>

            {item.type === 'toggle' ? (
              <Switch
                value={item.value}
                onValueChange={item.onPress}
                trackColor={{ false: '#d1d5db', true: item.iconColor }}
                thumbColor="#ffffff"
              />
            ) : (
              <Ionicons name="chevron-forward" size={22} color={dark ? '#94a3b8' : '#6b7280'} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* APP VERSION */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
          Version 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  settingsList: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
});