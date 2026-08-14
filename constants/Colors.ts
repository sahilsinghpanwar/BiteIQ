export const Colors = {
  // Core / Backgrounds (Deep Premium Dark Theme)
  background: "#0B0F12", // Sleek Deep Obsidian
  surface: "#141A1F", // Card / Tile Background
  surfaceSubtle: "#1C242C", // Elevated Container / Input Background
  border: "#26313D", // Soft divider / Card border
  borderFocus: "#10B981", // Emerald Border on Focus

  // Primary Brand Accent (Fresh & High Energy)
  primary: "#10B981", // Emerald Green (Energy, Health & Success)
  primaryLight: "#34D399", // Glow / Active State
  primaryMuted: "rgba(16, 185, 129, 0.15)", // Chip & Badge Background

  // Macro Nutrients (Charts, Rings & Badges)
  macros: {
    calories: "#F59E0B", // Warm Amber Flame (Total Calories)
    protein: "#38BDF8", // Electric Sky Blue (Muscle & Power)
    carbs: "#FBBF24", // Golden Honey (Energy)
    fat: "#FB7185", // Soft Coral / Rose (Essential Fats)
    fiber: "#A78BFA", // Lavender Purple (Digestive / Fiber)
  },

  // Goal Categories (Goal Presets Badges)
  goals: {
    weightLoss: "#10B981", // Emerald
    muscleGain: "#6366F1", // Indigo Glow
    maintain: "#38BDF8", // Cyan
    diabetic: "#F59E0B", // Amber
    athlete: "#EC4899", // Neon Pink
  },

  // Typography & Contrast
  text: {
    primary: "#F8FAFC", // Pure Crisp White
    secondary: "#94A3B8", // Slate Muted Gray
    tertiary: "#64748B", // Low-key Subtext / Timestamps
    inverse: "#0B0F12", // Dark text for bright buttons
  },

  // Status & Feedback
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#38BDF8",
  },
} as const;

export type ThemeColors = typeof Colors;
