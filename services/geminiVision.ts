// AI ko image bhejna aur nutrition data lena
import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";
// API init
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Types
export interface MacroBreakdown {
  protein: number; // gram
  carbs: number; // gram
  fat: number; // gram
}

export interface FoodNutritionResult {
  isFood: boolean;
  calories: number; // kcal
  macros: MacroBreakdown;
  portionSize: string; // e.g., "1 cup", "100g"
  confidenceScore: number;
  healthScore: number;
  insights: string[]; // List of insights or recommendations
  bestFor: string[]; // List of best use cases or scenarios
  avoidIf: string[]; // List of scenarios or conditions to avoid
}

// Response Schema for the AI response
const nutritionSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isFood: {
      type: SchemaType.BOOLEAN,
      description: "Indicates if the image is of food or not.",
    },

    foodName: {
      type: SchemaType.STRING,
      description: "Recognized dish or item name, or 'Unknown / Not Food'.",
    },

    calories: {
      type: SchemaType.NUMBER,
      description: "Estimated total calories (kcal).",
    },

    macros: {
      type: SchemaType.OBJECT,
      properties: {
        protein: {
          type: SchemaType.NUMBER,
          description: "Protein in grams.",
        },
        carbs: {
          type: SchemaType.NUMBER,
          description: "Carbohydrates in grams.",
        },
        fat: {
          type: SchemaType.NUMBER,
          description: "Fat in grams.",
        },
      },

      required: ["protein", "carbs", "fat"],
    },

    portionSize: {
      type: SchemaType.STRING,
      description: "Estimated serving size e.g. '1 bowl', '250g', '2 pieces'.",
    },

    confidenceScore: {
      type: SchemaType.NUMBER,
      description: "Model confidence in detection between 0.0 and 1.0.",
    },

    healthScore: {
      type: SchemaType.NUMBER,
      description:
        "Health rating from 1 (very unhealthy) to 10 (very nutritious).",
    },

    insights: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description:
        "2-3 short actionable health insights or facts about this food.",
    },

    bestFor: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description:
        "Who should eat this food e.g. ['Weight Loss', 'Athletes', 'Muscle Gain', 'Heart Health'].",
    },

    avoidIf: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description:
        "Who should avoid this food e.g. ['Diabetics', 'High Blood Pressure', 'Lactose Intolerant'].",
    },
  },

  required: [
    "isFood",
    "foodName",
    "calories",
    "macros",
    "portionSize",
    "confidenceScore",
    "healthScore",
    "insights",
    "bestFor",
    "avoidIf",
  ],
};

// Main Function
/**
 * Analyzes a food image to extract nutritional data.
 * @param base64Data  Base64 string (with or without "data:image/...;base64," prefix)
 * @param mimeType    Image format — default 'image/jpeg'
 */

export const analyzeFoodImage = async (
  base64Data: string,
  mimeType: string = "image/jpeg",
): Promise<FoodNutritionResult> => {
  if (!API_KEY) {
    throw new Error(
      "Missing Gemini API key. Check your .env file for EXPO_PUBLIC_GEMINI_API_KEY.",
    );
  }

  const cleanBase64 = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  try {
    // Fix: gemini-1.5-flash → gemini-2.0-flash (better accuracy, still free tier)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: nutritionSchema,
        temperature: 0.2, // Low temperature = consistent numeric estimates
      },
    });

    const prompt = `
      You are an expert nutritionist and visual food analysis engine.
      Analyze this image thoroughly:
      1. Determine whether it contains food or beverage.
      2. If it is food, estimate exact portion sizes, calories, and macronutrients (protein, carbs, fats).
      3. Give a health score (1-10) and 2-3 practical health insights.
      4. List who this food is best for (e.g. Athletes, Weight Loss, Muscle Gain).
      5. List who should avoid it (e.g. Diabetics, High Blood Pressure).
      6. If not food, set isFood to false and zero out all nutritional values.
    `;

    const response = await model.generateContent([
      prompt,
      { inlineData: { data: cleanBase64, mimeType } },
    ]);

    const responseText = response.response.text();
    if (!responseText) {
      throw new Error("No response text from Gemini API.");
    }

    return JSON.parse(responseText) as FoodNutritionResult;
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    throw new Error(
      error?.message || "Food analysis fail ho gaya. Dobara koshish karo.",
    );
  }
};
