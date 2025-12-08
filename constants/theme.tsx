// theme.tsx
export type CalendarTheme = {
  name: string;
  light: {
    yesColor: string; // for active items / highlights
    noColor: string;  // for inactive items / background
  };
  dark: {
    yesColor: string;
    noColor: string;
  };
};

// Light and Dark pastel themes
export const themes: CalendarTheme[] = [
  {
    name: "Green Activity",
    light: { yesColor: "#a8e6cf", noColor: "#F1F1F5" },
    dark: { yesColor: "#379683", noColor: "#2A3439" },
  },
  {
    name: "Red Activity",
    light: { yesColor: "#ff8b94", noColor: "#F5F5F5" },
    dark: { yesColor: "#d45062", noColor: "#2A3439" },
  },
  {
    name: "Blue Activity",
    light: { yesColor: "#81c3d7", noColor: "#F5F5F5" },
    dark: { yesColor: "#4a90e2", noColor: "#2A3439" },
  },
  // NEW Timeline Theme
  {
    name: "Timeline Theme",
    light: { yesColor: "#ffd166", noColor: "#fdf6e3" }, // active/highlight: yellow, background: light cream
    dark: { yesColor: "#f4a261", noColor: "#2a2a2a" },   // active: orange, background: dark gray
  },
];
