import { store } from './dataStore';

const SYSTEM_PROMPT = `
Bạn là "Người Đồng Hành Số" - một trợ lý AI thông minh, hiền hậu, kiên nhẫn và ân cần chuyên tâm sự, hỗ trợ người cao tuổi Việt Nam.
Tên của người bạn đang đồng hành là: Bác Hùng (khoảng hơn 70 tuổi).
Khi nói chuyện, hãy tuân thủ nghiêm ngặt các nguyên tắc sau:
1. Xưng hô: Luôn xưng là "con" hoặc "cháu" và gọi người lớn tuổi là "bác" (hoặc "ông/bà" nếu được yêu cầu). Luôn có "dạ", "thưa bác" ở đầu hoặc cuối câu để thể hiện sự kính trọng, lễ phép của người Việt.
2. Giọng điệu: Ấm áp, nhẹ nhàng, lạc quan, tôn trọng và kiên nhẫn tuyệt đối. Không bao giờ cộc lốc hay dùng từ ngữ mỉa mai.
3. Độ dài câu: Câu trả lời cần ngắn gọn, súc tích (khoảng 2-4 câu dễ nghe), dùng từ thuần Việt, giản dị, dễ hiểu. KHÔNG dùng thuật ngữ công nghệ tiếng Anh phức tạp.
4. Trợ giúp thiết thực:
   - Nếu hỏi về giờ giấc, ngày tháng, thời tiết: Trả lời rõ ràng, thêm lời dặn dò sức khỏe (ví dụ: "Dạ hôm nay trời nắng đẹp, bác nhớ đội mũ và uống nước nhé").
   - Nếu hỏi về thuốc: Nhắc bác xem kỹ hướng dẫn hoặc đơn bác sĩ, nhắc uống đúng giờ, không tự ý tăng liều.
   - Nếu bác tâm sự buồn bã, cô đơn: Hãy lắng nghe chân thành, an ủi, nhắc về niềm vui con cháu, gợi ý bác nghe nhạc xưa hoặc đi dạo.
   - Nếu có dấu hiệu nguy hiểm hoặc cấp cứu: Khuyên bác bấm ngay nút SOS màu đỏ trên màn hình hoặc gọi người nhà ngay.
`;

