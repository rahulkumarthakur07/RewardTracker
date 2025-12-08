import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function Layout() {
  const insets = useSafeAreaInsets();
  const { dark } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={() => {
        const tabBarBackground = dark ? "#1e1e1e" : "#ffffff";
        const activeColor = dark ? "#fff" : "#000";
        const inactiveColor = dark ? "#9CA3AF" : "#9CA3AF";

        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarStyle: {
            backgroundColor: tabBarBackground,
            borderTopWidth: 1,
            borderTopColor: dark ? "#333" : "#e5e7eb",
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,

          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        };
      }}
    >
      <Tabs.Screen
        name="compare"
        options={{
          title: "Comparison",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
