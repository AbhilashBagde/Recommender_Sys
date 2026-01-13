'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

export async function getProductVibe(productTitle: string) {
  if (!GEMINI_API_KEY) {
    return "AI Vibe Check is currently unavailable (API Key missing). But trust us, it's a vibe! ✨";
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Give me a 2-sentence summary of pros/cons for "${productTitle}" based on Indian user reviews. Be savage but helpful. Use emojis.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI is currently taking a chai break. Try again later! ☕";
  }
}