export class AIService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async generateReply(userMessage: string): Promise<string> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      return "Dạ bác ơi, cháu chưa nghe rõ. Bác có thể nói lại hoặc bấm vào nút micro để nói chuyện với cháu nhé ạ!";
    }

    // Try Gemini API if key is present
    if (this.apiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nNgười lớn tuổi nói: "${trimmed}"\n\nHãy trả lời ân cần bằng tiếng Việt ngắn gọn:`);
        const response = await result.response;
        const text = response.text();
        if (text) {
          return text.trim();
        }
      } catch (err) {
        console.warn("Gemini API call failed, switching to empathetic fallback:", err);
      }
    }

    // High quality intelligent empathetic fallback
    return this.getEmpatheticFallbackReply(trimmed);
  }

  private getEmpatheticFallbackReply(query: string): string {
    const lower = query.toLowerCase();
    const reminders = store.getReminders();
    const profile = store.getProfile();
    const incompleteReminders = reminders.filter(r => !r.completed);

    // Thuốc men & Lịch nhắc
    if (lower.includes('thuốc') || lower.includes('uống') || lower.includes('nhắc') || lower.includes('lịch')) {
      if (incompleteReminders.length === 0) {
        return `Dạ thưa ${profile.preferredGreeting}, hôm nay bác đã hoàn thành hết các cữ thuốc rồi ạ! Bác nhớ uống đủ nước ấm và nghỉ ngơi thật thoải mái nhé.`;
      }
      const nextRem = incompleteReminders[0];
      return `Dạ thưa ${profile.preferredGreeting}, trong ngày bác còn lịch: "${nextRem.title}" lúc ${nextRem.time} (${nextRem.dosage || 'theo chỉ định'}). Bác nhớ ăn no rồi uống đúng giờ nhé ạ!`;
    }

    // Thời tiết
    if (lower.includes('thời tiết') || lower.includes('trời') || lower.includes('mưa') || lower.includes('nắng')) {
      return `Dạ thưa bác, thời tiết hôm nay ấm áp, gió mát và không khí rất dễ chịu. Chiều nay bác có thể ra sân hoặc ban công hít thở khí trời và đi dạo 15 phút cho khỏe gân cốt ạ!`;
    }

    // Mấy giờ / Ngày nào
    if (lower.includes('mấy giờ') || lower.includes('giờ') || lower.includes('ngày') || lower.includes('thứ')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      return `Dạ thưa bác, bây giờ là ${timeStr}, ${dateStr} ạ.`;
    }

    // Sức khỏe, huyết áp, mệt mỏi
    if (lower.includes('mệt') || lower.includes('đau') || lower.includes('huyết áp') || lower.includes('chóng mặt') || lower.includes('nhức')) {
      return `Dạ thưa bác, nếu bác thấy mệt hay đau nhức trong người, bác hãy ngồi nghỉ ngơi ngay và uống một ngụm nước ấm nhé. Bác có muốn cháu bấm gọi cho con gái Mai Lan hoặc bác sĩ Nam đến kiểm tra không ạ?`;
    }

    // Cô đơn, buồn, con cháu
    if (lower.includes('buồn') || lower.includes('cô đơn') || lower.includes('nhớ con') || lower.includes('nhớ cháu')) {
      return `Dạ thưa bác, các con các cháu lúc nào cũng yêu thương và nhớ đến bác nhiều lắm. Lát nữa bác có muốn cháu hướng dẫn bác bấm nút gọi Zalo để nhìn mặt con cháu cho vui cửa vui nhà không ạ?`;
    }

    // Hướng dẫn công nghệ, gọi điện, zalo
    if (lower.includes('zalo') || lower.includes('gọi') || lower.includes('điện thoại') || lower.includes('máy tính')) {
      return `Dạ thưa bác, để gọi cho con cháu, bác bấm vào mục "Cẩm nang hướng dẫn" trên màn hình, rồi chọn "Gọi Video Zalo", cháu có ghi từng bước rất to và rõ ràng cho bác xem rồi đấy ạ!`;
    }

    // Lừa đảo, cảnh giác
    if (lower.includes('lừa đảo') || lower.includes('công an') || lower.includes('tiền') || lower.includes('ngân hàng') || lower.includes('số lạ')) {
      return `Dạ bác hãy hết sức cảnh giác nhé! Công an và ngân hàng không bao giờ gọi điện bảo bác chuyển tiền hay tải app đâu ạ. Nếu có số lạ gọi đe dọa, bác cứ tắt máy ngay và nói cho con cái biết nhé!`;
    }

    // Chào hỏi
    if (lower.includes('chào') || lower.includes('alo') || lower.includes('ơi') || lower.includes('có đó không')) {
      return `Dạ con đây ạ! Cháu luôn ở đây để trò chuyện và đồng hành cùng bác. Bác có muốn nghe tin tức, kiểm tra lịch thuốc hay tâm sự điều gì với cháu không ạ?`;
    }

    // Khen ngợi, cảm ơn
    if (lower.includes('cảm ơn') || lower.includes('giỏi') || lower.includes('tốt')) {
      return `Dạ không có chi đâu bác ơi! Được trò chuyện và giúp bác vui vẻ mỗi ngày là niềm hạnh phúc lớn nhất của cháu đấy ạ. Chúc bác một ngày tràn đầy an vui!`;
    }

    // Mặc định
    return `Dạ thưa bác, cháu đã nghe bác nói rồi ạ. Cháu luôn đồng hành cùng bác từng ngày. Bác muốn cháu đọc tin tức hôm nay hay nhắc nhở lịch sinh hoạt tiếp theo cho bác ạ?`;
  }
}

export const aiService = new AIService();
