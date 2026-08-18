import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import type { GoalType } from "@/types/user";
import { GOAL_PRESETS } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types
interface EditableField {
  label: string;
  value: string;
  key: "name" | "age" | "weight" | "height";
  unit?: string;
  keyboardType?: "default" | "numeric";
}

// Measurement Validation

type MeasurementKey = "age" | "weight" | "height";

const MEASUREMENT_RANGES: Record<
  MeasurementKey,
  { label: string; unit: string; min: number; max: number }
> = {
  age: { label: "Age", unit: "years", min: 1, max: 120 },
  weight: { label: "Weight", unit: "kg", min: 1, max: 500 },
  height: { label: "Height", unit: "cm", min: 30, max: 300 },
};

interface ParsedMeasurement {
  value: number | null;
  error: string | null;
}

/**
 * Blank (or whitespace-only) input clears the field; anything else must parse
 * to a finite number inside the field's range. Never yields 0 for empty input.
 */
function parseMeasurement(key: MeasurementKey, raw: string): ParsedMeasurement {
  const trimmed = raw.trim();
  if (!trimmed) return { value: null, error: null };

  const { label, unit, min, max } = MEASUREMENT_RANGES[key];
  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return { value: null, error: `${label} must be a valid number.` };
  }

  if (parsed < min || parsed > max) {
    return {
      value: null,
      error: `${label} must be between ${min} and ${max} ${unit}.`,
    };
  }

  return { value: parsed, error: null };
}

