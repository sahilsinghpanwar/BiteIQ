import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useFoodAnalysis } from "@/hooks/useFoodAnalysis";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Types
type CameraFacing = "back" | "front";

// Scan Screen
export default function ScanScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraFacing>("back");
  const [isCapturing, setIsCapturing] = useState(false);

  const { isLoading, statusMessage, analyzeImage } = useFoodAnalysis();

  const isBusy = isLoading || isCapturing;

  // Process & Navigate

  const processImage = useCallback(
    async (uri: string) => {
      const { data, storagePath, error } = await analyzeImage(uri);

      if (error || !data) {
        Alert.alert(
          "Analysis Failed",
          error || "Could not analyze the food image. Please try again.",
          [{ text: "OK" }],
        );
        return;
      }

      router.push({
        pathname: "../result/[id]",
        params: {
          id: Date.now().toString(),
          analysis: JSON.stringify(data),
          storagePath: storagePath ?? "",
        },
      });
    },
    [analyzeImage, router],
  );

  // Camera Capture

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isBusy) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === "android",
      });
      if (photo?.uri) await processImage(photo.uri);
    } catch (err: any) {
      Alert.alert("Camera Error", err.message || "Failed to capture photo.");
    } finally {
      setIsCapturing(false);
    }
  }, [isBusy, processImage]);

  // Gallery Picker

  const handleGallery = useCallback(async () => {
    if (isBusy) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await processImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Gallery Error", err.message || "Failed to open gallery.");
    }
  }, [isBusy, processImage]);

  // Flip Camera

  const handleFlip = useCallback(() => {
    if (isBusy) return;
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }, [isBusy]);

  // Permission: Loading

  if (!permission) {
    return (
      <View className="flex-1" style={{ backgroundColor: Colors.background }} />
    );
  }

  // Permission: Denied

  if (!permission.granted) {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: Colors.background }}
      >
        <StatusBar style="light" />

        {/* Icon Badge */}
        <View
          className="items-center justify-center rounded-3xl mb-5"
          style={{
            width: 80,
            height: 80,
            backgroundColor: Colors.primaryMuted,
            borderWidth: 1,
            borderColor: Colors.borderFocus,
          }}
        >
          <Ionicons name="camera-outline" size={40} color={Colors.primary} />
        </View>

        {/* Text */}
        <Text
          className="text-center mb-3"
          style={{
            color: Colors.text.primary,
            fontSize: Fonts.size.lg,
            fontWeight: Fonts.weight.bold,
          }}
        >
          Camera Access Required
        </Text>
        <Text
          className="text-center mb-7"
          style={{
            color: Colors.text.secondary,
            fontSize: Fonts.size.sm,
            fontWeight: Fonts.weight.regular,
            lineHeight: Fonts.size.sm * Fonts.lineHeight.relaxed,
          }}
        >
          CalorieLens needs camera access to scan your meals and analyze
          nutrition.
        </Text>

        {/* Button */}
        <TouchableOpacity
          className="items-center justify-center rounded-2xl px-8"
          style={{
            height: 52,
            backgroundColor: Colors.primary,
          }}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: Colors.text.inverse,
              fontSize: Fonts.size.base,
              fontWeight: Fonts.weight.bold,
            }}
          >
            Grant Permission
          </Text>
        </TouchableOpacity>

        {/* Gallery fallback */}
        <TouchableOpacity
          className="items-center justify-center rounded-2xl px-8 mt-3"
          style={{
            height: 52,
            borderWidth: 1,
            borderColor: Colors.borderFocus,
          }}
          onPress={handleGallery}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: Fonts.size.base,
              fontWeight: Fonts.weight.semibold,
            }}
          >
            Choose from Gallery
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main Camera UI

  return (
    <View className="flex-1" style={{ backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Live Camera */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

      {/* Subtle Dark Vignette */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.22)" },
        ]}
        pointerEvents="none"
      />

      {/* ── Top Bar ── */}
      <View
        className="absolute left-0 right-0 flex-row items-center justify-center px-5"
        style={{ top: 54 }}
      >
        <Text
          style={{
            color: Colors.text.primary,
            fontSize: Fonts.size.md,
            fontWeight: Fonts.weight.bold,
          }}
        >
          Scan Food
        </Text>

        {/* Flip Button */}
        <TouchableOpacity
          className="absolute right-5 items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
          onPress={handleFlip}
          disabled={isBusy}
          activeOpacity={0.7}
        >
          <Ionicons
            name="camera-reverse-outline"
            size={22}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Viewfinder Frame */}
      <View
        className="flex-1 items-center justify-center"
        style={{ marginTop: 40, marginBottom: 120 }}
        pointerEvents="none"
      >
        {/* Corner accents — only StyleSheet for absoluteFillObject-style positioning */}
        <View style={{ width: 240, height: 240, position: "relative" }}>
          {/* Top Left */}
          <View
            style={[
              cornerStyle,
              {
                top: 0,
                left: 0,
                borderTopWidth: 3,
                borderLeftWidth: 3,
                borderTopLeftRadius: 8,
                borderColor: Colors.primary,
              },
            ]}
          />
          {/* Top Right */}
          <View
            style={[
              cornerStyle,
              {
                top: 0,
                right: 0,
                borderTopWidth: 3,
                borderRightWidth: 3,
                borderTopRightRadius: 8,
                borderColor: Colors.primary,
              },
            ]}
          />
          {/* Bottom Left */}
          <View
            style={[
              cornerStyle,
              {
                bottom: 0,
                left: 0,
                borderBottomWidth: 3,
                borderLeftWidth: 3,
                borderBottomLeftRadius: 8,
                borderColor: Colors.primary,
              },
            ]}
          />
          {/* Bottom Right */}
          <View
            style={[
              cornerStyle,
              {
                bottom: 0,
                right: 0,
                borderBottomWidth: 3,
                borderRightWidth: 3,
                borderBottomRightRadius: 8,
                borderColor: Colors.primary,
              },
            ]}
          />
        </View>

        {/* Hint */}
        <Text
          className="mt-5 overflow-hidden rounded-full px-4 py-1 text-center"
          style={{
            color: Colors.text.secondary,
            fontSize: Fonts.size.xs,
            fontWeight: Fonts.weight.medium,
            backgroundColor: "rgba(11,15,18,0.6)",
          }}
        >
          Align food inside the frame
        </Text>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(11,15,18,0.82)", gap: 14 }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text
            style={{
              color: Colors.text.primary,
              fontSize: Fonts.size.base,
              fontWeight: Fonts.weight.medium,
            }}
          >
            {statusMessage || "Analyzing..."}
          </Text>
        </View>
      )}

      {/* Bottom Controls */}
      {!isLoading && (
        <View
          className="absolute left-0 right-0 flex-row items-center justify-around px-8"
          style={{ bottom: 44 }}
        >
          {/* Gallery */}
          <TouchableOpacity
            className="items-center"
            style={{ width: 60, gap: 5 }}
            onPress={handleGallery}
            disabled={isBusy}
            activeOpacity={0.7}
          >
            <Ionicons
              name="images-outline"
              size={24}
              color={Colors.text.primary}
            />
            <Text
              style={{
                color: Colors.text.secondary,
                fontSize: Fonts.size.xs,
                fontWeight: Fonts.weight.medium,
              }}
            >
              Gallery
            </Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            className="items-center justify-center rounded-full"
            style={{
              width: 76,
              height: 76,
              borderWidth: 3,
              borderColor: Colors.text.primary,
              opacity: isBusy ? 0.45 : 1,
            }}
            onPress={handleCapture}
            disabled={isBusy}
            activeOpacity={0.8}
          >
            {isCapturing ? (
              <ActivityIndicator size="small" color={Colors.text.primary} />
            ) : (
              <View
                className="rounded-full"
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: Colors.primary,
                }}
              />
            )}
          </TouchableOpacity>

          {/* Spacer — balance layout */}
          <View style={{ width: 60 }} />
        </View>
      )}
    </View>
  );
}

// Corner style (position absolute — NativeWind se nahi hota)

const cornerStyle = {
  position: "absolute" as const,
  width: 22,
  height: 22,
};

const styles = StyleSheet.create({
  camera: {
    ...StyleSheet.absoluteFill,
  },
});
