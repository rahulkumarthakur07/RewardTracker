import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { ThemeProvider, ThemeContext } from "@/context/ThemeContext";
import "@/global.css";
import { TracksProvider } from "@/context/TracksContext";
import { useContext, useEffect, useState } from "react";
import { ProfileProvider } from "@/context/ProfileContext";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { TimelineProvider } from "@/context/TimelineContext";

// Prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

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
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // You can preload fonts, assets, or other things here if needed

        // Small delay to ensure providers mount
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!appIsReady) {
    // Render nothing while splash is visible
    return null;
  }

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
