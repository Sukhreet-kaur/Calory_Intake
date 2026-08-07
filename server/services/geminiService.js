import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini API client if key is present
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Real AI Image Food Scanner using Gemini 2.5 Vision
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
}

/**
 * Real AI Nutritional Estimation for ANY custom food name entered by the user
 */
export async function estimateNutrientsByAI(foodName) {
  if (!process.env.GEMINI_API_KEY || !ai) {
    return null;
  }

  try {
    const prompt = `Provide the standard nutritional breakdown per 100g for the food item: "${foodName}".
Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "caloriesPer100g": number,
  "proteinPer100g": number,
  "carbsPer100g": number,
  "fatsPer100g": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    console.error('Gemini text estimation error:', err);
    return null;
  }
}
