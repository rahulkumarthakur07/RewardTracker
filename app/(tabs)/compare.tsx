// ComparisonScreen.tsx
import { ThemeContext } from "@/context/ThemeContext";
import { useTimeline } from "@/context/TimelineContext"; // Add this import
import { TracksContext } from "@/context/TracksContext";
import { Feather, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ComparisonScreen() {
  const { dark } = useContext(ThemeContext);
  const { tracks } = useContext(TracksContext);
  const { items } = useTimeline(); // Use timeline context

  const [selectedTrack, setSelectedTrack] = useState<string | null>("All");
  const [modalVisibleLeft, setModalVisibleLeft] = useState(false);
  const [modalVisibleRight, setModalVisibleRight] = useState(false);
  const [selectedLeftItem, setSelectedLeftItem] = useState<any>(null);
  const [selectedRightItem, setSelectedRightItem] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [comparisonView, setComparisonView] = useState("sideBySide"); // "sideBySide", "splitView", "details"
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const modalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Animation for compare modal
  useEffect(() => {
    if (compareModalVisible) {
      Animated.spring(modalTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(modalTranslateY, {
        toValue: SCREEN_HEIGHT,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, [compareModalVisible]);

  // Filter items for selected track
  const trackItems = items.filter(
    (item) => selectedTrack === "All" || item.track === selectedTrack
  );

  const handleCompare = () => {
    if (selectedLeftItem && selectedRightItem) {
      setCompareModalVisible(true);
    }
  };

  const closeCompareModal = () => {
    Animated.spring(modalTranslateY, {
      toValue: SCREEN_HEIGHT,
      tension: 60,
      friction: 12,
      useNativeDriver: true,
    }).start(() => {
      setCompareModalVisible(false);
    });
  };

  const renderComparisonCard = (item, side) => {
    const isSelected = side === 'left' ? selectedLeftItem : selectedRightItem;
    const setSelected = side === 'left' ? setSelectedLeftItem : setSelectedRightItem;
    
    if (!isSelected) {
      return (
        <TouchableOpacity
          onPress={() => side === 'left' ? setModalVisibleLeft(true) : setModalVisibleRight(true)}
          style={[
            styles.emptyCard,
            {
              backgroundColor: dark ? "#2a2a2a" : "#f0f0f0",
              borderColor: dark ? "#444" : "#ddd",
            }
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.emptyCardContent}>
            <MaterialIcons 
              name="compare-arrows" 
              size={48} 
              color={dark ? "#666" : "#aaa"} 
            />
            <Text style={[styles.emptyCardText, { color: dark ? "#888" : "#666" }]}>
              Select an item to compare
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                side === 'left' ? setModalVisibleLeft(true) : setModalVisibleRight(true);
              }}
              style={[styles.addButtonSmall, { backgroundColor: side === 'left' ? '#4CAF50' : '#2196F3' }]}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <Animated.View style={[styles.cardContainer, { shadowColor: dark ? "#000" : "#888" }]}>
        <TouchableOpacity
          onPress={() => setSelected(null)}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={24} color={dark ? "#ff6b6b" : "#ff4444"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => isSelected.image && setPreviewImage(isSelected.image)}
          style={styles.cardContent}
        >
          {isSelected.image ? (
            <Image
              source={{ uri: isSelected.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.noImageContainer, { backgroundColor: dark ? "#2a2a2a" : "#f5f5f5" }]}>
              <MaterialIcons 
                name="description" 
                size={40} 
                color={dark ? "#666" : "#aaa"} 
              />
              <Text 
                style={[styles.noImageText, { color: dark ? "#bbb" : "#666" }]}
                numberOfLines={3}
              >
                {isSelected.content || "No description"}
              </Text>
            </View>
          )}
          
          <View style={[styles.cardFooter, { backgroundColor: dark ? "#1a1a1a" : "#fafafa" }]}>
            <View style={styles.cardInfo}>
              <Text 
                style={[styles.cardContentText, { color: dark ? "#fff" : "#333" }]}
                numberOfLines={2}
              >
                {isSelected.content || "No description"}
              </Text>
              <View style={styles.cardMeta}>
                <Text style={[styles.cardDate, { color: dark ? "#aaa" : "#666" }]}>
                  {isSelected.date} • {isSelected.time}
                </Text>
                {isSelected.track && (
                  <View style={[styles.trackBadge, { backgroundColor: tracks.find(t => t.name === isSelected.track)?.color || "#2196f3" }]}>
                    <Text style={styles.trackBadgeText}>{isSelected.track}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItemModal = ({ item, onSelect, side }) => (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      style={[
        styles.modalItem,
        {
          backgroundColor: dark ? "#2a2a2a" : "#fff",
          borderColor: dark ? "#444" : "#e0e0e0",
        }
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.modalItemContent}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.modalImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.modalNoImage, { backgroundColor: dark ? "#333" : "#f0f0f0" }]}>
            <MaterialIcons 
              name="description" 
              size={30} 
              color={dark ? "#666" : "#aaa"} 
            />
          </View>
        )}
        
        <View style={styles.modalTextContainer}>
          <Text 
            style={[styles.modalContentText, { color: dark ? "#e0e0e0" : "#333" }]}
            numberOfLines={2}
          >
            {item.content || "No description"}
          </Text>
          <View style={styles.modalMeta}>
            <Text style={[styles.modalDate, { color: dark ? "#aaa" : "#666" }]}>
              {item.date} • {item.time}
            </Text>
            {item.track && (
              <View style={[styles.modalTrackBadge, { 
                backgroundColor: tracks.find(t => t.name === item.track)?.color || "#2196f3" 
              }]}>
                <Text style={styles.modalTrackBadgeText}>{item.track}</Text>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => onSelect(item)}
          style={[styles.selectButton, { backgroundColor: side === 'left' ? '#4CAF50' : '#2196F3' }]}
          activeOpacity={0.7}
        >
          <Text style={styles.selectButtonText}>Select</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderComparisonView = () => {
    if (!selectedLeftItem || !selectedRightItem) return null;

    const leftTrack = tracks.find(t => t.name === selectedLeftItem.track);
    const rightTrack = tracks.find(t => t.name === selectedRightItem.track);

    switch (comparisonView) {
      case "sideBySide":
        return (
          <ScrollView style={styles.comparisonScroll}>
            <View style={styles.comparisonHeader}>
              <View style={styles.comparisonSide}>
                <View style={[styles.comparisonTrack, { backgroundColor: leftTrack?.color || '#4CAF50' }]}>
                  <Text style={styles.comparisonTrackText}>Left: {selectedLeftItem.track}</Text>
                </View>
              </View>
              <View style={styles.comparisonDivider} />
              <View style={styles.comparisonSide}>
                <View style={[styles.comparisonTrack, { backgroundColor: '#FF9800' }]}>
                  <Text style={styles.comparisonTrackText}>Right: {selectedRightItem.track}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sideBySideContainer}>
              {/* Left Item */}
              <View style={styles.sideItem}>
                <Text style={[styles.comparisonDate, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                  {selectedLeftItem.date} • {selectedLeftItem.time}
                </Text>
                {selectedLeftItem.image ? (
                  <Image
                    source={{ uri: selectedLeftItem.image }}
                    style={styles.comparisonImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.comparisonNoImage, { backgroundColor: dark ? "#2a2a2a" : "#f5f5f5" }]}>
                    <MaterialIcons name="description" size={48} color={dark ? "#666" : "#aaa"} />
                  </View>
                )}
                <Text style={[styles.comparisonContent, { color: dark ? "#fff" : "#333" }]}>
                  {selectedLeftItem.content || "No description"}
                </Text>
              </View>

              {/* Vertical Divider */}
              <View style={[styles.verticalDivider, { backgroundColor: dark ? "#444" : "#ddd" }]} />

              {/* Right Item */}
              <View style={styles.sideItem}>
                <Text style={[styles.comparisonDate, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                  {selectedRightItem.date} • {selectedRightItem.time}
                </Text>
                {selectedRightItem.image ? (
                  <Image
                    source={{ uri: selectedRightItem.image }}
                    style={styles.comparisonImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.comparisonNoImage, { backgroundColor: dark ? "#2a2a2a" : "#f5f5f5" }]}>
                    <MaterialIcons name="description" size={48} color={dark ? "#666" : "#aaa"} />
                  </View>
                )}
                <Text style={[styles.comparisonContent, { color: dark ? "#fff" : "#333" }]}>
                  {selectedRightItem.content || "No description"}
                </Text>
              </View>
            </View>
          </ScrollView>
        );

case "splitView":
  return (
    <View style={styles.splitContainer}>
            {/* Full Screen Button */}
      <TouchableOpacity
        style={styles.fullScreenButton}
        onPress={() => 
          router.push({
            pathname: '/splitscreenView',
            params: {
              img1: selectedLeftItem.image,
              img2: selectedRightItem.image,
            },
          })
        }
      >
        <Text style={styles.fullScreenButtonText}>Full Screen</Text>
      </TouchableOpacity>
      <Image
        source={{ uri: selectedLeftItem.image || 'https://via.placeholder.com/300' }}
        style={styles.splitImage}
        resizeMode="cover"
      />
      
      <View style={[styles.splitDivider, { backgroundColor: "#FF9800" }]}>
        <Text style={styles.splitDividerText}>VS</Text>
      </View>
      
      <Image
        source={{ uri: selectedRightItem.image || 'https://via.placeholder.com/300' }}
        style={styles.splitImage}
        resizeMode="cover"
      />


    </View>
  );

      case "details":
        return (
          <ScrollView style={styles.detailsContainer}>
            <View style={styles.detailsGrid}>
              {/* Left Details */}
              <View style={[styles.detailsCard, { backgroundColor: dark ? "#1a1a1a" : "#fff" }]}>
                <View style={[styles.detailsHeader, { backgroundColor: leftTrack?.color || '#4CAF50' }]}>
                  <Text style={styles.detailsHeaderText}>Left Item Details</Text>
                </View>
                <View style={styles.detailsContent}>
                  <DetailRow label="Track" value={selectedLeftItem.track} color={leftTrack?.color} />
                  <DetailRow label="Date" value={selectedLeftItem.date} />
                  <DetailRow label="Time" value={selectedLeftItem.time} />
                  <DetailRow label="Type" value={selectedLeftItem.type} />
                  <View style={styles.detailsSection}>
                    <Text style={[styles.detailsLabel, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                      Content
                    </Text>
                    <Text style={[styles.detailsValue, { color: dark ? "#fff" : "#333" }]}>
                      {selectedLeftItem.content || "No description"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Details */}
              <View style={[styles.detailsCard, { backgroundColor: dark ? "#1a1a1a" : "#fff" }]}>
                <View style={[styles.detailsHeader, { backgroundColor: rightTrack?.color || '#2196F3' }]}>
                  <Text style={styles.detailsHeaderText}>Right Item Details</Text>
                </View>
                <View style={styles.detailsContent}>
                  <DetailRow label="Track" value={selectedRightItem.track} color={rightTrack?.color} />
                  <DetailRow label="Date" value={selectedRightItem.date} />
                  <DetailRow label="Time" value={selectedRightItem.time} />
                  <DetailRow label="Type" value={selectedRightItem.type} />
                  <View style={styles.detailsSection}>
                    <Text style={[styles.detailsLabel, { color: dark ? "#94a3b8" : "#6b7280" }]}>
                      Content
                    </Text>
                    <Text style={[styles.detailsValue, { color: dark ? "#fff" : "#333" }]}>
                      {selectedRightItem.content || "No description"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  const DetailRow = ({ label, value, color }) => (
    <View style={styles.detailRow}>
      <Text style={[styles.detailsLabel, { color: dark ? "#94a3b8" : "#6b7280" }]}>
        {label}
      </Text>
      <Text style={[
        styles.detailsValue, 
        { color: color || (dark ? "#fff" : "#333") }
      ]}>
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: dark ? "#121212" : "#f8f9fa" }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: dark ? "#fff" : "#333" }]}>
            Compare Items
          </Text>
          <Text style={[styles.headerSubtitle, { color: dark ? "#aaa" : "#666" }]}>
            Select two items to compare
          </Text>
        </View>
        {(selectedLeftItem && selectedRightItem) && (
          <TouchableOpacity
            onPress={handleCompare}
            style={[styles.compareNowButton, { backgroundColor: "#FF9800" }]}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="balance-scale" size={16} color="#fff" />
            <Text style={styles.compareNowButtonText}>Compare Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TRACK FILTER */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            onPress={() => setSelectedTrack("All")}
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedTrack === "All" 
                  ? "#2196f3" 
                  : dark ? "#2a2a2a" : "#fff",
                borderColor: selectedTrack === "All" 
                  ? "#2196f3" 
                  : dark ? "#444" : "#ddd",
              }
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterButtonText,
              { 
                color: selectedTrack === "All" 
                  ? "#fff" 
                  : dark ? "#fff" : "#333" 
              }
            ]}>
              All
            </Text>
            <View style={[
              styles.filterCount,
              { backgroundColor: dark ? "#1a1a1a" : "#f0f0f0" }
            ]}>
              <Text style={[
                styles.filterCountText,
                { color: dark ? "#aaa" : "#666" }
              ]}>
                {items.length}
              </Text>
            </View>
          </TouchableOpacity>

          {tracks.map((t) => {
            const count = items.filter(item => item.track === t.name).length;
            return (
              <TouchableOpacity
                key={t.name}
                onPress={() => setSelectedTrack(t.name)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedTrack === t.name 
                      ? t.color 
                      : dark ? "#2a2a2a" : "#fff",
                    borderColor: selectedTrack === t.name 
                      ? t.color 
                      : dark ? "#444" : "#ddd",
                  }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterButtonText,
                  { 
                    color: selectedTrack === t.name 
                      ? "#fff" 
                      : dark ? "#fff" : "#333",
                    fontWeight: selectedTrack === t.name ? '600' : '400'
                  }
                ]}>
                  {t.name}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.filterCount,
                    { backgroundColor: dark ? "#1a1a1a" : "#f0f0f0" }
                  ]}>
                    <Text style={[
                      styles.filterCountText,
                      { color: dark ? "#aaa" : "#666" }
                    ]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* COMPARISON CONTAINER */}
      <View style={styles.comparisonContainer}>
        {/* LEFT COLUMN */}
        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <View style={[styles.columnIndicator, { backgroundColor: '#4CAF50' }]} />
            <Text style={[styles.columnTitle, { color: dark ? "#fff" : "#333" }]}>
              Left Side
            </Text>
          </View>
          {renderComparisonCard(selectedLeftItem, 'left')}
          
          <TouchableOpacity
            onPress={() => setModalVisibleLeft(true)}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={[styles.addButtonText, { color: '#4CAF50' }]}>
              {selectedLeftItem ? 'Change Item' : 'Add Item'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* COMPARISON DIVIDER */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: dark ? "#444" : "#ddd" }]} />
          <View style={[styles.vsBadge, { backgroundColor: dark ? "#333" : "#fff" }]}>
            <Text style={[styles.vsText, { color: dark ? "#fff" : "#333" }]}>VS</Text>
          </View>
          <View style={[styles.dividerLine, { backgroundColor: dark ? "#444" : "#ddd" }]} />
        </View>

        {/* RIGHT COLUMN */}
        <View style={styles.column}>
          <View style={styles.columnHeader}>
            <View style={[styles.columnIndicator, { backgroundColor: '#2196F3' }]} />
            <Text style={[styles.columnTitle, { color: dark ? "#fff" : "#333" }]}>
              Right Side
            </Text>
          </View>
          {renderComparisonCard(selectedRightItem, 'right')}
          
          <TouchableOpacity
            onPress={() => setModalVisibleRight(true)}
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color="#2196F3" />
            <Text style={[styles.addButtonText, { color: '#2196F3' }]}>
              {selectedRightItem ? 'Change Item' : 'Add Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* COMPARISON ACTIONS */}
      {(selectedLeftItem || selectedRightItem) && (
        <View style={[styles.actionsContainer, { backgroundColor: dark ? "#1a1a1a" : "#fff" }]}>
          <TouchableOpacity
            style={[styles.compareButton, { 
              backgroundColor: (selectedLeftItem && selectedRightItem) ? '#FF9800' : '#ccc',
              opacity: (selectedLeftItem && selectedRightItem) ? 1 : 0.5
            }]}
            disabled={!(selectedLeftItem && selectedRightItem)}
            onPress={handleCompare}
            activeOpacity={0.7}
          >
            <MaterialIcons name="compare" size={20} color="#fff" />
            <Text style={styles.compareButtonText}>
              Compare Now
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setSelectedLeftItem(null);
              setSelectedRightItem(null);
            }}
            style={[styles.clearAllButton, { borderColor: dark ? "#444" : "#ddd" }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.clearAllText, { color: dark ? "#ff6b6b" : "#ff4444" }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODALS */}
      <Modal
        visible={modalVisibleLeft}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: "#000000cc" }]}>
          <View style={[styles.modalContent, { backgroundColor: dark ? "#1a1a1a" : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dark ? "#fff" : "#333" }]}>
                Select Left Item ({trackItems.length})
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisibleLeft(false)}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={dark ? "#aaa" : "#666"} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={trackItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderItemModal({ 
                item, 
                side: 'left',
                onSelect: (i) => { 
                  setSelectedLeftItem(i); 
                  setModalVisibleLeft(false); 
                } 
              })}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="images-outline" size={48} color={dark ? "#444" : "#ccc"} />
                  <Text style={[styles.emptyListText, { color: dark ? "#666" : "#999" }]}>
                    No items found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisibleRight}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={[styles.modalOverlay, { backgroundColor: "#000000cc" }]}>
          <View style={[styles.modalContent, { backgroundColor: dark ? "#1a1a1a" : "#fff" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: dark ? "#fff" : "#333" }]}>
                Select Right Item ({trackItems.length})
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisibleRight(false)}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={dark ? "#aaa" : "#666"} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={trackItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderItemModal({ 
                item, 
                side: 'right',
                onSelect: (i) => { 
                  setSelectedRightItem(i); 
                  setModalVisibleRight(false); 
                } 
              })}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="images-outline" size={48} color={dark ? "#444" : "#ccc"} />
                  <Text style={[styles.emptyListText, { color: dark ? "#666" : "#999" }]}>
                    No items found
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* COMPARE MODAL */}
      <Modal
        visible={compareModalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.compareModalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={closeCompareModal}
            activeOpacity={1}
          />
          <Animated.View 
            style={[
              styles.compareModalContent,
              { 
                backgroundColor: dark ? "#1a1a1a" : "#fff",
                transform: [{ translateY: modalTranslateY }]
              }
            ]}
          >
            <View style={styles.compareModalHeader}>
              <View style={styles.modalDragIndicator} />
              <Text style={[styles.compareModalTitle, { color: dark ? "#fff" : "#333" }]}>
                Comparison View
              </Text>
              <TouchableOpacity
                onPress={closeCompareModal}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={dark ? "#aaa" : "#666"} />
              </TouchableOpacity>
            </View>

            {/* VIEW MODE SELECTOR */}
            <View style={styles.viewModeSelector}>
              <TouchableOpacity
                onPress={() => setComparisonView("sideBySide")}
                style={[
                  styles.viewModeButton,
                  { 
                    backgroundColor: comparisonView === "sideBySide" 
                      ? "#3b82f6" 
                      : dark ? "#2a2a2a" : "#f1f5f9" 
                  }
                ]}
                activeOpacity={0.7}
              >
                <Feather name="layout" size={16} color={comparisonView === "sideBySide" ? "#fff" : (dark ? "#94a3b8" : "#6b7280")} />
                <Text style={[
                  styles.viewModeText,
                  { 
                    color: comparisonView === "sideBySide" 
                      ? "#fff" 
                      : dark ? "#94a3b8" : "#6b7280" 
                  }
                ]}>
                  Side by Side
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setComparisonView("splitView")}
                style={[
                  styles.viewModeButton,
                  { 
                    backgroundColor: comparisonView === "splitView" 
                      ? "#3b82f6" 
                      : dark ? "#2a2a2a" : "#f1f5f9" 
                  }
                ]}
                activeOpacity={0.7}
              >
                <Feather name="image" size={16} color={comparisonView === "splitView" ? "#fff" : (dark ? "#94a3b8" : "#6b7280")} />
                <Text style={[
                  styles.viewModeText,
                  { 
                    color: comparisonView === "splitView" 
                      ? "#fff" 
                      : dark ? "#94a3b8" : "#6b7280" 
                  }
                ]}>
                  Split View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setComparisonView("details")}
                style={[
                  styles.viewModeButton,
                  { 
                    backgroundColor: comparisonView === "details" 
                      ? "#3b82f6" 
                      : dark ? "#2a2a2a" : "#f1f5f9" 
                  }
                ]}
                activeOpacity={0.7}
              >
                <Feather name="list" size={16} color={comparisonView === "details" ? "#fff" : (dark ? "#94a3b8" : "#6b7280")} />
                <Text style={[
                  styles.viewModeText,
                  { 
                    color: comparisonView === "details" 
                      ? "#fff" 
                      : dark ? "#94a3b8" : "#6b7280" 
                  }
                ]}>
                  Details
                </Text>
              </TouchableOpacity>
            </View>

            {/* COMPARISON CONTENT */}
            {renderComparisonView()}
          </Animated.View>
        </View>
      </Modal>

      {/* IMAGE PREVIEW MODAL */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={() => setPreviewImage(null)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.previewHint}>Pinch to zoom • Tap to close</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:30
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  compareNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  compareNowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterCount: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  comparisonContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  
  fullScreenButton: {
    position: 'absolute',
    top: 10,
    right:10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FF9800',
    borderRadius: 5,
  },
  fullScreenButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  columnIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyCardText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  addButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  cardContent: {
    width: '100%',
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.8,
  },
  noImageContainer: {
    width: '100%',
    aspectRatio: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noImageText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  cardFooter: {
    padding: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardContentText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    flex: 1,
  },
  trackBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  trackBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  dividerContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  dividerLine: {
    flex: 1,
    width: 1,
  },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    marginVertical: 10,
  },
  vsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  compareButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  compareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearAllButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
  },
  clearAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalItem: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  modalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  modalNoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  modalContentText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDate: {
    fontSize: 12,
    flex: 1,
  },
  modalTrackBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalTrackBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyListText: {
    fontSize: 16,
    marginTop: 12,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: '#000000ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  previewImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
  },
  previewHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 20,
    position: 'absolute',
    bottom: 40,
  },
  // New comparison modal styles
  compareModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  compareModalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  compareModalHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 16,
  },
  compareModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  viewModeSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  comparisonScroll: {
    flex: 1,
    padding: 20,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  comparisonSide: {
    alignItems: 'center',

  },
  comparisonTrack: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comparisonTrackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  
  },
  comparisonDivider: {
    width: 40,
    alignItems: 'center',
  },
  sideBySideContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 20,
  },
  sideItem: {
    flex: 1,
  },
  comparisonDate: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  comparisonNoImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonContent: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    paddingVertical:60
  },
  splitImage: {
    flex: 1,
    height: 300,
    borderRadius: 12,
  },
  splitDivider: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  splitDividerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  detailsGrid: {
    gap: 20,
  },
  detailsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailsHeader: {
    padding: 16,
  },
  detailsHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    marginTop: 16,
  },
});
