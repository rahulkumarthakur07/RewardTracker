// screens/AboutUsScreen.tsx
import { ThemeContext } from '@/context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useContext } from 'react';
import {
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AboutUsScreen() {
  const { dark } = useContext(ThemeContext);

  const features = [
    { icon: 'timeline', title: 'Timeline Tracking', description: 'Track your daily activities and habits' },
    { icon: 'compare', title: 'Visual Comparisons', description: 'Compare different moments side by side' },
    { icon: 'track-changes', title: 'Custom Tracks', description: 'Create personalized categories' },
    { icon: 'insights', title: 'Progress Insights', description: 'Get insights from your data' },
  ];

  const team = [
    { name: 'Rahul Sharma', role: 'Founder and CEO of Xyronix Technologies', avatar: 'https://rahulkumarthakur.com.np/assets/hero-BrZkCehB.png' },
    
  ];

  const links = [
    { icon: 'globe', title: "Developer's Portfolio", url: 'https://rahulkumarthakur.com.np/' },
    { icon: 'logo-facebook', title: 'Facebook', url: 'https://www.facebook.com/rahul.sharma.41462' },

  ];

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <SafeAreaView  style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            About Us
          </Text>
          <Text style={[styles.headerSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Your personal timeline companion
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={[styles.heroCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <View style={styles.appLogo}>
            <Ionicons name="time" size={48} color="#7e00fc" />
          </View>
          <Text style={[styles.appName, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Timeline Tracker
          </Text>
          <Text style={[styles.appVersion, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appDescription, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Capture, compare, and celebrate your journey. Every moment tells a story.
          </Text>
        </View>

        {/* FEATURES */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            What We Offer
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View 
                key={index}
                style={[styles.featureCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}
              >
                <View style={[styles.featureIcon, { backgroundColor: '#7e00fc' + '20' }]}>
                  <MaterialIcons name={feature.icon} size={24} color="#7e00fc" />
                </View>
                <Text style={[styles.featureTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* OUR STORY */}
        <View style={[styles.storyCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Our Story
          </Text>
          <Text style={[styles.storyText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Timeline Tracker was born from a simple idea: our lives are made up of moments, and each moment deserves to be remembered. We believe in the power of reflection and growth through capturing your journey.
          </Text>
          <Text style={[styles.storyText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Our mission is to help you track your progress, celebrate your achievements, and gain insights from your daily experiences. Whether it's personal growth, fitness, work, or hobbies - every track tells a story.
          </Text>
        </View>

        {/* TEAM */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Meet the Team
          </Text>
          <View style={styles.teamGrid}>
            {team.map((member, index) => (
<View 
  key={index}
  style={[styles.teamCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}
>
  <View style={styles.avatar}>
    <Image 
    className='rounded-full mb-6'
      source={{ uri: member.avatar }} 
      style={{ width: 100, height: 100 }} // adjust size as needed
    />
  </View>
  <Text style={[styles.teamName, { color: dark ? '#f3f4f6' : '#111827' }]}>
    {member.name}
  </Text>
  <Text style={[styles.teamRole, { color: dark ? '#94a3b8' : '#6b7280' }]}>
    {member.role}
  </Text>
</View>

            ))}
          </View>
        </View>

        {/* LINKS */}
        <View style={[styles.linksCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Useful Links
          </Text>
          <View style={styles.linksList}>
            {links.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => openLink(link.url)}
                style={styles.linkItem}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Ionicons 
                    name={link.icon} 
                    size={20} 
                    color={dark ? '#94a3b8' : '#6b7280'} 
                  />
                  <Text style={[styles.linkText, { color: dark ? '#f3f4f6' : '#111827' }]}>
                    {link.title}
                  </Text>
                </View>
                <Ionicons 
                  name="open-outline" 
                  size={20} 
                  color={dark ? '#94a3b8' : '#6b7280'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CONTACT */}
        <View style={[styles.contactCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Get in Touch
          </Text>
          <Text style={[styles.contactText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Have questions or suggestions? We'd love to hear from you!
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:rahulbarahi.connect@gmail.com')}
            style={[styles.contactButton, { backgroundColor: '#7e00fc' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="mail" size={20} color="#ffffff" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View className='mb-6' style={styles.footer}>
          <Text style={[styles.footerText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Made with ❤️ for productive souls
          </Text>
          <Text style={[styles.copyright, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            © {new Date().getFullYear()} Timeline Tracker. All rights reserved.
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
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7e00fc' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 16,
  },
  appDescription: {
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
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
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  storyCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  teamCard: {
    flex: 1,
    minWidth: '45%',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    padding:8
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 14,
  },
  linksCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linksList: {
    gap: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
  },
});