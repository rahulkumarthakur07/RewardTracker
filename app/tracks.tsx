// screens/ManageTracksScreen.tsx
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '@/context/ThemeContext';
import { TracksContext, Track } from '@/context/TracksContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageTracksScreen() {
  const { dark } = useContext(ThemeContext);
  const { 
    tracks, 
    addTrack, 
    updateTrack, 
    removeTrack, 
    clearTracks 
  } = useContext(TracksContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [trackForm, setTrackForm] = useState({
    name: '',
    color: '#7e00fc',
  });
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadTrackStats();
  }, [tracks]);

  const loadTrackStats = async () => {
    try {
      const json = await AsyncStorage.getItem("USERITEMS");
      const items = json ? JSON.parse(json) : [];
      
      const trackStats: Record<string, number> = {};
      tracks.forEach(track => {
        trackStats[track.id] = items.filter((item: any) => item.track === track.name).length;
      });
      
      setStats(trackStats);
    } catch (error) {
      console.error('Error loading track stats:', error);
    }
  };

  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
    '#3b82f6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
    '#84CC16', '#F43F5E', '#0EA5E9', '#8B5CF6', '#EC4899',
  ];

// In ManageTracksScreen.tsx - Update handleAddTrack
const handleAddTrack = async () => {
  if (!trackForm.name.trim()) {
    Alert.alert('Error', 'Please enter a track name');
    return;
  }

  try {
    await addTrack({ 
      name: trackForm.name, 
      color: trackForm.color 
    });
    
    // Reload stats after adding
    await loadTrackStats();
    
    setTrackForm({ name: '', color: '#7e00fc' });
    setModalVisible(false);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

// In ManageTracksScreen.tsx - Update handleEditTrack
const handleEditTrack = async () => {
  if (!selectedTrack || !trackForm.name.trim()) {
    Alert.alert('Error', 'Please enter a track name');
    return;
  }

  try {
    await updateTrack(selectedTrack.id, {
      name: trackForm.name,
      color: trackForm.color,
    });
    
    // IMPORTANT: Reload stats after updating track name
    await loadTrackStats();
    
    setTrackForm({ name: '', color: '#7e00fc' });
    setEditModalVisible(false);
    setSelectedTrack(null);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

const handleDeleteTrack = async () => {
  if (!selectedTrack) return;
  
  try {
    await removeTrack(selectedTrack.id);
    
    // Reload stats after deleting
    await loadTrackStats();
    
    setDeleteModalVisible(false);
    setSelectedTrack(null);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

  const openEditModal = (track: Track) => {
    setSelectedTrack(track);
    setTrackForm({ name: track.name, color: track.color });
    setEditModalVisible(true);
  };

  const openDeleteModal = (track: Track) => {
    setSelectedTrack(track);
    setDeleteModalVisible(true);
  };

  const clearAllTracks = () => {
    Alert.alert(
      'Clear All Tracks',
      'This will delete all your tracks and their associated entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearTracks();
              Alert.alert('Success', 'All tracks have been cleared');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        },
      ]
    );
  };

  const renderTrackItem = ({ item }: { item: Track }) => (
    <View style={[styles.trackCard, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
      <View style={styles.trackInfo}>
        <View style={[styles.trackColor, { backgroundColor: item.color }]} />
        <View style={styles.trackDetails}>
          <Text style={[styles.trackName, { color: dark ? '#f3f4f6' : '#111827' }]}>
            {item.name}
          </Text>
          <Text style={[styles.trackStats, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            {stats[item.id] || 0} entries
          </Text>
          <Text style={[styles.trackDate, { color: dark ? '#6b7280' : '#9ca3af' }]}>
            Updated: {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.trackActions}>
        <TouchableOpacity
          onPress={() => openEditModal(item)}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="create-outline" size={20} color={dark ? '#94a3b8' : '#6b7280'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openDeleteModal(item)}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? '#121212' : '#f8fafc' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
              Manage Tracks
            </Text>
            <Text style={[styles.headerSubtitle, { color: dark ? '#94a3b8' : '#6b7280' }]}>
              {tracks.length} track{tracks.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* ACTIONS */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={[styles.addButton, { backgroundColor: '#7e00fc' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>New Track</Text>
        </TouchableOpacity>
        
        {tracks.length > 0 && (
          <TouchableOpacity
            onPress={clearAllTracks}
            style={[styles.clearButton, { borderColor: '#ef4444' }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.clearButtonText, { color: '#ef4444' }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TRACKS LIST */}
      {tracks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color={dark ? '#374151' : '#d1d5db'} />
          <Text style={[styles.emptyTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
            No Tracks Yet
          </Text>
          <Text style={[styles.emptyText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
            Create your first track to start organizing your timeline
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ADD TRACK MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
                Create New Track
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={dark ? '#94a3b8' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Track name
            </Text>
            <TextInput
              value={trackForm.name}
              onChangeText={(text) => setTrackForm({ ...trackForm, name: text })}
              placeholder="Enter track name"
              placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
              style={[
                styles.modalInput,
                {
                  backgroundColor: dark ? '#262626' : '#f8fafc',
                  color: dark ? '#f3f4f6' : '#111827',
                  borderColor: dark ? '#374151' : '#e5e7eb',
                }
              ]}
              autoFocus
              maxLength={30}
            />

            <Text style={[styles.modalSubtitle, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Select Color
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.colorSelector}
            >
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setTrackForm({ ...trackForm, color })}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    trackForm.color === color && styles.colorOptionSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  {trackForm.color === color && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalCancel, 
                  { 
                    borderColor: dark ? '#374151' : '#e5e7eb',
                    backgroundColor: dark ? '#262626' : '#f8fafc',
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddTrack}
                style={[styles.modalSave, { backgroundColor: '#7e00fc' }]}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT TRACK MODAL */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
                Edit Track
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditModalVisible(false);
                  setSelectedTrack(null);
                  setTrackForm({ name: '', color: '#7e00fc' });
                }}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={dark ? '#94a3b8' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Track name
            </Text>
            <TextInput
              value={trackForm.name}
              onChangeText={(text) => setTrackForm({ ...trackForm, name: text })}
              placeholder="Enter track name"
              placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
              style={[
                styles.modalInput,
                {
                  backgroundColor: dark ? '#262626' : '#f8fafc',
                  color: dark ? '#f3f4f6' : '#111827',
                  borderColor: dark ? '#374151' : '#e5e7eb',
                }
              ]}
              autoFocus
              maxLength={30}
            />

            <Text style={[styles.modalSubtitle, { color: dark ? '#d1d5db' : '#4b5563' }]}>
              Select Color
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.colorSelector}
            >
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setTrackForm({ ...trackForm, color })}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    trackForm.color === color && styles.colorOptionSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  {trackForm.color === color && (
                    <Ionicons name="checkmark" size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setEditModalVisible(false);
                  setSelectedTrack(null);
                  setTrackForm({ name: '', color: '#7e00fc' });
                }}
                style={[
                  styles.modalCancel, 
                  { 
                    borderColor: dark ? '#374151' : '#e5e7eb',
                    backgroundColor: dark ? '#262626' : '#f8fafc',
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditTrack}
                style={[styles.modalSave, { backgroundColor: '#7e00fc' }]}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
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
        statusBarTranslucent
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: dark ? '#1a1a1a' : '#ffffff' }]}>
            <View style={[styles.deleteIcon, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="warning-outline" size={32} color="#dc2626" />
            </View>
            <Text style={[styles.deleteTitle, { color: dark ? '#f3f4f6' : '#111827' }]}>
              Delete "{selectedTrack?.name}"?
            </Text>
            <Text style={[styles.deleteText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
              This will delete the track and {stats[selectedTrack?.id || ''] || 0} associated entries. This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={[
                  styles.modalCancel, 
                  { 
                    borderColor: dark ? '#374151' : '#e5e7eb',
                    backgroundColor: dark ? '#262626' : '#f8fafc',
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelText, { color: dark ? '#94a3b8' : '#6b7280' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteTrack}
                style={[styles.deleteButton, { backgroundColor: '#dc2626' }]}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
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
  clearButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  trackCard: {
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
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackStats: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackDate: {
    fontSize: 12,
  },
  trackActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
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
    maxHeight: '80%',
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
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 24,
  },
  colorSelector: {
    marginBottom: 24,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSave: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteIcon: {
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
  deleteButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});