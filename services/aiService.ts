
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const evaluateAnswerWithAI = async (
  userInput: string, 
  question: Question, 
  userApiKey?: string
): Promise<{ isCorrect: boolean, feedback: string }> => {
  
  // Ưu tiên key từ settings, sau đó mới đến env
  const apiKey = userApiKey || process.env.API_KEY;

  // Fallback nếu không có key nào
  if (!apiKey) {
    return { 
      isCorrect: false, 
      feedback: "Chưa có API Key. Vui lòng vào Cài đặt để nhập Key miễn phí." 
    };
  }

  try {
    // Khởi tạo instance mới mỗi lần gọi để đảm bảo dùng đúng key mới nhất
    const ai = new GoogleGenAI({ apiKey });

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
                - Accepted Variations: ${JSON.stringify(question.variations || [])}
                
                Learner's Input: "${userInput}"

                Evaluation Logic:
                1. **Meaning**: Does the learner convey the correct meaning? (e.g. "purchase" vs "buy" is OK).
                2. **Grammar**: 
                   - Level '${question.level || 'Medium'}': ${question.level === 'Hard' ? 'Strict grammar check.' : 'Minor grammar slips allowed if meaning is clear.'}
                
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

  } catch (error: any) {
    console.error("AI Error:", error);
    
    // Check lỗi API key không hợp lệ
    if (error.toString().includes("API_KEY_INVALID") || error.status === 400) {
       return { isCorrect: false, feedback: "API Key không hợp lệ. Vui lòng kiểm tra lại trong Cài đặt." };
    }

    return { isCorrect: false, feedback: "Lỗi kết nối AI. Đang dùng bộ chấm điểm cơ bản." };
  }
};
