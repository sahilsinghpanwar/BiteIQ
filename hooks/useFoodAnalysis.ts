import { useAuth } from "@/hooks/useAuth";
import { analyzeFoodImage, FoodNutritionResult } from "@/services/geminiVision";
import { uploadFoodImage } from "@/services/uploadImage";
import { useState } from "react";

// Types

export interface AnalysisState {
  isLoading: boolean;
  statusMessage: string;
  error: string | null;
  data: FoodNutritionResult | null;
}

export interface AnalysisResult {
  data: FoodNutritionResult | null;
  imageUrl: string | null;
  error: string | null;
}

// Hook

export function useFoodAnalysis() {
  const { user } = useAuth();

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    statusMessage: "",
    error: null,
    data: null,
  });

  // Reset

  const resetAnalysis = () => {
    setAnalysisState({
      isLoading: false,
      statusMessage: "",
      error: null,
      data: null,
    });
  };

  //  Analyze

  /**
   * Uploads the image to Supabase Storage and analyzes it using Gemini AI.
   *
   * @param imageUri - The local file URI from the camera or gallery (e.g., "file:///...")
   * @returns The analysis result containing nutritional data and the uploaded image URL
   */

  const analyzeImage = async (imageUri: string): Promise<AnalysisResult> => {
    // Guards
    if (!imageUri) {
      const error = "No image selected for analysis.";
      setAnalysisState((prev) => ({ ...prev, error }));
      return { data: null, imageUrl: null, error };
    }

    if (!user?.id) {
      const error = "User session not found. Please log in again.";
      setAnalysisState((prev) => ({ ...prev, error }));
      return { data: null, imageUrl: null, error };
    }

    try {
      // Step 1 — Upload
      setAnalysisState({
        isLoading: true,
        statusMessage: "Uploading image...",
        error: null,
        data: null,
      });

      const { imageUrl, error: uploadError } = await uploadFoodImage(
        imageUri,
        user.id,
      );

      if (uploadError || !imageUrl) {
        throw new Error(uploadError ?? "Failed to upload image.");
      }

      // Step 2 — Analyze
      setAnalysisState((prev) => ({
        ...prev,
        statusMessage: "Analyzing nutritional breakdown...",
      }));

      const aiResult = await analyzeFoodImage(imageUri);

      if (!aiResult) {
        throw new Error("Unable to analyze food image. Please try again.");
      }

      // Step 3 — Success
      setAnalysisState({
        isLoading: false,
        statusMessage: "Analysis complete!",
        error: null,
        data: aiResult,
      });

      return { data: aiResult, imageUrl, error: null };
    } catch (err: any) {
      const error = err.message ?? "Something went wrong during analysis.";

      setAnalysisState({
        isLoading: false,
        statusMessage: "",
        error,
        data: null,
      });

      return { data: null, imageUrl: null, error };
    }
  };


  return {
    ...analysisState,
    analyzeImage,
    resetAnalysis,
  };
}
