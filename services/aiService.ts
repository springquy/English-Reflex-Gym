
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Initialize safely. If no key is provided, ai instance will be null.
const apiKey = process.env.API_KEY;
const ai = (apiKey && apiKey.length > 0) ? new GoogleGenAI({ apiKey }) : null;

export const evaluateAnswerWithAI = async (userInput: string, question: Question): Promise<{ isCorrect: boolean, feedback: string }> => {
  // If AI is not configured, fallback to a safe default response
  if (!ai) {
    console.warn("AI Key missing. Skipping AI evaluation.");
    return { 
      isCorrect: false, 
      feedback: "Chưa cấu hình API Key, sử dụng kiểm tra cơ bản." 
    };
  }

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
    // Fallback if AI fails
    return { isCorrect: false, feedback: "AI không phản hồi, đang sử dụng kiểm tra tự động." };
  }
};
