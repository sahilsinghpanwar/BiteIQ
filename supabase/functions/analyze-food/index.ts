// Supabase Edge Function — analyze-food
// Runs on Deno; GEMINI_KEY is a server-only Supabase secret.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ── CORS ─────────────────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Schema ───────────────────────────────────────────────────────────────────

const nutritionSchema = {
  type: "OBJECT",
  properties: {
    isFood: {
      type: "BOOLEAN",
      description: "Indicates if the image is of food or not.",
    },
    foodName: {
      type: "STRING",
      description: "Recognized dish or item name, or 'Unknown / Not Food'.",
    },
    calories: {
      type: "NUMBER",
      description: "Estimated total calories (kcal).",
    },
    macros: {
      type: "OBJECT",
      properties: {
        protein: { type: "NUMBER", description: "Protein in grams." },
        carbs: { type: "NUMBER", description: "Carbohydrates in grams." },
        fat: { type: "NUMBER", description: "Fat in grams." },
      },
      required: ["protein", "carbs", "fat"],
    },
    portionSize: {
      type: "STRING",
      description: "Estimated serving size e.g. '1 bowl', '250g', '2 pieces'.",
    },
    confidenceScore: {
      type: "NUMBER",
      description: "Model confidence in detection between 0.0 and 1.0.",
    },
    healthScore: {
      type: "NUMBER",
      description:
        "Health rating from 1 (very unhealthy) to 10 (very nutritious).",
    },
    insights: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "2-3 short actionable health insights or facts about this food.",
    },
    bestFor: {
      type: "ARRAY",
      items: { type: "STRING" },
      description:
        "Who should eat this food e.g. ['Weight Loss', 'Athletes', 'Muscle Gain', 'Heart Health'].",
    },
    avoidIf: {
      type: "ARRAY",
      items: { type: "STRING" },
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

const PROMPT = "You are an expert nutritionist and visual food analysis engine.\nAnalyze this image thoroughly:\n1. Determine whether it contains food or beverage.\n2. If it is food, estimate exact portion sizes, calories, and macronutrients (protein, carbs, fats).\n3. Give a health score (1-10) and 2-3 practical health insights.\n4. List who this food is best for (e.g. Athletes, Weight Loss, Muscle Gain).\n5. List who should avoid it (e.g. Diabetics, High Blood Pressure).\n6. If not food, set isFood to false and zero out all nutritional values.";

// ── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_KEY = Deno.env.get("GEMINI_KEY");
    if (!GEMINI_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_KEY secret is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { base64, mimeType = "image/jpeg" } = await req.json() as {
      base64: string;
      mimeType?: string;
    };

    if (!base64) {
      return new Response(
        JSON.stringify({ error: "Missing required field: base64" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType, data: cleanBase64 } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: nutritionSchema,
        temperature: 0.2,
      },
    };

    const geminiRes = await fetch(GEMINI_API_URL + "?key=" + GEMINI_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: "Gemini API request failed.", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const geminiData = await geminiRes.json();
    const responseText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: "Empty response from Gemini API." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = JSON.parse(responseText);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    console.error("analyze-food error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
