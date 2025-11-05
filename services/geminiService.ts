// FIX: The import for "@google/genai" is a package import, not a relative path. The comment has been removed.
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from '../types';

const getGeminiService = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getSpendingAnalysis = async (transactions: Transaction[]): Promise<string> => {
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);

  if (expenses.length === 0) {
    return "Không có dữ liệu chi tiêu để phân tích. Hãy thêm một vài khoản chi trước nhé.";
  }

  const ai = getGeminiService();

  const formattedExpenses = expenses.map(e => 
    `- ${e.title}: ${e.amount.toLocaleString('vi-VN')} VND (Loại: ${e.category}, Ngày: ${new Date(e.date).toLocaleDateString('vi-VN')})`
  ).join('\n');

  const prompt = `
    Dựa trên danh sách chi tiêu sau đây bằng đơn vị VND, hãy đóng vai một chuyên gia tài chính cá nhân và đưa ra phân tích chi tiết cùng lời khuyên hữu ích bằng tiếng Việt.

    Phân tích nên bao gồm:
    1.  **Tóm tắt tổng quan**: Tổng chi tiêu và nhận xét chung về thói quen chi tiêu.
    2.  **Phân tích theo danh mục**: Danh mục nào chiếm tỷ trọng lớn nhất? Có điểm nào bất thường không?
    3.  **Lời khuyên cụ thể**: Đưa ra 2-3 gợi ý rõ ràng, thực tế để tối ưu hóa chi tiêu hoặc tiết kiệm tiền. Ví dụ: "Bạn đang chi tiêu nhiều cho việc ăn ngoài, hãy thử nấu ăn tại nhà 3 lần một tuần để tiết kiệm."
    4.  **Đánh giá tích cực**: Tìm một điểm tốt trong thói quen chi tiêu (nếu có) để khuyến khích.

    Định dạng phản hồi bằng Markdown. Sử dụng tiêu đề, danh sách và in đậm để dễ đọc.

    **Dữ liệu chi tiêu:**
    ${formattedExpenses}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // FIX: Simplified `contents` for a text-only prompt as per Gemini API guidelines.
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting analysis from Gemini:", error);
    return "Đã xảy ra lỗi khi phân tích chi tiêu của bạn. Vui lòng thử lại sau.";
  }
};