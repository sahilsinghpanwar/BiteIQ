import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { Colors } from "../constants/colors";
import { Fonts } from "../constants/fonts";

// Props jo InputField ko bahar se milengi
type InputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;

  icon: keyof typeof Ionicons.glyphMap;

  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";

  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;

  onSubmitEditing?: () => void;
};

export default function InputField({
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
}: InputFieldProps) {
  return (
    <View className="mb-5">
      {/* Label */}
      <Text
        className="mb-2"
        style={{
          color: Colors.text.secondary,
          fontSize: Fonts.size.xs,
          fontWeight: Fonts.weight.medium,
        }}
      >
        {label}
      </Text>

      {/* Input Box */}
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{
          height: 52,
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.border,
        }}
      >
        {/* Left Icon */}
        <Ionicons name={icon} size={20} color={Colors.text.secondary} />

        {/* Input */}
        <TextInput
          className="flex-1 ml-3"
          style={{
            color: Colors.text.primary,
            fontSize: Fonts.size.base,
            fontWeight: Fonts.weight.regular,
          }}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
        />

        {/* Right Icon - Eye etc. */}
        {rightIcon && onRightIconPress && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={Colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