// Sub Components
function StatItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <View
      className="flex-1 items-center justify-center rounded-xl py-3"
      style={{
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      <Text
        style={{
          color: Colors.text.primary,
          fontSize: Fonts.size.lg,
          fontWeight: Fonts.weight.bold,
        }}
      >
        {value || "—"}
      </Text>
      <Text
        style={{
          color: Colors.text.tertiary,
          fontSize: Fonts.size.xs,
          fontWeight: Fonts.weight.medium,
        }}
      >
        {unit}
      </Text>
      <Text
        style={{
          color: Colors.text.tertiary,
          fontSize: Fonts.size.xs,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// Profile Screen
export default function ProfileScreen() {
  const { profile, updateProfile } = useAuthStore();
  const { signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);

  // Local edit state
  const [editName, setEditName] = useState(profile?.name ?? "");
  const [editAge, setEditAge] = useState(String(profile?.age ?? ""));
  const [editWeight, setEditWeight] = useState(String(profile?.weight ?? ""));
  const [editHeight, setEditHeight] = useState(String(profile?.height ?? ""));

  // The profile loads asynchronously, so the state initializers above can still
  // be empty by the time the user acts. Re-read it whenever edit mode opens.
  const syncEditFields = () => {
    setEditName(profile?.name ?? "");
    setEditAge(String(profile?.age ?? ""));
    setEditWeight(String(profile?.weight ?? ""));
    setEditHeight(String(profile?.height ?? ""));
  };

  // Enter Edit Mode

  const handleEdit = () => {
    syncEditFields();
    setIsEditing(true);
  };

  // Save Profile

  const handleSave = async () => {
    const age = parseMeasurement("age", editAge);
    const weight = parseMeasurement("weight", editWeight);
    const height = parseMeasurement("height", editHeight);

    const validationErrors = [age, weight, height]
      .map((field) => field.error)
      .filter((message): message is string => message !== null);

    if (validationErrors.length > 0) {
      Alert.alert("Invalid Details", validationErrors.join("\n"));
      return;
    }

    setIsSaving(true);

    const { success, error } = await updateProfile({
      name: editName.trim() || null,
      age: age.value,
      weight: weight.value,
      height: height.value,
    });

    setIsSaving(false);

    if (success) {
      setIsEditing(false);
    } else {
      Alert.alert("Error", error || "Failed to update profile.");
    }
  };

  // Cancel Edit

  const handleCancel = () => {
    syncEditFields();
    setIsEditing(false);
  };

  // Change Goal

  const handleGoalChange = async (goalType: GoalType) => {
    // One goal update at a time — overlapping writes can settle out of order
    // and leave the persisted goal disagreeing with the last tap.
    if (isUpdatingGoal) return;
    if (goalType === profile?.goal) return;

    const preset = GOAL_PRESETS.find((g) => g.type === goalType);
    if (!preset) return;

    setIsUpdatingGoal(true);

    try {
      const { success, error } = await updateProfile({
        goal: goalType,
        daily_calorie_target: preset.calorie_target,
      });

      if (!success) {
        Alert.alert("Error", error || "Failed to update goal.");
      }
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  // Sign Out

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);

          try {
            const { success, error } = await signOut();

            if (!success) {
              Alert.alert("Error", error || "Failed to sign out.");
            }
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  // Editable Fields

  const fields: EditableField[] = [
    { label: "Name", value: editName, key: "name", keyboardType: "default" },
    {
      label: "Age",
      value: editAge,
      key: "age",
      unit: "years",
      keyboardType: "numeric",
    },
    {
      label: "Weight",
      value: editWeight,
      key: "weight",
      unit: "kg",
      keyboardType: "numeric",
    },
    {
      label: "Height",
      value: editHeight,
      key: "height",
      unit: "cm",
      keyboardType: "numeric",
    },
  ];

  const fieldSetters: Record<string, (v: string) => void> = {
    name: setEditName,
    age: setEditAge,
    weight: setEditWeight,
    height: setEditHeight,
  };

  // Active Goal

  const activeGoal = GOAL_PRESETS.find((g) => g.type === profile?.goal);

  // UI

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View
          className="px-5 pt-14 pb-4 flex-row items-center justify-between"
          style={{ borderBottomWidth: 1, borderColor: Colors.border }}
        >
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: Fonts.size.xl,
              fontWeight: Fonts.weight.bold,
            }}
          >
            Profile
          </Text>

          {/* Edit / Save / Cancel */}
          {isEditing ? (
            <View className="flex-row" style={{ gap: 10 }}>
              <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
                <Text
                  style={{
                    color: Colors.text.secondary,
                    fontSize: Fonts.size.sm,
                    fontWeight: Fonts.weight.semibold,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text
                    style={{
                      color: Colors.primary,
                      fontSize: Fonts.size.sm,
                      fontWeight: Fonts.weight.bold,
                    }}
                  >
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleEdit}
              activeOpacity={0.7}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View className="px-5 pt-5">
          {/* ── Avatar + Name ── */}
          <View className="items-center mb-5">
            <View
              className="items-center justify-center rounded-3xl mb-3"
              style={{
                width: 72,
                height: 72,
                backgroundColor: Colors.primaryMuted,
                borderWidth: 2,
                borderColor: Colors.borderFocus,
              }}
            >
              <Text style={{ fontSize: 32 }}>
                {profile?.name?.charAt(0)?.toUpperCase() ?? "👤"}
              </Text>
            </View>

            <Text
              style={{
                color: Colors.text.primary,
                fontSize: Fonts.size.lg,
                fontWeight: Fonts.weight.bold,
              }}
            >
              {profile?.name || "Your Name"}
            </Text>

            {activeGoal && (
              <View
                className="flex-row items-center rounded-full px-3 py-1 mt-2"
                style={{
                  backgroundColor: Colors.primaryMuted,
                  borderWidth: 1,
                  borderColor: Colors.borderFocus,
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 12 }}>{activeGoal.emoji}</Text>
                <Text
                  style={{
                    color: Colors.primary,
                    fontSize: Fonts.size.xs,
                    fontWeight: Fonts.weight.semibold,
                  }}
                >
                  {activeGoal.label}
                </Text>
              </View>
            )}
          </View>

          {/* ── Stats Row ── */}
          <View className="flex-row mb-5" style={{ gap: 10 }}>
            <StatItem label="Weight" value={profile?.weight ?? "—"} unit="kg" />
            <StatItem label="Height" value={profile?.height ?? "—"} unit="cm" />
            <StatItem label="Age" value={profile?.age ?? "—"} unit="yrs" />
          </View>

          {/* ── Edit Fields ── */}
          {isEditing && (
            <View
              className="rounded-2xl p-4 mb-5"
              style={{
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.border,
                gap: 14,
              }}
            >
              <Text
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.md,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                Edit Details
              </Text>

              {fields.map((field) => (
                <View key={field.key}>
                  <Text
                    className="mb-1.5"
                    style={{
                      color: Colors.text.secondary,
                      fontSize: Fonts.size.xs,
                      fontWeight: Fonts.weight.medium,
                    }}
                  >
                    {field.label} {field.unit ? `(${field.unit})` : ""}
                  </Text>
                  <View
                    className="flex-row items-center rounded-xl px-3"
                    style={{
                      height: 44,
                      backgroundColor: Colors.surfaceSubtle,
                      borderWidth: 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <TextInput
                      value={field.value}
                      onChangeText={fieldSetters[field.key]}
                      keyboardType={field.keyboardType ?? "default"}
                      placeholder={field.label}
                      placeholderTextColor={Colors.text.tertiary}
                      style={{
                        flex: 1,
                        color: Colors.text.primary,
                        fontSize: Fonts.size.base,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Daily Target ── */}
          <View
            className="rounded-2xl p-4 mb-5"
            style={{
              backgroundColor: Colors.surface,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{
                  color: Colors.text.primary,
                  fontSize: Fonts.size.md,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                Daily Target
              </Text>
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: Fonts.size.sm,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                {profile?.daily_calorie_target?.toLocaleString() ?? 2000} kcal
              </Text>
            </View>

            {activeGoal && (
              <Text
                style={{
                  color: Colors.text.tertiary,
                  fontSize: Fonts.size.xs,
                  fontWeight: Fonts.weight.regular,
                }}
              >
                Protein: {activeGoal.protein_target}g · Based on{" "}
                {activeGoal.label} goal
              </Text>
            )}
          </View>

          {/* ── Goal Selection ── */}
          <Text
            className="mb-3"
            style={{
              color: Colors.text.primary,
              fontSize: Fonts.size.md,
              fontWeight: Fonts.weight.bold,
            }}
          >
            Change Goal
          </Text>

          <View style={{ gap: 10, marginBottom: 24 }}>
            {GOAL_PRESETS.map((goal) => {
              const isActive = profile?.goal === goal.type;
              return (
                <TouchableOpacity
                  key={goal.type}
                  className="flex-row items-center rounded-2xl p-4"
                  style={{
                    backgroundColor: isActive
                      ? Colors.primaryMuted
                      : Colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? Colors.borderFocus : Colors.border,
                    gap: 12,
                    opacity: isUpdatingGoal ? 0.6 : 1,
                  }}
                  onPress={() => handleGoalChange(goal.type)}
                  disabled={isUpdatingGoal}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 20 }}>{goal.emoji}</Text>
                  <View className="flex-1">
                    <Text
                      style={{
                        color: isActive ? Colors.primary : Colors.text.primary,
                        fontSize: Fonts.size.sm,
                        fontWeight: Fonts.weight.semibold,
                      }}
                    >
                      {goal.label}
                    </Text>
                    <Text
                      style={{
                        color: Colors.text.tertiary,
                        fontSize: Fonts.size.xs,
                        fontWeight: Fonts.weight.regular,
                      }}
                    >
                      {goal.calorie_target.toLocaleString()} kcal ·{" "}
                      {goal.protein_target}g protein
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Sign Out ── */}
          <TouchableOpacity
            className="items-center justify-center rounded-2xl"
            style={{
              height: 52,
              backgroundColor: "rgba(239,68,68,0.08)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.25)",
              opacity: isSigningOut ? 0.6 : 1,
            }}
            onPress={handleSignOut}
            disabled={isSigningOut}
            activeOpacity={0.8}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color={Colors.status.error} />
            ) : (
              <Text
                style={{
                  color: Colors.status.error,
                  fontSize: Fonts.size.base,
                  fontWeight: Fonts.weight.semibold,
                }}
              >
                Sign Out
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
