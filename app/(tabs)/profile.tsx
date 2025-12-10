// Profile.tsx - Complete Solution 3 Implementation
import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext";
import { TracksContext } from "@/context/TracksContext";
import { router } from "expo-router";
import { useProfile } from "@/context/ProfileContext";
import { useTimeline } from "@/context/TimelineContext"; // Add this import

const SCREEN_WIDTH = Dimensions.get("window").width;
const NUM_COLUMNS = 10;
const GAP = 4;
const BLOCK_SIZE = (SCREEN_WIDTH - 40 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const BLOCK_COUNT = 60;

const TRACKS_KEY = "USER_TRACKS";

export default function Profile() {
  const { dark, toggleDark } = useContext(ThemeContext);
  const {
    tracks,
    addTrack,
    clearTracks,
    getTrackStats: getTrackStatsFromContext
  } = useContext(TracksContext);
  const { profile } = useProfile();
  const { items: timelineItems, clearItems } = useTimeline(); // Use timeline context
  
  const [newTrackName, setNewTrackName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTracks: 0,
    streakDays: 0,
  });
  const [trackStats, setTrackStats] = useState<Record<string, { total: number, weekly: number }>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fadeAnim = new Animated.Value(1);

  // Calculate per-track statistics
  const calculateTrackStats = useCallback(async () => {
    try {
      const statsMap: Record<string, { total: number, weekly: number }> = {};

      // Calculate last 7 days for weekly count
      const today = new Date();
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString();
      });

      // Calculate stats for each track
      for (const track of tracks) {
        try {
          // Get total count from context using track ID
          const total = await getTrackStatsFromContext(track.id);

          // Calculate weekly count from current timeline items
          const trackEvents = timelineItems.filter(e => e.track === track.name);
          const weekly = trackEvents.filter(e => last7Days.includes(e.date)).length;

          statsMap[track.name] = { total, weekly };
        } catch (error) {
          console.error(`Error calculating stats for track ${track.name}:`, error);
          statsMap[track.name] = { total: 0, weekly: 0 };
        }
      }

      setTrackStats(statsMap);
    } catch (error) {
      console.error("Error calculating track stats:", error);
    }
  }, [tracks, timelineItems, getTrackStatsFromContext]);

  // Recalculate stats when tracks or timeline items change
  useEffect(() => {
    const updateStats = async () => {
      // Calculate overall stats
      const totalEvents = timelineItems.length;
      const totalTracks = tracks.length;

      // Calculate streak (last 7 days with any events)
      const today = new Date();
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString();
      });

      const streak = last7Days.filter(date =>
        timelineItems.some(e => e.date === date)
      ).length;

      setStats({ totalEvents, totalTracks, streakDays: streak });

      // Calculate per-track stats
      await calculateTrackStats();
    };

    updateStats();
  }, [timelineItems, tracks, calculateTrackStats]);

  const clearData = () => {
    setShowDeleteConfirm(true);
  };

  const confirmClearData = async () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    await AsyncStorage.removeItem(TRACKS_KEY);
    await AsyncStorage.removeItem("USERITEMS"); // Use the same key as TimelineContext
    clearTracks();
    clearItems(); // Clear timeline items from context
    setTrackStats({});
    setShowDeleteConfirm(false);
    Alert.alert("Success", "All data has been cleared!");
  };

  const generateRandomColor = () => {
    const colors = [
      "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4",
      "#3B82F6", "#8B5CF6", "#EC4899", "#7e00fc", "#14B8A6",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createTrack = async () => {
    const name = newTrackName.trim();
    if (!name) {
      Alert.alert("Error", "Please enter a track name");
      return;
    }

    if (name.length > 20) {
      Alert.alert("Error", "Track name must be less than 20 characters");
      return;
    }

    try {
      await addTrack({ name, color: generateRandomColor() });
      setNewTrackName("");
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create track");
    }
  };

  // Generate calendar blocks for a track
  const generateCalendar = useCallback((trackName: string) => {
    const today = new Date();
    return Array.from({ length: BLOCK_COUNT }).map((_, i) => {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString();
      const hasEvent = timelineItems.some(
        (e) => e.track === trackName && e.date === dateStr
      );
      return { id: `${trackName}-${dateStr}`, active: hasEvent };
    });
  }, [timelineItems]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={{ backgroundColor: dark ? "#121212" : "#f8fafc" }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                Profile
              </Text>
              <Text style={[styles.headerSubtitle, { color: dark ? "#94a3b8" : "#64748b" }]}>
                Your progress and tracks
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: dark ? "#2a2a2a" : "#f1f5f9" }]}
                onPress={toggleDark}
              >
                <Ionicons
                  name={dark ? "sunny" : "moon"}
                  size={22}
                  color={dark ? "#fbbf24" : "#64748b"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: dark ? "#2a2a2a" : "#f1f5f9" }]}
                onPress={() => router.push('/settings')}
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={dark ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PROFILE CARD */}
        <View style={[styles.profileCard, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
          <View style={styles.profileHeader}>
            <Image
              source={
                profile?.avatarUrl
                  ? { uri: profile.avatarUrl }
                  : require("@/assets/images/profile.png")
              }
              style={styles.avatar}
            />

            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                {profile?.name || "Your Name"}
              </Text>
              <Text style={[styles.username, { color: dark ? "#94a3b8" : "#64748b" }]}>
                @{profile?.username || "yourusername"}
              </Text>
              <View style={styles.memberSince}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text style={[styles.memberText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                  Member since {profile ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  }) : "Jan 2024"}
                </Text>
              </View>
            </View>
          </View>

          {/* STATS GRID */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: dark ? "#262626" : "#f1f5f9" }]}>
              <View style={[styles.statIcon, { backgroundColor: "#7e00fc" }]}>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              </View>
              <Text style={[styles.statNumber, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                {stats.totalEvents}
              </Text>
              <Text style={[styles.statLabel, { color: dark ? "#94a3b8" : "#64748b" }]}>
                Total Entries
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: dark ? "#262626" : "#f1f5f9" }]}>
              <View style={[styles.statIcon, { backgroundColor: "#10b981" }]}>
                <MaterialIcons name="track-changes" size={20} color="#ffffff" />
              </View>
              <Text style={[styles.statNumber, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                {stats.totalTracks}
              </Text>
              <Text style={[styles.statLabel, { color: dark ? "#94a3b8" : "#64748b" }]}>
                Active Tracks
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: dark ? "#262626" : "#f1f5f9" }]}>
              <View style={[styles.statIcon, { backgroundColor: "#f59e0b" }]}>
                <FontAwesome5 name="fire" size={18} color="#ffffff" />
              </View>
              <Text style={[styles.statNumber, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                {stats.streakDays}
              </Text>
              <Text style={[styles.statLabel, { color: dark ? "#94a3b8" : "#64748b" }]}>
                Day Streak
              </Text>
            </View>
          </View>
        </View>

        {/* ADD TRACK CTA */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addTrackCta, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}
        >
          <View style={styles.addTrackContent}>
            <View style={[styles.addTrackIcon, { backgroundColor: "#7e00fc" }]}>
              <Ionicons name="add" size={24} color="#ffffff" />
            </View>
            <View style={styles.addTrackText}>
              <Text style={[styles.addTrackTitle, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                Create New Track
              </Text>
              <Text style={[styles.addTrackSubtitle, { color: dark ? "#94a3b8" : "#64748b" }]}>
                Start tracking a new habit or activity
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={dark ? "#94a3b8" : "#64748b"} />
          </View>
        </TouchableOpacity>

        {/* TRACK CALENDARS SECTION */}
        <View style={styles.tracksSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: dark ? "#f8fafc" : "#1e293b" }]}>
              Your Tracks
            </Text>
            <Text style={[styles.sectionSubtitle, { color: dark ? "#94a3b8" : "#64748b" }]}>
              {tracks.length} track{tracks.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {tracks.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
              <Feather name="calendar" size={48} color={dark ? "#4b5563" : "#cbd5e1"} />
              <Text style={[styles.emptyStateTitle, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                No Tracks Yet
              </Text>
              <Text style={[styles.emptyStateText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                Create your first track to start visualizing your progress
              </Text>
            </View>
          ) : (
            tracks.map((track) => {
              const stats = trackStats[track.name] || { total: 0, weekly: 0 };

              return (
                <View
                  key={track.id}
                  style={[styles.trackCard, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}
                >
                  <View style={styles.trackHeader}>
                    <View style={styles.trackInfo}>
                      <View style={[styles.trackColorDot, { backgroundColor: track.color }]} />
                      <View>
                        <Text style={[styles.trackName, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                          {track.name}
                        </Text>
                        <View style={styles.trackStatsRow}>
                          <View style={styles.trackStat}>
                            <Ionicons name="checkmark" size={14} color="#10b981" />
                            <Text style={[styles.trackStatText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                              {stats.total} total
                            </Text>
                          </View>
                          <View style={styles.trackStat}>
                            <Ionicons name="flame" size={14} color="#f59e0b" />
                            <Text style={[styles.trackStatText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                              {stats.weekly} this week
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.trackCountBadge, { backgroundColor: track.color + '20' }]}>
                      <Text style={[styles.trackCountText, { color: track.color }]}>
                        {stats.total}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.calendarTitle, { color: dark ? "#94a3b8" : "#64748b" }]}>
                    Last 60 days
                  </Text>
                  <View style={styles.calendarGrid}>
                    {generateCalendar(track.name).map((day, index) => (
                      <View
                        key={day.id}
                        style={[
                          styles.calendarBlock,
                          {
                            width: BLOCK_SIZE,
                            height: BLOCK_SIZE,
                            backgroundColor: day.active ? track.color : dark ? "#2a2a2a" : "#f1f5f9",
                            opacity: day.active ? 1 : 0.6,
                          },
                        ]}
                      />
                    ))}
                  </View>

                  <View style={styles.calendarLegend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: track.color }]} />
                      <Text style={[styles.legendText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                        Activity day
                      </Text>
                    </View>
                    <Text style={[styles.daysCount, { color: dark ? "#94a3b8" : "#64748b" }]}>
                      {stats.weekly} of last 7 days
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>



        <View style={{ height: 40 }} />
      </ScrollView>

      {/* CREATE TRACK MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dark ? "#f8fafc" : "#1e293b" }]}>
                Create New Track
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={dark ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: dark ? "#94a3b8" : "#64748b" }]}>
              Track habits, workouts, or any daily activity
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={dark ? "#94a3b8" : "#64748b"}
                style={styles.inputIcon}
              />
              <TextInput
                value={newTrackName}
                onChangeText={setNewTrackName}
                placeholder="Enter track name"
                placeholderTextColor={dark ? "#6b7280" : "#9ca3af"}
                style={[styles.modalInput, {
                  backgroundColor: dark ? "#262626" : "#f8fafc",
                  color: dark ? "#f8fafc" : "#1e293b",
                  borderColor: dark ? "#374151" : "#e5e7eb",
                }]}
                autoFocus
              />
            </View>

            <Text style={[styles.inputHint, { color: dark ? "#6b7280" : "#9ca3af" }]}>
              Examples: "Meditation", "Workout", "Reading", "Study"
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.cancelButton, { borderColor: dark ? "#374151" : "#e5e7eb" }]}
              >
                <Text style={[styles.cancelButtonText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createTrack}
                style={[styles.createButton, { backgroundColor: "#7e00fc" }]}
                disabled={!newTrackName.trim()}
              >
                <Text style={styles.createButtonText}>
                  Create Track
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal transparent visible={showDeleteConfirm} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
            <View style={[styles.deleteIconContainer, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="warning-outline" size={32} color="#dc2626" />
            </View>
            <Text style={[styles.deleteTitle, { color: dark ? "#f8fafc" : "#1e293b" }]}>
              Clear All Data?
            </Text>
            <Text style={[styles.deleteText, { color: dark ? "#94a3b8" : "#64748b" }]}>
              This will permanently delete all your tracks and timeline entries. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={[styles.cancelButton, { borderColor: dark ? "#374151" : "#e5e7eb" }]}
              >
                <Text style={[styles.cancelButtonText, { color: dark ? "#94a3b8" : "#64748b" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmClearData}
                style={[styles.deleteConfirmButton, { backgroundColor: "#dc2626" }]}
              >
                <Text style={styles.deleteConfirmButtonText}>
                  Delete All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#7e00fc',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  username: {
    fontSize: 15,
    marginBottom: 8,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberText: {
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  addTrackCta: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addTrackContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTrackIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addTrackText: {
    flex: 1,
  },
  addTrackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  addTrackSubtitle: {
    fontSize: 14,
  },
  tracksSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  trackCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  trackName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackStatsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  trackStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackStatText: {
    fontSize: 13,
  },
  trackCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trackCountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GAP / 2,
    marginBottom: 16,
  },
  calendarBlock: {
    margin: GAP / 2,
    borderRadius: 4,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 13,
  },
  daysCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearDataButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  clearDataText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  modalInput: {
    padding: 16,
    paddingLeft: 48,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  inputHint: {
    fontSize: 13,
    marginTop: 8,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});