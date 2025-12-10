import React, { useEffect, useContext } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";

import { ThemeProvider, ThemeContext } from "@/context/ThemeContext";
import { TracksProvider } from "@/context/TracksContext";
import { ProfileProvider } from "@/context/ProfileContext";
import { TimelineProvider } from "@/context/TimelineContext";
import "@/global.css";

function AppStack() {
  const { dark } = useContext(ThemeContext);

  useEffect(() => {
    StatusBar.setBarStyle(dark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  }, [dark]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <ThemeProvider>
        <TimelineProvider>
          <TracksProvider>
            <AppStack />
            <Toast />
          </TracksProvider>
        </TimelineProvider>
      </ThemeProvider>
    </ProfileProvider>
  );
}
