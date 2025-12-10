// TimelineScreen.tsx
import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  ScrollView,
  Animated,
  StyleSheet,
  Alert,
} from "react-native";
import Toast from 'react-native-toast-message';
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemeContext } from "@/context/ThemeContext";
import { TracksContext } from "@/context/TracksContext";
import { useTimeline } from "@/context/TimelineContext"; // Import the new context

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function TimelineScreen() {
  const { dark, currentTheme } = useContext(ThemeContext);
  const { tracks } = useContext(TracksContext);
  const { items, addItem, deleteItem, saveItems } = useTimeline(); // Use timeline context

  const [selectedTrack, setSelectedTrack] = useState<string | null>("All");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newText, setNewText] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const themeColors = dark ? currentTheme.dark : currentTheme.light;

  // Create folder for internal images
  useEffect(() => {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "timeline_images", {
      intermediates: true,
    }).catch(() => {});
  }, []);

  // Remove the loadItems useEffect since context handles it
  // Remove the loadItems function

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      quality: 0.8,
      allowsEditing: true,
    });
    if (result.canceled) return;

    const galleryUri = result.assets[0].uri;
    const fileName = Date.now() + ".jpg";
    const appUri = FileSystem.documentDirectory + "timeline_images/" + fileName;

    await FileSystem.copyAsync({ from: galleryUri, to: appUri });
    setNewImage(appUri);
  };

  const addEvent = async () => {
    if (!selectedTrack || selectedTrack === "All") {
      Alert.alert(
        "Track Not Selected",
        "Please select a track before adding content.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    if (!newText && !newImage) {
      Alert.alert(
        "Empty Content",
        "Please enter some text or select an image to add.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }

    const now = new Date();
    const trackColor = tracks.find((t) => t.name === selectedTrack)?.color || "#4caf50";

    const newItem = {
      id: Date.now().toString(),
      type: newText && newImage ? "text_image" : newImage ? "image" : "text",
      content: newText || "",
      track: selectedTrack,
      color: trackColor,
      image: newImage,
      date: selectedDate ? selectedDate.toLocaleDateString() : now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: now.getTime(),
    };

    try {
      // Use context's addItem instead of local saveItems
      await addItem(newItem);

      // Animation feedback
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setModalVisible(false);
      setNewText("");
      setNewImage(null);

      // Success alert


      // Toast message
      Toast.show({
        type: 'success',
        text1: 'Event Added',
        text2: 'Your progress has been successfully saved! 🎉',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to save event. Please try again.",
        [{ text: "OK", style: "cancel" }]
      );
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItemToDelete) return;
    
    try {
      // Use context's deleteItem
      await deleteItem(selectedItemToDelete.id);
      setDeleteModalVisible(false);
      setSelectedItemToDelete(null);
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to delete event. Please try again.",
        [{ text: "OK", style: "cancel" }]
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedDate(null);
    setSelectedTrack("All");
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(search.toLowerCase());
    const matchesDate = selectedDate ? item.date === selectedDate.toLocaleDateString() : true;
    const matchesTrack = selectedTrack === "All" ? true : item.track === selectedTrack;
    return matchesSearch && matchesDate && matchesTrack;
  });

const groupItemsByDate = () => {
  const groups = {};

  filteredItems.forEach(item => {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  });

  return Object.entries(groups).sort((a, b) => {
    const [monthA, dayA, yearA] = a[0].split("/").map(Number);
    const [monthB, dayB, yearB] = b[0].split("/").map(Number);

    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);

    // MOST RECENT FIRST
    return dateB.getTime() - dateA.getTime();
  });
};


  const renderItem = ({ item }) => {
    const track = tracks.find(t => t.name === item.track);
    
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => {
          setSelectedItemToDelete(item);
          setDeleteModalVisible(true);
        }}
        style={[
          styles.eventCard,
          {
            backgroundColor: dark ? "#1a1a1a" : "#ffffff",
            borderLeftWidth: 4,
            borderLeftColor: track?.color || item.color,
          }
        ]}
      >
        <View style={styles.eventHeader}>
          <View style={styles.trackInfo}>
            <View style={[styles.trackDot, { backgroundColor: track?.color || item.color }]} />
            <Text style={[styles.trackName, { color: dark ? "#e5e7eb" : "#374151" }]}>
              {item.track}
            </Text>
          </View>
          <Text style={[styles.eventTime, { color: dark ? "#94a3b8" : "#6b7280" }]}>
            {item.time}
          </Text>
        </View>

        {item.content ? (
          <Text style={[styles.eventContent, { color: dark ? "#f3f4f6" : "#111827" }]}>
            {item.content}
          </Text>
        ) : null}

        {item.image && (
          <TouchableOpacity 
            onPress={() => setPreviewImage(item.image)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.eventImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="expand" size={20} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.eventFooter}>
          <View style={styles.eventType}>
            {item.type === 'text' && (
              <Feather name="type" size={14} color={dark ? "#94a3b8" : "#6b7280"} />
            )}
            {item.type === 'image' && (
              <Feather name="image" size={14} color={dark ? "#94a3b8" : "#6b7280"} />
            )}
            {item.type === 'text_image' && (
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Feather name="type" size={14} color={dark ? "#94a3b8" : "#6b7280"} />
                <Feather name="image" size={14} color={dark ? "#94a3b8" : "#6b7280"} />
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedItemToDelete(item);
              setDeleteModalVisible(true);
            }}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={16} color={dark ? "#94a3b8" : "#9ca3af"} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateHeader = (dateStr) => {
    // Parse MM/DD/YYYY string manually
    const [month, day, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day); // JS months are 0-indexed

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Title
    let title = dateStr;
    if (date.toDateString() === today.toDateString()) {
      title = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      title = "Yesterday";
    }

    // Days ago
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysAgoText = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;

    const dayEvents = filteredItems.filter(item => item.date === dateStr);

    return (
      <View style={styles.dateHeader}>
        <View style={styles.dateHeaderContent}>
          <View style={styles.dateTitleRow}>
            <Text style={[styles.dateTitle, { color: dark ? "#f3f4f6" : "#111827" }]}>
              {title}
            </Text>
            <View style={[styles.dateBadge, { backgroundColor: dark ? "#374151" : "#e5e7eb" }]}>
              <Text style={[styles.dateBadgeText, { color: dark ? "#d1d5db" : "#4b5563" }]}>
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text style={[styles.fullDate, { color: dark ? "#94a3b8" : "#6b7280" }]}>
            {daysAgoText}
          </Text>
        </View>
        <View style={[styles.dateDivider, { backgroundColor: dark ? "#374151" : "#e5e7eb" }]} />
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView  style={{ flex: 1, backgroundColor: dark ? "#121212" : "#f8fafc" , paddingTop:40 }}>
       <View className="flex-col  w-full" >
        {/* SEARCH & FILTERS */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
            <Ionicons name="search-outline" size={20} color={dark ? "#94a3b8" : "#6b7280"} style={styles.searchIcon} />
            <TextInput
              placeholder="Search events..."
              placeholderTextColor={dark ? "#6b7280" : "#9ca3af"}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: dark ? "#f3f4f6" : "#111827" }]}
            />
            
                        <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.filterButton, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}
            >
              <Ionicons name="calendar-outline" size={18} color={dark ? "#94a3b8" : "#6b7280"} />
              <Text style={[styles.filterButtonText, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                {selectedDate ? selectedDate.toLocaleDateString() : "Any Date"}
              </Text>
            </TouchableOpacity>
            {(search || selectedDate || selectedTrack !== "All") && (
              <TouchableOpacity className="pl-2" onPress={clearFilters}>
                <Ionicons name="close-circle" size={20} color={dark ? "#94a3b8" : "#6b7280"} />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTER ROW */}
          <View style={styles.filterRow}>


            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trackFilterContainer}
            >
              <TouchableOpacity
                onPress={() => setSelectedTrack("All")}
                style={[
                  styles.trackFilter,
                  {
                    backgroundColor: selectedTrack === "All" 
                      ? "#7e00fc" 
                      : dark ? "#262626" : "#f1f5f9",
                  }
                ]}
              >
                <Text style={[
                  styles.trackFilterText,
                  { 
                    color: selectedTrack === "All" 
                      ? "#ffffff" 
                      : dark ? "#d1d5db" : "#4b5563"
                  }
                ]}>
                  All
                </Text>
                <View style={[
                  styles.trackFilterCount,
                  { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }
                ]}>
                  <Text style={[
                    styles.trackFilterCountText,
                    { color: dark ? "#94a3b8" : "#6b7280" }
                  ]}>
                    {items.length}
                  </Text>
                </View>
              </TouchableOpacity>

              {tracks.map((track) => {
                const trackItemsCount = items.filter(item => item.track === track.name).length;
                return (
                  <TouchableOpacity
                    key={track.name}
                    onPress={() => setSelectedTrack(track.name)}
                    style={[
                      styles.trackFilter,
                      {
                        backgroundColor: selectedTrack === track.name 
                          ? track.color 
                          : dark ? "#262626" : "#f1f5f9",
                      }
                    ]}
                  >
                    <View style={styles.trackFilterContent}>
                      <View style={[styles.trackDotSmall, { backgroundColor: track.color }]} />
                      <Text style={[
                        styles.trackFilterText,
                        { 
                          color: selectedTrack === track.name 
                            ? "#ffffff" 
                            : dark ? "#d1d5db" : "#4b5563"
                        }
                      ]}>
                        {track.name}
                      </Text>
                    </View>
                    {trackItemsCount > 0 && (
                      <View style={[
                        styles.trackFilterCount,
                        { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }
                      ]}>
                        <Text style={[
                          styles.trackFilterCountText,
                          { color: dark ? "#94a3b8" : "#6b7280" }
                        ]}>
                          {trackItemsCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* DATE PICKER */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            themeVariant={dark ? "dark" : "light"}
            onChange={(event, date) => {
              if (Platform.OS === "android") setShowDatePicker(false);
              if (date) {
                setSelectedDate(date);
                setShowDatePicker(false);
              }
            }}
          />
        )}
</View>
        {/* TIMELINE LIST */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name="calendar-outline" 
              size={64} 
              color={dark ? "#374151" : "#d1d5db"} 
            />
            <Text style={[styles.emptyStateTitle, { color: dark ? "#f3f4f6" : "#111827" }]}>
              No events yet
            </Text>
            <Text style={[styles.emptyStateText, { color: dark ? "#94a3b8" : "#6b7280" }]}>
              {search || selectedDate || selectedTrack !== "All" 
                ? "No events match your filters"
                : "Add your first event to get started"}
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={[styles.emptyStateButton, { backgroundColor: "#7e00fc" }]}
            >
              <Text style={styles.emptyStateButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={groupItemsByDate()}
            keyExtractor={([date]) => date}
            renderItem={({ item: [date, dateItems] }) => (
              <>
                {renderDateHeader(date)}
                {dateItems.map((event) => (
                  <View key={event.id} style={styles.eventItem}>
                    <View style={styles.timelineLine}>
                      <View style={[styles.timelineDot, { backgroundColor: event.color }]} />
                      <View style={[styles.timelineLineVertical, { backgroundColor: dark ? "#374151" : "#e5e7eb" }]} />
                    </View>
                    <View style={styles.eventContainer}>
                      {renderItem({ item: event })}
                    </View>
                  </View>
                ))}
              </>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* FLOATING ADD BUTTON */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            {
              backgroundColor: dark ? "#1a1a1a" : "#ffffff", // background adapts to theme
              borderWidth: 1,
              borderColor: "#7e00fc", // light blue outline
              flexDirection: "row",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 30, // rounded rectangle
              width: 140, // fixed width for rectangle
              height: 50, // fixed height for rectangle
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={24} color="#7e00fc" />
          <Text
            style={{
              color: "#7e00fc",
              fontWeight: "600",
              marginLeft: 8,
              fontSize: 16,
            }}
          >
            Add
          </Text>
        </TouchableOpacity>

        {/* ADD EVENT MODAL */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          statusBarTranslucent
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: dark ? "#f3f4f6" : "#111827" }]}>
                  New Event
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setModalVisible(false);
                    setNewText("");
                    setNewImage(null);
                  }}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color={dark ? "#94a3b8" : "#6b7280"} />
                </TouchableOpacity>
              </View>

              {/* TRACK SELECTOR */}
              <Text style={[styles.modalSectionTitle, { color: dark ? "#d1d5db" : "#4b5563" }]}>
                Select Track
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modalTrackContainer}
              >
                {tracks.map((track) => {
                  const isSelected = selectedTrack === track.name;
                  return (
                    <TouchableOpacity
                      key={track.name}
                      onPress={() => setSelectedTrack(track.name)}
                      style={[
                        styles.modalTrackButton,
                        {
                          backgroundColor: isSelected ? track.color : dark ? "#262626" : "#f1f5f9",
                          borderColor: isSelected ? track.color : dark ? "#374151" : "#e5e7eb",
                        }
                      ]}
                    >
                      <View style={[styles.modalTrackDot, { backgroundColor: track.color }]} />
                      <Text style={[
                        styles.modalTrackText,
                        { 
                          color: isSelected 
                            ? "#ffffff" 
                            : dark ? "#d1d5db" : "#4b5563" 
                        }
                      ]}>
                        {track.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* TEXT INPUT */}
              <Text style={[styles.modalSectionTitle, { color: dark ? "#d1d5db" : "#4b5563" }]}>
                Event Description
              </Text>
              <TextInput
                placeholder="What happened today?"
                placeholderTextColor={dark ? "#6b7280" : "#9ca3af"}
                value={newText}
                onChangeText={setNewText}
                multiline
                style={[
                  styles.modalTextInput,
                  { 
                    backgroundColor: dark ? "#262626" : "#f8fafc",
                    color: dark ? "#f3f4f6" : "#111827",
                    borderColor: dark ? "#374151" : "#e5e7eb",
                  }
                ]}
              />

              {/* IMAGE UPLOAD */}
              <Text style={[styles.modalSectionTitle, { color: dark ? "#d1d5db" : "#4b5563" }]}>
                Add Image (Optional)
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.imageUploadButton,
                  { 
                    backgroundColor: dark ? "#262626" : "#f8fafc",
                    borderColor: dark ? "#374151" : "#e5e7eb",
                  }
                ]}
              >
                <Ionicons name="camera-outline" size={24} color={dark ? "#94a3b8" : "#6b7280"} />
                <Text style={[styles.imageUploadText, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                  {newImage ? "Change Image" : "Select Image"}
                </Text>
              </TouchableOpacity>

              {newImage && (
                <Image
                  source={{ uri: newImage }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}

              {/* ACTION BUTTONS */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setNewText("");
                    setNewImage(null);
                  }}
                  style={[
                    styles.cancelButton,
                    { borderColor: dark ? "#374151" : "#e5e7eb" }
                  ]}
                >
                  <Text style={[styles.cancelButtonText, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={addEvent}
                  style={[styles.addButton, { backgroundColor: "#7e00fc" }]}
                >
                  <Ionicons name="checkmark" size={20} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Event</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* DELETE CONFIRMATION MODAL */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: dark ? "#1a1a1a" : "#ffffff" }]}>
              <View style={[styles.deleteIconContainer, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="trash-outline" size={32} color="#dc2626" />
              </View>
              <Text style={[styles.deleteTitle, { color: dark ? "#f3f4f6" : "#111827" }]}>
                Delete Event?
              </Text>
              <Text style={[styles.deleteText, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                This event will be permanently deleted.
              </Text>
              {selectedItemToDelete?.content && (
                <Text style={[styles.deletePreview, { color: dark ? "#d1d5db" : "#4b5563" }]}>
                  "{selectedItemToDelete.content.substring(0, 100)}"
                </Text>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setDeleteModalVisible(false)}
                  style={[
                    styles.cancelButton,
                    { borderColor: dark ? "#374151" : "#e5e7eb" }
                  ]}
                >
                  <Text style={[styles.cancelButtonText, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteItem}
                  style={[styles.deleteConfirmButton, { backgroundColor: "#dc2626" }]}
                >
                  <Text style={styles.deleteConfirmButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* IMAGE PREVIEW MODAL */}
        <Modal
          visible={!!previewImage}
          transparent
          animationType="fade"
        >
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity
              style={styles.imagePreviewClose}
              onPress={() => setPreviewImage(null)}
            >
              <Ionicons name="close" size={30} color="#ffffff" />
            </TouchableOpacity>
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            )}
            <Text style={styles.imagePreviewHint}>Pinch to zoom • Tap to close</Text>
          </View>
        </Modal>
      </SafeAreaView>
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical:6,
    borderRadius: 12,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  trackFilterContainer: {
    paddingBottom: 0,
  },
  trackFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  trackFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  trackFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trackFilterCount: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trackFilterCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  dateHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  dateHeaderContent: {
    marginBottom: 12,
  },
  dateTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fullDate: {
    fontSize: 14,
  },
  dateDivider: {
    height: 1,
  },
  eventItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLineVertical: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  eventContainer: {
    flex: 1,
    marginLeft: 12,
  },
  eventCard: {
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 13,
  },
  eventContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalTrackContainer: {
    marginBottom: 20,
  },
  modalTrackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 8,
  },
  modalTrackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modalTrackText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalTextInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imageUploadText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  datePickerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  modalActions: {
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
  addButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
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
    marginBottom: 12,
  },
  deletePreview: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
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
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imagePreview: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  imagePreviewHint: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});