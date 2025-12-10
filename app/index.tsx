import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function LoaderScreen() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const checkOTAAndNavigate = async () => {
    try {
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          setUpdateAvailable(true); // Show custom alert
          return;
        }
      }

      const userdataAvailable = await AsyncStorage.getItem("userdataAvailable");
      if (userdataAvailable === "true") router.replace("/(tabs)");
      else router.replace("/userdata");
    } catch (error) {
      console.error("LoaderScreen OTA/Navigation error:", error);
      const userdataAvailable = await AsyncStorage.getItem("userdataAvailable");
      if (userdataAvailable === "true") router.replace("/(tabs)");
      else router.replace("/userdata");
    }
  };

  // Fade in animation for modal
  useEffect(() => {
    if (updateAvailable) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, [updateAvailable]);

  const handleRestart = () => {
    Updates.reloadAsync();
  };

  const handleLater = () => {
    setUpdateAvailable(false);
    checkOTAAndNavigate(); // continue navigation
  };

  useEffect(() => {
    checkOTAAndNavigate();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Custom Alert Modal */}
      <Modal transparent visible={updateAvailable} animationType="fade">
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <Text style={styles.modalTitle}>Update Ready</Text>
            <Text style={styles.modalMessage}>
              A new update is available. Restart the app to apply it.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
                <Text style={styles.laterText}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
                <Text style={styles.restartText}>Restart Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#444",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  laterButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  laterText: {
    color: "#1F2937",
    fontWeight: "600",
    fontSize: 16,
  },
  restartButton: {
    backgroundColor: "#7e00fc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  restartText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
