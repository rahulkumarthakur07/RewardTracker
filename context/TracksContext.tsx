// context/TracksContext.tsx - Updated with EventEmitter
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Track {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  entriesCount?: number;
}

interface TracksContextType {
  tracks: Track[];
  addTrack: (track: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTrack: (trackId: string, updates: Partial<Omit<Track, 'id' | 'createdAt'>>) => Promise<void>;
  removeTrack: (trackId: string) => Promise<void>;
  clearTracks: () => Promise<void>;
  loadTracks: () => Promise<void>;
  getTrackById: (trackId: string) => Track | undefined;
  getTrackByName: (trackName: string) => Track | undefined;
  getTrackStats: (trackId: string) => Promise<number>;
  updateTimelineEntriesForTrack: (oldName: string, newName: string) => Promise<void>;
}

export const TracksContext = createContext<TracksContextType>({
  tracks: [],
  addTrack: async () => {},
  updateTrack: async () => {},
  removeTrack: async () => {},
  clearTracks: async () => {},
  loadTracks: async () => {},
  getTrackById: () => undefined,
  getTrackByName: () => undefined,
  getTrackStats: async () => 0,
  updateTimelineEntriesForTrack: async () => {},
});

// Create a simple event emitter
type EventCallback = (data?: any) => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export const eventEmitter = new EventEmitter();

export const TracksProvider = ({ children }: { children: React.ReactNode }) => {
  const TRACKS_KEY = "USER_TRACKS";
  const TIMELINE_KEY = "USERITEMS";
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      const json = await AsyncStorage.getItem(TRACKS_KEY);
      if (json) {
        const parsedTracks = JSON.parse(json);
        const migratedTracks = parsedTracks.map((track: any) => ({
          id: track.id || generateId(),
          name: track.name,
          color: track.color || generateRandomColor(),
          createdAt: track.createdAt || new Date().toISOString(),
          updatedAt: track.updatedAt || new Date().toISOString(),
        }));
        setTracks(migratedTracks);
      }
    } catch (error) {
      console.error("Error loading tracks:", error);
    }
  };

  const saveTracks = async (tracksList: Track[]) => {
    try {
      await AsyncStorage.setItem(TRACKS_KEY, JSON.stringify(tracksList));
    } catch (error) {
      console.error("Error saving tracks:", error);
    }
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const generateRandomColor = () => {
    const colors = [
      "#EF4444", "#F97316", "#F59E0B", "#10B981", "#06B6D4",
      "#3B82F6", "#8B5CF6", "#EC4899", "#6366F1", "#14B8A6",
      "#84CC16", "#F43F5E", "#8B5CF6", "#EC4899", "#0EA5E9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Helper function to update timeline entries when track name changes
  const updateTimelineEntriesForTrack = async (oldName: string, newName: string) => {
    try {
      console.log(`Updating timeline entries from "${oldName}" to "${newName}"`);
      
      const json = await AsyncStorage.getItem(TIMELINE_KEY);
      if (json) {
        const items = JSON.parse(json);
        let updatedCount = 0;
        
        const updatedItems = items.map((item: any) => {
          if (item.track === oldName) {
            updatedCount++;
            return { ...item, track: newName };
          }
          return item;
        });
        
        await AsyncStorage.setItem(TIMELINE_KEY, JSON.stringify(updatedItems));
        console.log(`Updated ${updatedCount} timeline entries`);
        
        // Emit event to notify all components about the timeline update
        eventEmitter.emit('timelineUpdated', {
          type: 'trackRenamed',
          oldName,
          newName,
          updatedCount
        });
        
        // Also emit a specific event for tracks update
        eventEmitter.emit('tracksUpdated');
      }
    } catch (error) {
      console.error("Error updating timeline entries:", error);
      throw error;
    }
  };

  const addTrack = async (track: Omit<Track, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const existingTrack = tracks.find(
        t => t.name.toLowerCase() === track.name.toLowerCase()
      );
      
      if (existingTrack) {
        throw new Error(`A track named "${track.name}" already exists`);
      }

      const newTrack: Track = {
        id: generateId(),
        name: track.name,
        color: track.color || generateRandomColor(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newTracks = [...tracks, newTrack];
      setTracks(newTracks);
      await saveTracks(newTracks);
      
      // Emit event when track is added
      eventEmitter.emit('tracksUpdated');
    } catch (error) {
      console.error("Error adding track:", error);
      throw error;
    }
  };

  const updateTrack = async (trackId: string, updates: Partial<Omit<Track, 'id' | 'createdAt'>>) => {
    try {
      const trackToUpdate = tracks.find(t => t.id === trackId);
      if (!trackToUpdate) {
        throw new Error('Track not found');
      }

      if (updates.name && updates.name !== trackToUpdate.name) {
        const existingTrack = tracks.find(
          t => t.id !== trackId && t.name.toLowerCase() === updates.name!.toLowerCase()
        );
        
        if (existingTrack) {
          throw new Error(`A track named "${updates.name}" already exists`);
        }

        console.log(`Renaming track from "${trackToUpdate.name}" to "${updates.name}"`);
        await updateTimelineEntriesForTrack(trackToUpdate.name, updates.name);
      }

      const updatedTracks = tracks.map(track => {
        if (track.id === trackId) {
          return {
            ...track,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return track;
      });

      setTracks(updatedTracks);
      await saveTracks(updatedTracks);
      
      // Emit event when track is updated
      eventEmitter.emit('tracksUpdated');
      eventEmitter.emit('trackUpdated', { trackId, ...updates });
      
    } catch (error) {
      console.error("Error updating track:", error);
      throw error;
    }
  };

  const removeTrack = async (trackId: string) => {
    try {
      const trackToDelete = tracks.find(t => t.id === trackId);
      if (!trackToDelete) {
        throw new Error('Track not found');
      }

      const json = await AsyncStorage.getItem(TIMELINE_KEY);
      if (json) {
        const items = JSON.parse(json);
        const filteredItems = items.filter((item: any) => item.track !== trackToDelete.name);
        await AsyncStorage.setItem(TIMELINE_KEY, JSON.stringify(filteredItems));
        
        // Emit event when timeline entries are removed
        eventEmitter.emit('timelineUpdated', {
          type: 'trackDeleted',
          trackName: trackToDelete.name
        });
      }

      const updatedTracks = tracks.filter(track => track.id !== trackId);
      setTracks(updatedTracks);
      await saveTracks(updatedTracks);
      
      // Emit event when track is removed
      eventEmitter.emit('tracksUpdated');
      eventEmitter.emit('trackDeleted', { trackId, trackName: trackToDelete.name });
      
    } catch (error) {
      console.error("Error removing track:", error);
      throw error;
    }
  };

  const clearTracks = async () => {
    try {
      setTracks([]);
      await AsyncStorage.removeItem(TRACKS_KEY);
      
      // Emit event when all tracks are cleared
      eventEmitter.emit('tracksUpdated');
      eventEmitter.emit('timelineUpdated', { type: 'allTracksCleared' });
      
    } catch (error) {
      console.error("Error clearing tracks:", error);
      throw error;
    }
  };

  const getTrackById = (trackId: string) => {
    return tracks.find(track => track.id === trackId);
  };

  const getTrackByName = (trackName: string) => {
    return tracks.find(track => track.name.toLowerCase() === trackName.toLowerCase());
  };

  const getTrackStats = async (trackId: string): Promise<number> => {
    try {
      const track = tracks.find(t => t.id === trackId);
      if (!track) return 0;

      const json = await AsyncStorage.getItem(TIMELINE_KEY);
      if (json) {
        const items = JSON.parse(json);
        return items.filter((item: any) => item.track === track.name).length;
      }
      return 0;
    } catch (error) {
      console.error("Error getting track stats:", error);
      return 0;
    }
  };

  const value: TracksContextType = {
    tracks,
    addTrack,
    updateTrack,
    removeTrack,
    clearTracks,
    loadTracks,
    getTrackById,
    getTrackByName,
    getTrackStats,
    updateTimelineEntriesForTrack,
  };

  return (
    <TracksContext.Provider value={value}>
      {children}
    </TracksContext.Provider>
  );
};