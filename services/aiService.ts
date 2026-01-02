
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Khởi tạo client an toàn. Nếu không có Key, biến ai sẽ là null.
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const evaluateAnswerWithAI = async (userInput: string, question: Question): Promise<{ isCorrect: boolean, feedback: string }> => {
  // 1. Kiểm tra nếu không có API Key (Chế độ Offline)
  if (!ai) {
    console.warn("AI Service: Missing API Key. Returning offline fallback.");
    return { 
      isCorrect: false, 
      feedback: "Chưa chính xác. (Nhập API Key để AI phân tích lỗi sai cụ thể hơn)." 
    };
  }

  // 2. Nếu có Key thì gọi AI như bình thường
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Assess the correctness of an English learner's response.
        Vietnamese Question: "${question.vietnamese}"
        Target Answer: "${question.main_answer}"
        Variations allowed: ${question.variations.join(", ")}
        User's Response: "${userInput}"

        Rules:
        1. If the meaning is identical or very close to the target, mark as correct even if grammar is slightly imperfect.
        2. If it's completely wrong or nonsensical, mark as incorrect.
        3. Provide a very brief constructive feedback (1 sentence) in Vietnamese.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING, description: "Feedback in Vietnamese" }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    // Fallback nếu gọi AI bị lỗi mạng hoặc quota
    return { isCorrect: false, feedback: "AI đang bận, vui lòng thử lại hoặc kiểm tra kết nối mạng." };
  }
};
