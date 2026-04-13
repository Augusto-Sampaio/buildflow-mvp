import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function generateImageDescription(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Describe this image in one short sentence for an alt text." },
          { inlineData: { data: base64Image, mimeType: "image/png" } }
        ]
      }
    ]
  });
  return response.text;
}
