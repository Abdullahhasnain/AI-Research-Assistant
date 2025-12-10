import { GoogleGenAI, Content, Part } from "@google/genai";
import { ChatMessage, MedicalRecord } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mapMessagesToContent = (messages: ChatMessage[]): Content[] => {
  return messages.map((msg) => {
    const parts: Part[] = [];
    if (msg.image) {
      const match = msg.image.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }
    if (msg.text) {
      parts.push({ text: msg.text });
    }
    return {
      role: msg.role,
      parts: parts,
    };
  });
};

interface GeminiResponse {
  text: string;
  medicalRecord: Partial<MedicalRecord> | null;
}

export const sendMessageToGemini = async (
  messages: ChatMessage[]
): Promise<GeminiResponse> => {
  try {
    const contents = mapMessagesToContent(messages);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Low temp for strict JSON adherence
      },
    });

    const rawText = response.text || "";

    // Regex to capture the custom json block
    const jsonRegex = /```json_patient_data\s*(\{[\s\S]*?\})\s*```/;
    const match = rawText.match(jsonRegex);

    let medicalRecord: Partial<MedicalRecord> | null = null;
    let finalText = rawText;

    if (match && match[1]) {
      try {
        medicalRecord = JSON.parse(match[1]);
        finalText = rawText.replace(match[0], "").trim();
      } catch (e) {
        console.error("Failed to parse extracted JSON", e);
      }
    } else {
      // Fallback for standard json block
      const fallbackRegex = /```json\s*(\{[\s\S]*?"risk_category"[\s\S]*?\})\s*```/;
      const fallbackMatch = rawText.match(fallbackRegex);
      if (fallbackMatch && fallbackMatch[1]) {
         try {
            medicalRecord = JSON.parse(fallbackMatch[1]);
            finalText = rawText.replace(fallbackMatch[0], "").trim();
         } catch (e) {
            console.error("Failed to parse fallback JSON", e);
         }
      }
    }

    return {
      text: finalText,
      medicalRecord,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
