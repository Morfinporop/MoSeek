// src/store/moodStore.ts

import { create } from 'zustand';

export type Mood = 'neutral' | 'calm' | 'positive' | 'excited' | 'focused' | 'frustrated' | 'angry' | 'sad' | 'creative';

export const MOOD_COLORS: Record<Mood, string[]> = {
  neutral: ['139, 92, 246', '120, 80, 220', '160, 100, 255'],
  calm: ['59, 130, 246', '80, 150, 255', '40, 110, 230'],
  positive: ['34, 197, 94', '50, 210, 120', '20, 180, 80'],
  excited: ['249, 115, 22', '255, 140, 50', '230, 90, 10'],
  focused: ['99, 102, 241', '80, 85, 220', '120, 125, 255'],
  frustrated: ['239, 68, 68', '255, 90, 90', '210, 50, 50'],
  angry: ['220, 38, 38', '240, 60, 60', '190, 20, 20'],
  sad: ['100, 116, 139', '80, 95, 120', '130, 145, 165'],
  creative: ['168, 85, 247', '236, 72, 153', '200, 100, 255'],
};

export const MOOD_PHYSICS: Record<Mood, { speed: number; energy: number; size: number }> = {
  neutral:    { speed: 0.3,  energy: 0.5, size: 1.0 },
  calm:       { speed: 0.15, energy: 0.3, size: 1.1 },
  positive:   { speed: 0.35, energy: 0.6, size: 1.0 },
  excited:    { speed: 0.7,  energy: 0.9, size: 1.2 },
  focused:    { speed: 0.2,  energy: 0.4, size: 0.9 },
  frustrated: { speed: 0.6,  energy: 0.8, size: 1.1 },
  angry:      { speed: 0.8,  energy: 1.0, size: 1.3 },
  sad:        { speed: 0.1,  energy: 0.2, size: 0.8 },
  creative:   { speed: 0.5,  energy: 0.7, size: 1.15 },
};

interface MoodEvent {
  mood: Mood;
  timestamp: number;
}

interface MoodState {
  currentMood: Mood;
  moodHistory: MoodEvent[];
  eventCounter: number;
  pushMood: (mood: Mood) => void;
  reset: () => void;
}

export const useMoodStore = create<MoodState>((set, get) => ({
  currentMood: 'neutral',
  moodHistory: [],
  eventCounter: 0,

  pushMood: (mood: Mood) => {
    const state = get();
    const history = [...state.moodHistory, { mood, timestamp: Date.now() }];
    // Храним последние 30
    if (history.length > 30) history.shift();

    set({
      currentMood: mood,
      moodHistory: history,
      eventCounter: state.eventCounter + 1,
    });
  },

  reset: () => {
    set({
      currentMood: 'neutral',
      moodHistory: [],
      eventCounter: 0,
    });
  },
}));
