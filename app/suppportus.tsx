// screens/SupportUsScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '@/context/ThemeContext';

export default function SupportUsScreen() {
  const { dark } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('coffee');

  const supportTiers = [
    {
      id: 'coffee',
      title: 'Buy a Coffee',
      price: '$3',
      description: 'Support our caffeine addiction',
      icon: 'cafe',
      color: '#D97706',
      features: ['Our eternal gratitude', 'Good karma points'],
    },
    {
      id: 'lunch',
      title: 'Lunch Break',
      price: '$10',
      description: 'Fuel our development sessions',
      icon: 'fast-food',
      color: '#059669',
      features: ['All previous benefits', 'Shoutout in our updates'],
    },
    {
      id: 'dinner',
      title: 'Dinner Date',
      price: '$25',
      description: 'Help us keep the lights on',
      icon: 'restaurant',
      color: '#7C3AED',
      features: ['All previous benefits', 'Early access to features'],
    },
    {
      id: 'monthly',
      title: 'Monthly Supporter',
      price: '$5/month',
      description: 'Ongoing support for development',
      icon: 'infinite',
      color: '#DC2626',
      features: ['All previous benefits', 'Priority support', 'Feature requests'],
    },
  ];

  const otherWays = [
    {
      title: 'Share the App',
      description: 'Tell your friends about us',
      icon: 'share-social',
      color: '#7e00fc',
    },
    {
      title: 'Rate Us',
      description: 'Leave a review on the App Store',
      icon: 'star',
      color: '#F59E0B',
    },
    {
      title: 'Follow Us',
      description: 'Stay updated on social media',
      icon: 'logo-twitter',
      color: '#1DA1F2',
    },
    {
      title: 'Feedback',
      description: 'Help us improve the app',
      icon: 'chatbubble',
      color: '#8B5CF6',
    },
  ];

  const handleSupport = async () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Thank You! ❤️',
        `Your support means the world to us! We'll continue working hard to make Timeline Tracker even better.`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };

  const openStoreReview = () => {
    // Platform-specific store links
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/idYOUR_APP_ID'
      : 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';
    
    Linking.openURL(storeUrl).catch((err) => {
      Alert.alert('Error', 'Could not open store. Please try again later.');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Support Us
          </Text>
          <Text style={[styles.headerSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Help us keep the app going
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={[styles.heroCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <View style={[styles.heartIcon, { backgroundColor: '#EF4444' + '20' }]}>
            <Ionicons name="heart" size={32} color="#EF4444" />
          </View>
          <Text style={[styles.heroTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Love Timeline Tracker?
          </Text>
          <Text style={[styles.heroText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            This app is built with passion and maintained in our spare time. Your support helps us continue improving and adding new features.
          </Text>
        </View>

        {/* SUPPORT TIERS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Choose Your Support Tier
          </Text>
          <View style={styles.tiersContainer}>
            {supportTiers.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                onPress={() => setSelectedTier(tier.id)}
                style={[
                  styles.tierCard,
                  { backgroundColor: dark ? '#1a1a1a' : '#ffffff' },
                  selectedTier === tier.id && { borderColor: tier.color, borderWidth: 2 }
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.tierHeader}>
                  <View style={[styles.tierIcon, { backgroundColor: tier.color + '20' }]}>
                    <Ionicons name={tier.icon} size={24} color={tier.color} />
                  </View>
                  <View style={styles.tierPricing}>
                    <Text style={[styles.tierPrice, { color: dark ? '#f3f4f6' : '#111827' }]}>
                      {tier.price}
                    </Text>
                    <Text style={[styles.tierTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
                      {tier.title}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tierDescription, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  {tier.description}
                </Text>
                <View style={styles.featuresList}>
                  {tier.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color={tier.color} />
                      <Text style={[styles.featureText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUPPORT BUTTON */}
        <TouchableOpacity
          onPress={handleSupport}
          disabled={loading}
          style={[
            styles.supportButton,
            { 
              backgroundColor: '#7e00fc',
              opacity: loading ? 0.5 : 1
            }
          ]}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="heart" size={20} color="#ffffff" />
              <Text style={styles.supportButtonText}>
                Support with {
                  supportTiers.find(t => t.id === selectedTier)?.title || 'Coffee'
                }
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* OTHER WAYS TO SUPPORT */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Other Ways to Support
          </Text>
          <View style={styles.otherWaysGrid}>
            {otherWays.map((way, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  if (way.title === 'Rate Us') {
                    openStoreReview();
                  } else if (way.title === 'Feedback') {
                    // Navigate to feedback screen
                  } else {
                    Alert.alert(way.title, `Thanks for considering to ${way.description.toLowerCase()}`);
                  }
                }}
                style={[styles.wayCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}
                activeOpacity={0.7}
              >
                <View style={[styles.wayIcon, { backgroundColor: way.color + '20' }]}>
                  <Ionicons name={way.icon} size={24} color={way.color} />
                </View>
                <Text style={[styles.wayTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
                  {way.title}
                </Text>
                <Text style={[styles.wayDescription, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  {way.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TRANSPARENCY */}
        <View style={[styles.transparencyCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <Ionicons name="shield-checkmark" size={32} color="#10B981" />
          <Text style={[styles.transparencyTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            100% Transparent
          </Text>
          <Text style={[styles.transparencyText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Every contribution goes directly towards app development, server costs, and creating new features. We're committed to keeping Timeline Tracker ad-free and privacy-focused.
          </Text>
        </View>

        {/* THANK YOU */}
        <View style={styles.thankYouSection}>
          <Ionicons name="sparkles" size={32} color={dark ? '#94a3b8' : '#6b7280'} />
          <Text style={[styles.thankYouTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Thank You!
          </Text>
          <Text style={[styles.thankYouText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Whether you support us financially, by sharing the app, or simply by being an active user - we appreciate you. You're what makes this community special.
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  heroCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heartIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  tiersContainer: {
    gap: 16,
  },
  tierCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tierPricing: {
    flex: 1,
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tierDescription: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 22,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  supportButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  otherWaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  wayCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wayIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  wayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  wayDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  transparencyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transparencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  transparencyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  thankYouSection: {
    alignItems: 'center',
    padding: 20,
  },
  thankYouTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  thankYouText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});