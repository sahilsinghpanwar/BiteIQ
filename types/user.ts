// user goal

export type GoalType =
  "weight_loss" | "muscle_gain" | "maintain" | "diabetic" | "athlete";

//  user profile

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: GoalType;
  daily_calorie_intake: number;
  created_at: Date;
}

// The ID will be optional when updating the profile.
export type ProfileUpdate = Partial<Omit<UserProfile, "id" | "created_at">>;

// Goal config (UI mein use hoga)
export interface GoalConfig {
  type: GoalType;
  label: string;
  emoji: string;
  calorie_target: number;
  protein_target: number;
}

// present goal

export const GOAL_PRESETS: GoalConfig[] = [
  {
    type: "weight_loss",
    label: "Weight Loss",
    emoji: "🔥",
    calorie_target: 1600,
    protein_target: 120,
  },
  {
    type: "muscle_gain",
    label: "Muscle Gain",
    emoji: "💪",
    calorie_target: 2800,
    protein_target: 180,
  },
  {
    type: "maintain",
    label: "Maintain Weight",
    emoji: "⚖️",
    calorie_target: 2000,
    protein_target: 100,
  },
  {
    type: "diabetic",
    label: "Diabetic Friendly",
    emoji: "🩺",
    calorie_target: 1800,
    protein_target: 90,
  },
  {
    type: "athlete",
    label: "Athlete",
    emoji: "🏃",
    calorie_target: 3200,
    protein_target: 200,
  },
];
