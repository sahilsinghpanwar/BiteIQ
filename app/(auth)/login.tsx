import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import InputField from "@/components/ui/InputField";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Fonts";

// Email Validator

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Login Screen

export default function LoginScreen() {
  const router = useRouter();

  // Auth
  const { signIn, isLoading, error, clearError } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI State

  const [showPassword, setShowPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Validation

  const validateForm = (): boolean => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setValidationError("Please fill in all fields.");
      return false;
    }

    if (!isValidEmail(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // Login Handler

  const handleLogin = async () => {
    // Clear previous errors
    setValidationError(null);
    clearError?.();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Login
    const result = await signIn(email.trim(), password);

    // Navigate after successful login
    if (result.success) {
      router.replace("/(tabs)");
    }
  };

  // Email Change

  const handleEmailChange = (text: string) => {
    setEmail(text);

    // Clear error when user starts typing
    if (validationError || error) {
      setValidationError(null);
      clearError?.();
    }
  };

  // Password Change

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    // Clear error when user starts typing
    if (validationError || error) {
      setValidationError(null);
      clearError?.();
    }
  };

  // Error
  const displayError = validationError || error;

  // UI
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1"
        style={{
          backgroundColor: Colors.background,
        }}
        behavior="padding"
      >
        <StatusBar style="light" />

        <View className="flex-1 justify-center px-6">
          {/*  HEADER */}

          <View className="items-center mb-9">
            {/* Logo */}
            <View
              className="items-center justify-center rounded-2xl mb-4"
              style={{
                width: 64,
                height: 64,
                backgroundColor: Colors.primaryMuted,
                borderWidth: 1,
                borderColor: "rgba(16, 185, 129, 0.25)",
              }}
            >
              <Ionicons
                name="nutrition-outline"
                size={32}
                color={Colors.primary}
              />
            </View>

            {/* App Name */}
            <Text
              className="mb-1.5"
              style={{
                color: Colors.text.primary,
                fontSize: Fonts.size.xl,
                fontWeight: Fonts.weight.bold,
              }}
            >
              CalorieLens
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.base,
                fontWeight: Fonts.weight.regular,
              }}
            >
              Track meals, reach your target
            </Text>
          </View>

          {/*  FORM */}

          <View className="w-full">
            {/* Error Message */}
            {displayError && (
              <View
                className="flex-row items-center rounded-xl px-3.5 py-2.5 mb-4"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(239, 68, 68, 0.25)",
                }}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={Colors.status.error}
                />

                <Text
                  className="flex-1 ml-2"
                  style={{
                    color: Colors.status.error,
                    fontSize: Fonts.size.xs,
                    fontWeight: Fonts.weight.medium,
                  }}
                >
                  {displayError}
                </Text>
              </View>
            )}

            {/* EMAIL */}

            <InputField
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={handleEmailChange}
              icon="mail-outline"
              keyboardType="email-address"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            {/* PASSWORD */}

            <InputField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={handlePasswordChange}
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword((previous) => !previous)}
              onSubmitEditing={handleLogin}
            />

            {/* LOGIN BUTTON */}

            <TouchableOpacity
              className="items-center justify-center rounded-xl mt-1"
              style={{
                height: 52,
                backgroundColor: Colors.primary,
                opacity: isLoading ? 0.6 : 1,
              }}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.text.inverse} />
              ) : (
                <Text
                  style={{
                    color: Colors.text.inverse,
                    fontSize: Fonts.size.base,
                    fontWeight: Fonts.weight.bold,
                  }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* SIGN UP */}

          <View className="flex-row justify-center items-center mt-8">
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.sm,
                fontWeight: Fonts.weight.regular,
              }}
            >
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: Fonts.size.sm,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
