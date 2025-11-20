import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBusinessInsight = async (metrics: any): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Bạn là một Quản lý Vận hành Hệ thống Smart Locker (Tủ khóa thông minh) cao cấp.
      Hãy phân tích dữ liệu JSON dưới đây từ hệ thống dashboard:
      ${JSON.stringify(metrics)}

      Dữ liệu bao gồm: Doanh thu, Tỷ lệ lấp đầy (Occupancy), Tình trạng pin, và Báo cáo lỗi phần cứng.
      
      Hãy cung cấp:
      1. Một tóm tắt ngắn gọn về tình trạng hệ thống (3 gạch đầu dòng).
      2. Một cảnh báo kỹ thuật nếu có (ví dụ: pin yếu, lỗi khóa).
      3. Một đề xuất chiến lược để tối ưu hóa vận hành hoặc bảo trì.

      Giữ giọng văn chuyên nghiệp, kỹ thuật nhưng dễ hiểu. Sử dụng định dạng HTML (<strong>, <ul>, <li>, <span class="text-red-600"> cho cảnh báo) để hiển thị trực tiếp.
      Không xuất markdown code block, chỉ xuất chuỗi HTML thô.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "<p>Không thể tạo báo cáo vào lúc này.</p>";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "<p>Lỗi kết nối tới dịch vụ AI. Vui lòng kiểm tra API Key.</p>";
  }
};