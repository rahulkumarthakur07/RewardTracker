// screens/FeedbackScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/ThemeContext';
import Slider from '@react-native-community/slider';

export default function FeedbackScreen() {
  const { dark } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: 'suggestion',
    rating: 5,
    message: '',
    email: '',
  });

  const feedbackTypes = [
    { id: 'bug', label: 'Bug Report', icon: 'bug-outline', color: '#EF4444' },
    { id: 'suggestion', label: 'Suggestion', icon: 'bulb-outline', color: '#F59E0B' },
    { id: 'feature', label: 'Feature Request', icon: 'rocket-outline', color: '#3B82F6' },
    { id: 'other', label: 'Other', icon: 'chatbox-outline', color: '#8B5CF6' },
  ];

  const handleSubmit = async () => {
    if (!feedback.message.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted. We appreciate your help in making our app better!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFeedback({
                type: 'suggestion',
                rating: 5,
                message: '',
                email: '',
              });
            }
          }
        ]
      );
    }, 1500);
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent',
    };
    return labels[rating] || '';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Feedback
          </Text>
          <Text style={[styles.headerSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Help us improve the app
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* FEEDBACK TYPE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Type of Feedback
          </Text>
          <View style={styles.typeGrid}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setFeedback({ ...feedback, type: type.id })}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: feedback.type === type.id ? type.color + '20' : (dark ? '#1a1a1a' : '#ffffff'),
                    borderColor: feedback.type === type.id ? type.color : (dark ? '#374151' : '#e5e7eb'),
                  }
                ]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={type.icon} 
                  size={24} 
                  color={feedback.type === type.id ? type.color : (dark ? '#94a3b8' : '#6b7280')} 
                />
                <Text 
                  style={[
                    styles.typeLabel,
                    { 
                      color: feedback.type === type.id ? type.color : (dark ? '#94a3b8' : '#6b7280') 
                    }
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* RATING */}
        <View style={styles.section}>
          <View style={styles.ratingHeader}>
            <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
              Overall Rating
            </Text>
            <Text style={[styles.ratingValue, { color: dark ? '#94a3b8' : '#6b7280' }]}>
              {feedback.rating}/5
            </Text>
          </View>
          <Text style={[styles.ratingLabel, { color: dark ? '#d1d5db' : '#4b5563' }]}>
            {getRatingLabel(feedback.rating)}
          </Text>
          <Slider
            value={feedback.rating}
            onValueChange={(value) => setFeedback({ ...feedback, rating: Math.round(value) })}
            minimumValue={1}
            maximumValue={5}
            step={1}
            minimumTrackTintColor="#F59E0B"
            maximumTrackTintColor={dark ? '#374151' : '#e5e7eb'}
            thumbTintColor="#F59E0B"
            style={styles.slider}
          />
          <View style={styles.ratingMarks}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Text 
                key={num}
                style={[
                  styles.ratingMark,
                  { 
                    color: feedback.rating >= num ? '#F59E0B' : (dark ? '#94a3b8' : '#6b7280'),
                    fontWeight: feedback.rating === num ? '600' : '400',
                  }
                ]}
              >
                {num}
              </Text>
            ))}
          </View>
        </View>

        {/* MESSAGE */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Your Feedback *
          </Text>
          <TextInput
            value={feedback.message}
            onChangeText={(text) => setFeedback({ ...feedback, message: text })}
            style={[
              styles.messageInput,
              {
                backgroundColor: dark ? '#262626' : '#f8fafc',
                color: dark ? '#f3f4f6' : '#111827',
                borderColor: dark ? '#374151' : '#e5e7eb',
              }
            ]}
            placeholder="Tell us what you think..."
            placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            {feedback.message.length}/1000 characters
          </Text>
        </View>

        {/* EMAIL (OPTIONAL) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            Email (Optional)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            If you'd like us to follow up with you
          </Text>
          <TextInput
            value={feedback.email}
            onChangeText={(text) => setFeedback({ ...feedback, email: text })}
            style={[
              styles.emailInput,
              {
                backgroundColor: dark ? '#262626' : '#f8fafc',
                color: dark ? '#f3f4f6' : '#111827',
                borderColor: dark ? '#374151' : '#e5e7eb',
              }
            ]}
            placeholder="your@email.com"
            placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !feedback.message.trim()}
          style={[
            styles.submitButton,
            { 
              backgroundColor: '#3b82f6',
              opacity: loading || !feedback.message.trim() ? 0.5 : 1
            }
          ]}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </>
          )}
        </TouchableOpacity>

        {/* THANK YOU MESSAGE */}
        <View style={styles.thankYou}>
          <Ionicons name="heart" size={24} color={dark ? '#94a3b8' : '#6b7280'} />
          <Text style={[styles.thankYouText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Thank you for helping us improve!
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingLabel: {
    fontSize: 14,
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingMark: {
    fontSize: 14,
  },
  messageInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  emailInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  thankYou: {
    alignItems: 'center',
    padding: 20,
  },
  thankYouText: {
    fontSize: 14,
    marginTop: 8,
  },
});