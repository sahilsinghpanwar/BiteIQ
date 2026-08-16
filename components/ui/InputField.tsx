import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

// Types

export interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  onSubmitEditing?: () => void;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

// Component

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  rightIcon,
  onRightIconPress,
  onSubmitEditing,
  editable = true,
  style,
  inputStyle,
}: InputFieldProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Container */}
      <View style={[styles.inputContainer, !editable && styles.inputDisabled]}>
        {/* Left Icon */}
        <Ionicons name={icon} size={20} color={Colors.text.secondary} />

        {/* Text Input */}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          importantForAutofill="no"
          textContentType="none"
          editable={editable}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label}
        />

        {/* Right Icon (e.g. eye toggle) */}
        {rightIcon && onRightIconPress ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={
              secureTextEntry ? "Show password" : "Hide password"
            }
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// Base Styles

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    color: Colors.text.secondary,
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.medium,
    fontFamily: Fonts.family.medium,
    includeFontPadding: false,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: Fonts.size.base,
    fontWeight: Fonts.weight.regular,
    fontFamily: Fonts.family.regular,
    includeFontPadding: false,
  },
});

export default memo(InputField);
