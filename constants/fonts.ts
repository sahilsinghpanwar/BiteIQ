import { Platform } from "react-native";

export const Fonts = {
  // Font Families
  family: {
    // Cross-platform modern clean font stack
    regular: Platform.select({
      ios: "System",
      android: "Roboto",
      default: "sans-serif",
    }),
    medium: Platform.select({
      ios: "System",
      android: "Roboto-Medium",
      default: "sans-serif-medium",
    }),
    bold: Platform.select({
      ios: "System",
      android: "Roboto-Bold",
      default: "sans-serif",
    }),
    mono: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
  },

  // Font Sizes (Tailored for Health & Stats App)
  size: {
    xs: 11, // Micro badges, timestamps
    sm: 13, // Captions, subtext, macro units ('g', 'kcal')
    base: 15, // Body text, list items, input fields
    md: 17, // Card titles, emphasized body
    lg: 20, // Section headers, modal titles
    xl: 24, // Screen titles, large stat labels
    xxl: 32, // Macro numbers (e.g., "120g Protein")
    hero: 44, // Main Calorie Counter display (e.g., "1,850")
  },

  // Font Weights
  weight: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "800",
  } as const,

  // Line Heights
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.5,
  },
} as const;

export type ThemeFonts = typeof Fonts;
