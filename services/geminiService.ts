
import { GoogleGenAI, Type } from "@google/genai";
import { ConversationSuggestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    loiChao: {
      type: Type.STRING,
      description: 'Câu gợi ý súc tích, tự nhiên để bắt đầu cuộc trò chuyện. Viết bằng tiếng Việt.'
    },
    phanTich: {
      type: Type.STRING,
      description: 'Phân tích chi tiết tại sao lời chào này lại phù hợp và hiệu quả trong bối cảnh đã cho, giải thích về mặt tâm lý và giao tiếp. Viết bằng tiếng Việt.'
    },
    hieuLamCoTheXayRa: {
      type: Type.STRING,
      description: 'Phân tích những hiểu lầm tiềm ẩn có thể xảy ra khi sử dụng lời chào này và gợi ý cách phòng tránh. Viết bằng tiếng Việt.'
    }
  },
  required: ['loiChao', 'phanTich', 'hieuLamCoTheXayRa']
};

export const getConversationStarter = async (
  speakerInfo: string,
  audienceInfo: string,
  context: string,
  goal: string
): Promise<ConversationSuggestion> => {
  try {
    const prompt = `
      Dựa trên các thông tin sau, hãy tạo ra một gợi ý bắt đầu cuộc trò chuyện:

      1.  **Thông tin về người nói:** ${speakerInfo}
      2.  **Thông tin về đối tượng giao tiếp:** ${audienceInfo}
      3.  **Bối cảnh cuộc trò chuyện:** ${context}
      4.  **Mục đích cuộc trò chuyện:** ${goal}

      Hãy cung cấp câu trả lời của bạn dưới dạng một đối tượng JSON tuân thủ theo schema đã được định nghĩa. Đảm bảo toàn bộ nội dung trong JSON đều bằng tiếng Việt.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.8,
        topP: 0.9,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    return parsedResponse as ConversationSuggestion;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Không thể tạo gợi ý. Vui lòng thử lại. Lỗi: ${error.message}`);
    }
    throw new Error("Không thể tạo gợi ý. Một lỗi không xác định đã xảy ra.");
  }
};
