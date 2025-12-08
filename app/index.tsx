import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as Updates from "expo-updates";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  View,
  Easing,
  StatusBar,
  Dimensions,
  Platform,
  Alert
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // -------------------------
  // Animation refs
  // -------------------------
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const scaleLogo = useRef(new Animated.Value(0.8)).current;
  const rotateLogo = useRef(new Animated.Value(0)).current;

  const fadeTitle = useRef(new Animated.Value(0)).current;
  const scaleTitle = useRef(new Animated.Value(0.9)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;

  const gradientAnim = useRef(new Animated.Value(0)).current;
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;

  const createParticleAnimation = (particleRef, delay = 0) => {
    return Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(particleRef, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(particleRef, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
      ),
    ]);
  };

  // -------------------------
  // OTA Update + Navigation
  // -------------------------
  const checkOTAAndNavigate = async () => {
    try {
      // Check OTA updates in production only
      if (!__DEV__) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Update Ready",
            "Restart app to apply the update?",
            [
              { text: "Later", style: "cancel" },
              { text: "Restart Now", onPress: () => Updates.reloadAsync() },
            ]
          );
          return; // stop further navigation until update applied
        }
      }

      // Continue navigation logic
      const userdataAvailable = await AsyncStorage.getItem("userdataAvailable");
      const delay = 2000; // minimum splash display
      setTimeout(() => {
        if (userdataAvailable === "true") {
          router.replace("/(tabs)");
        } else {
          router.replace("/userdata");
        }
      }, delay);
    } catch (error) {
      console.error("SplashScreen OTA/Navigation error:", error);
      // fallback navigation
      setTimeout(async () => {
        const userdataAvailable = await AsyncStorage.getItem("userdataAvailable");
        if (userdataAvailable === "true") {
          router.replace("/(tabs)");
        } else {
          router.replace("/userdata");
        }
      }, 2000);
    }
  };

  // -------------------------
  // useEffect for animations + OTA
  // -------------------------
  useEffect(() => {
    // Gradient animation
    Animated.timing(gradientAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
      easing: Easing.inOut(Easing.quad),
    }).start();

    // Logo animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeLogo, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)),
        }),
        Animated.spring(scaleLogo, {
          toValue: 1.1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scaleLogo, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateLogo, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
            Animated.timing(rotateLogo, {
              toValue: 0,
              duration: 4000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.quad),
            }),
          ])
        ),
      ]),
    ]).start();

    // Text animations
    Animated.stagger(400, [
      Animated.parallel([
        Animated.timing(fadeTitle, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
        Animated.spring(scaleTitle, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(fadeSubtitle, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();

    // Start particle animations
    createParticleAnimation(particleAnim1, 300).start();
    createParticleAnimation(particleAnim2, 600).start();
    createParticleAnimation(particleAnim3, 900).start();

    // Run OTA + navigation after animations start
    const timeout = setTimeout(checkOTAAndNavigate, 1500);

    return () => {
      clearTimeout(timeout);
      fadeLogo.stopAnimation();
      scaleLogo.stopAnimation();
      rotateLogo.stopAnimation();
      fadeTitle.stopAnimation();
      scaleTitle.stopAnimation();
      fadeSubtitle.stopAnimation();
    };
  }, []);

  // Gradient & rotation interpolation
  const gradientColor = gradientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0)", "rgba(249,250,251,1)"],
  });
  const rotateInterpolate = rotateLogo.interpolate({
    inputRange: [0, 1],
    outputRange: ["-3deg", "3deg"],
  });

  // -------------------------
  // Render
  // -------------------------
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View style={[styles.background, { backgroundColor: gradientColor }]} />

      {/* Particles */}
      <Animated.View
        style={[
          styles.particle,
          styles.particle1,
          {
            opacity: particleAnim1,
            transform: [
              {
                translateY: particleAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle2,
          {
            opacity: particleAnim2,
            transform: [
              {
                translateY: particleAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -80],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.particle,
          styles.particle3,
          {
            opacity: particleAnim3,
            transform: [
              {
                translateY: particleAnim3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -60],
                }),
              },
            ],
          },
        ]}
      />

      <View style={styles.content}>
        <Animated.Image
          source={require("@/assets/images/icon.png")}
          style={[
            styles.logo,
            { opacity: fadeLogo, transform: [{ scale: scaleLogo }, { rotate: rotateInterpolate }] },
          ]}
        />

        <View style={styles.textContainer}>
          <Animated.Text style={[styles.title, { opacity: fadeTitle, transform: [{ scale: scaleTitle }] }]}>
            Snapshot Growth
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: fadeSubtitle }]}>
            Watch your every progress
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:
    { flex: 1, backgroundColor: "#ffffff", justifyContent: "center", alignItems: "center" },
  background:
  {
    position: "absolute",
    width: "100%", height: "100%"
  },
  content:
    { alignItems: "center", paddingHorizontal: 40 },
  logo: {
    width: 140,
    height: 140,
    resizeMode: "contain",
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  textContainer: { alignItems: "center", marginTop: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#1a1a1a", textAlign: "center", letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: "400", color: "#666", textAlign: "center", letterSpacing: 0.3, lineHeight: 22 },
  particle: { position: "absolute", borderRadius: 50, backgroundColor: "rgba(59,130,246,0.1)" },
  particle1: {
    width: 120,
    height: 120, top: "30%", left: "10%"
  },
  particle2: { width: 80, height: 80, top: "60%", right: "15%", backgroundColor: "rgba(139,92,246,0.08)" },
  particle3: { width: 60, height: 60, top: "20%", right: "20%", backgroundColor: "rgba(16,185,129,0.08)" },
});
