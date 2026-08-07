import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Active models with vision & text support
const PREFERRED_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

/**
 * Real AI Image Food Scanner using Gemini Vision
 */
export async function analyzeFoodImage(imageBuffer, mimeType = 'image/jpeg') {
  if (!process.env.GEMINI_API_KEY || !ai) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const prompt = `Analyze this food image in detail and return ONLY a raw JSON object (no markdown formatting, no code blocks) with the following structure:
{
  "foodName": "Specific Name of the main food item detected",
  "estimatedWeightGrams": estimated portion weight in grams (number),
  "caloriesPer100g": calories per 100g (number),
  "proteinPer100g": protein grams per 100g (number),
  "carbsPer100g": carbs grams per 100g (number),
  "fatsPer100g": fats grams per 100g (number)
}`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  let lastError = null;
  for (const modelName of PREFERRED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [prompt, imagePart]
      });

      const text = response.text.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
      const data = JSON.parse(text);

      return {
        foodName: data.foodName || 'Detected Meal',
        estimatedWeightGrams: Number(data.estimatedWeightGrams) || 200,
        caloriesPer100g: Number(data.caloriesPer100g) || 150,
        proteinPer100g: Number(data.proteinPer100g) || 10,
        carbsPer100g: Number(data.carbsPer100g) || 15,
        fatsPer100g: Number(data.fatsPer100g) || 5
      };
    } catch (err) {
      console.warn(`Model ${modelName} image scan failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed to process image');
}

/**
 * Real AI Nutritional Estimation for custom food names
 */
export async function estimateNutrientsByAI(foodName) {
  if (!process.env.GEMINI_API_KEY || !ai) {
    return null;
  }

  const prompt = `Provide the standard nutritional breakdown per 100g for the food item: "${foodName}".
Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "caloriesPer100g": number,
  "proteinPer100g": number,
  "carbsPer100g": number,
  "fatsPer100g": number
}`;

  for (const modelName of PREFERRED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [prompt]
      });

      const text = response.text.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
      const data = JSON.parse(text);

      return {
        caloriesPer100g: Number(data.caloriesPer100g) || 160,
        proteinPer100g: Number(data.proteinPer100g) || 10,
        carbsPer100g: Number(data.carbsPer100g) || 20,
        fatsPer100g: Number(data.fatsPer100g) || 5
      };
    } catch (err) {
      console.warn(`Model ${modelName} text estimation failed:`, err.message);
    }
  }

  return null;
}
