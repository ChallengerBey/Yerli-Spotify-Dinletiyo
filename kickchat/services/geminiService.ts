
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getStreamerInsight(username: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Kick.com yayıncısı "${username}" hakkında genel bir analiz yap. Bu yayıncı hangi kategoride yayın yapar (Gaming, IRL, etc.), chat ortamı nasıldır ve genel kitlesi hakkında kısa bilgi ver. Türkçe cevap ver.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vibe: { type: Type.STRING, description: "Genel atmosfer (örn: Enerjik, Sakin, Toksik olmayan)" },
          chatStyle: { type: Type.STRING, description: "Chat hızı ve tarzı" },
          category: { type: Type.STRING, description: "Yayın kategorisi" },
          summary: { type: Type.STRING, description: "Yayıncı hakkında 1-2 cümlelik özet" },
        },
        required: ["vibe", "chatStyle", "category", "summary"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Insight parse error:", e);
    return null;
  }
}
