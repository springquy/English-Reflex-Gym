
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateAnswerWithAI = async (userInput: string, question: Question): Promise<{ isCorrect: boolean, feedback: string }> => {
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Evaluation failed:", error);
    // Fallback if AI fails
    return { isCorrect: false, feedback: "AI không phản hồi, đang sử dụng kiểm tra tự động." };
  }
};
