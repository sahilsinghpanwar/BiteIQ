// Image ko Supabase Storage mein upload karna
import { supabase } from "@/services/supabase";
import * as FileSystem from "expo-file-system";

// Type
interface UploadImageResponse {
  imageUrl: string | null;
  error: string | null;
}

// Helper: Base64 -> Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// File extension -> MIME type
function getMimeType(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

// Main Function
/**
 * Uploads a local image URI to Supabase Storage and returns its public URL.
 *
 * @param imageUri - The local file URI from expo-image-picker or camera (e.g., "file:///...")
 * @param userId - The unique ID of the authenticated user (used to organize storage file paths)
 * @param bucketName - The target Supabase storage bucket name (defaults to "food-images")
 * @returns An object containing the generated public URL or an error message
 */

export async function uploadFoodImage(
  imageUri: string,
  userId: string,
  bucketName: string = "food-images",
): Promise<UploadImageResponse> {
  try {
    if (!imageUri || !userId) {
      throw new Error("Image URI aur User ID dono zaroori hain.");
    }

    // 1. open file extension and generate a unique file name
    const fileExt = imageUri.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    const contentType = getMimeType(fileExt);

    // 2. read local file as base64
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3. Base64 → Uint8Array
    const fileBytes = base64ToUint8Array(base64Data);

    // 4. uplaod to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBytes, {
        contentType,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 5. Public URL lo
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    return {
      imageUrl: urlData.publicUrl,
      error: null,
    };
  } catch (err: any) {
    console.error("uploadFoodImage error:", err);
    return {
      imageUrl: null,
      error: err.message || "Image upload fail ho gayi. Dobara koshish karo.",
    };
  }
}
