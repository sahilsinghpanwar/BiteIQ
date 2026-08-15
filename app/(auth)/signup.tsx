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
  View
} from "react-native";

import InputField from "@/components/InputField";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "../../constants/colors";
import { Fonts } from "../../constants/fonts";

// Email Validator
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Signup Screen
export default function SignupScreen() {
  const router = useRouter();

  // Auth
  const { signUp, isLoading, error, clearError } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Validation
  const validateForm = (): boolean => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Check required fields
    if (
      !trimmedName ||
      !trimmedEmail ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setValidationError("Please fill in all fields.");
      return false;
    }

    // Check name
    if (trimmedName.length < 2) {
      setValidationError("Name must be at least 2 characters.");
      return false;
    }

    // Check email
    if (!isValidEmail(trimmedEmail)) {
      setValidationError("Please enter a valid email address.");
      return false;
    }

    // Check password length
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return false;
    }

    // Check password match
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return false;
    }

    return true;
  };

  // Signup Handler
  const handleSignup = async () => {
    // Clear previous errors
    setValidationError(null);
    clearError?.();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Create account
    await signUp(name.trim(), email.trim(), password);
    // _layout.tsx session change detect karke automatically /(tabs) pe redirect karega
  };

  // Input Change Handlers
  const handleNameChange = (text: string) => {
    setName(text);

    if (validationError || error) {
      setValidationError(null);
      clearError?.();
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);

    if (validationError || error) {
      setValidationError(null);
      clearError?.();
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);

    if (validationError || error) {
      setValidationError(null);
      clearError?.();
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);

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
          {/* HEADER */}

          <View className="items-center mb-7">
            {/* Logo */}
            <View
              className="items-center justify-center rounded-2xl mb-4"
              style={{
                width: 60,
                height: 60,
                backgroundColor: Colors.primaryMuted,
                borderWidth: 1,
                borderColor: "rgba(16, 185, 129, 0.25)",
              }}
            >
              <Ionicons
                name="nutrition-outline"
                size={30}
                color={Colors.primary}
              />
            </View>

            {/* Title */}
            <Text
              className="mb-1.5"
              style={{
                color: Colors.text.primary,
                fontSize: Fonts.size.xl,
                fontWeight: Fonts.weight.bold,
              }}
            >
              Create Account
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.base,
                fontWeight: Fonts.weight.regular,
              }}
            >
              Start your healthy journey
            </Text>
          </View>

          {/* FORM */}

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

            {/* NAME */}

            <InputField
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={handleNameChange}
              icon="person-outline"
            />

            {/* EMAIL */}

            <InputField
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={handleEmailChange}
              icon="mail-outline"
              keyboardType="email-address"
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
            />

            {/* CONFIRM PASSWORD */}

            <InputField
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              icon="lock-closed-outline"
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                showConfirmPassword ? "eye-off-outline" : "eye-outline"
              }
              onRightIconPress={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              onSubmitEditing={handleSignup}
            />

            {/* SIGN UP BUTTON */}

            <TouchableOpacity
              className="items-center justify-center rounded-xl mt-1"
              style={{
                height: 52,
                backgroundColor: Colors.primary,
                opacity: isLoading ? 0.6 : 1,
              }}
              onPress={handleSignup}
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
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* LOGIN LINK */}

          <View className="flex-row justify-center items-center mt-7">
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.sm,
                fontWeight: Fonts.weight.regular,
              }}
            >
              Already have an account?{" "}
            </Text>

            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: Fonts.size.sm,
                  fontWeight: Fonts.weight.bold,
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
