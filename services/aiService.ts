import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

// Sử dụng biến môi trường cho API Key
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const evaluateAnswerWithAI = async (userInput: string, question: Question): Promise<{ isCorrect: boolean, feedback: string }> => {
  // Fallback nếu không có key hoặc lỗi khởi tạo
  if (!ai) {
    return { 
      isCorrect: false, 
      feedback: "Offline Mode: Câu trả lời chưa khớp chính xác với đáp án mẫu." 
    };
  }

  try {
    // Sử dụng model Flash để tốc độ nhanh nhất và miễn phí
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isCorrect", "feedback"]
        },
        systemInstruction: "You are an English teacher. Your goal is to determine if the student's spoken answer is semantically equivalent to the target answer, even if the wording is different. Be encouraging."
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                Compare the Learner's answer to the Target answer.

                Context:
                - Vietnamese Meaning: "${question.vietnamese}"
                - Target Answer: "${question.main_answer}"
                - Accepted Variations: ${JSON.stringify(question.variations)}
                
                Learner's Input: "${userInput}"

                Evaluation Logic:
                1. **Meaning**: Does the learner convey the correct meaning? (e.g. "purchase" vs "buy" is OK).
                2. **Grammar**: 
                   - Level '${question.level}': ${question.level === 'Hard' ? 'Strict grammar check.' : 'Minor grammar slips allowed if meaning is clear.'}
                
                Return JSON:
                - isCorrect: true/false
                - feedback: A short explanation in Vietnamese (max 15 words). If correct, praise them. If wrong, explain the error.
              `
            }
          ]
        }
      ]
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Error:", error);
    // Fallback an toàn để app không crash
    return { isCorrect: false, feedback: "Lỗi kết nối AI, vui lòng thử lại." };
  }
};