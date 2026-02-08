
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const geminiService = {
  chatWithFriend: async (friendName: string, history: { text: string, sender: 'user' | 'friend' }[]) => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const formattedHistory = history.map(h => 
      `${h.sender === 'user' ? 'Ben' : friendName}: ${h.text}`
    ).join('\n');

    const prompt = `Sen ${friendName} isminde bir arkadaşsın. Aşağıdaki sohbet geçmişine göre samimi, kısa ve doğal bir cevap ver. 
    Sadece cevabı yaz.
    
    Geçmiş:
    ${formattedHistory}
    
    Son mesaj: ${history[history.length - 1].text}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 150,
        }
      });
      return response.text || "Şu an cevap veremiyorum, sonra görüşürüz!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Bağlantıda bir sorun oluştu dostum.";
    }
  }
};
