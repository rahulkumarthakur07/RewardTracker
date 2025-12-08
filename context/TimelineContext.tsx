// context/TimelineContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TimelineItem {
  id: string;
  type: string;
  content: string;
  track: string;
  color: string;
  image?: string;
  date: string;
  time: string;
  timestamp: number;
}

interface TimelineContextType {
  items: TimelineItem[];
  loadItems: () => Promise<void>;
  saveItems: (items: TimelineItem[]) => Promise<void>;
  addItem: (item: TimelineItem) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearItems: () => Promise<void>;
}

const TimelineContext = createContext<TimelineContextType>({
  items: [],
  loadItems: async () => {},
  saveItems: async () => {},
  addItem: async () => {},
  deleteItem: async () => {},
  clearItems: async () => {},
});

export const TimelineProvider = ({ children }: { children: React.ReactNode }) => {
  const TIMELINE_KEY = "USERITEMS";
  const [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const json = await AsyncStorage.getItem(TIMELINE_KEY);
      if (json) {
        setItems(JSON.parse(json));
      }
    } catch (error) {
      console.error("Error loading timeline items:", error);
    }
  };

  const saveItems = async (newItems: TimelineItem[]) => {
    try {
      await AsyncStorage.setItem(TIMELINE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error("Error saving timeline items:", error);
      throw error;
    }
  };

  const addItem = async (item: TimelineItem) => {
    const newItems = [item, ...items];
    await saveItems(newItems);
  };

  const deleteItem = async (itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    await saveItems(newItems);
  };

  const clearItems = async () => {
    setItems([]);
    await AsyncStorage.removeItem(TIMELINE_KEY);
  };

  return (
    <TimelineContext.Provider value={{
      items,
      loadItems,
      saveItems,
      addItem,
      deleteItem,
      clearItems,
    }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => useContext(TimelineContext);