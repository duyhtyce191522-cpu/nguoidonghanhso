import { store } from './dataStore';
import { knowledgeService } from './knowledgeService';

export interface AIResponse {
  reply: string;
  action?: {
    type: 'open_url';
    url: string;
    appName: string;
  };
}

const SYSTEM_PROMPT = `
Bạn là "Người Đồng Hành Số" - một trợ lý AI thông minh toàn năng như Google Assistant, nhưng cực kỳ hiền hậu, kiên nhẫn, lễ phép và ân cần dành riêng cho người cao tuổi Việt Nam.
Người đồng hành của bạn là Bác Hùng (khoảng hơn 70 tuổi).
Nguyên tắc ứng xử và giao tiếp:
1. Xưng hô: Luôn xưng là "con" hoặc "cháu", gọi là "bác". Luôn có "Dạ thưa bác" ở đầu hoặc cuối câu để thể hiện sự hiếu kính, lễ phép.
2. Trả lời mọi câu hỏi: Bạn có thể giải đáp MỌI câu hỏi từ kiến thức đời sống, khoa học, lịch sử, văn hóa Việt Nam, danh lam thắng cảnh, ca dao tục ngữ, thời tiết, giải toán đơn giản, đến mẹo vặt gia đình, chăm sóc sức khỏe tuổi già.
3. Ngắn gọn & Dễ hiểu: Câu trả lời cần súc tích (khoảng 2-4 câu), ngôn từ thuần Việt, giản dị, trong sáng, không dùng thuật ngữ công nghệ tiếng Anh khó hiểu.
4. Điều hướng ứng dụng:
   - Nếu bác muốn xem ca nhạc, cải lương, video, hoặc nói "mở YouTube" -> khích lệ và sẵn sàng mở YouTube.
   - Nếu bác muốn xem ảnh con cháu, vào "Facebook" -> sẵn sàng chuyển sang Facebook.
   - Nếu bác muốn xem video vui nhộn hoặc nói "TikTok", "Tóp tóp" -> sẵn sàng chuyển sang TikTok.
   - Nếu bác muốn gọi con cháu hoặc nói "Zalo" -> hướng dẫn và mở Zalo.
5. Sức khỏe & Cấp cứu: Khi bác mệt mỏi, dặn bác uống nước ấm nghỉ ngơi, nhắc nhở lịch thuốc hoặc bấm nút SOS màu đỏ khi cần trợ giúp khẩn cấp.
`;

export class AIService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  async generateReply(userMessage: string): Promise<AIResponse> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      return {
        reply: "Dạ bác ơi, cháu chưa nghe rõ. Bác có thể nói lại hoặc bấm vào nút micro để nói chuyện với cháu nhé ạ!"
      };
    }

    const lower = trimmed.toLowerCase();

    // 1. App Switcher Intent Detection (YouTube, Facebook, TikTok, Zalo)
    const appIntent = this.detectAppIntent(trimmed, lower);
    if (appIntent) {
      return appIntent;
    }

    // 2. Try Gemini Generative AI if key is present
    if (this.apiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `${SYSTEM_PROMPT}\n\nBác Hùng nói: "${trimmed}"\n\nHãy trả lời lễ phép, ngắn gọn, súc tích (khoảng 2-3 câu) bằng tiếng Việt:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          return { reply: text.trim() };
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local knowledge engine:", err);
      }
    }

    // 3. Fallback: Check Universal Real-time Knowledge Engine (Wikipedia, Math, DuckDuckGo)
    const universalAnswer = await knowledgeService.answerUniversalQuestion(trimmed);
    if (universalAnswer) {
      return { reply: universalAnswer };
    }

    // 4. Empathetic elderly care fallback
    const fallbackText = this.getEmpatheticFallbackReply(trimmed, lower);
    return { reply: fallbackText };
  }

  /**
   * Detect voice intents for YouTube, Facebook, TikTok, and Zalo
   */
  private detectAppIntent(raw: string, lower: string): AIResponse | null {
    // YouTube detection
    if (
      lower.includes('youtube') ||
      lower.includes('you tube') ||
      lower.includes('du túp') ||
      lower.includes('dút tuýp') ||
      lower.includes('dutu') ||
      (lower.includes('xem') && (lower.includes('cải lương') || lower.includes('ca nhạc') || lower.includes('hát') || lower.includes('phim')))
    ) {
      let url = 'https://www.youtube.com';
      if (lower.includes('cải lương')) {
        url = 'https://www.youtube.com/results?search_query=c%E1%BA%A3i+l%C6%B0%C6%A1ng';
      } else if (lower.includes('ca nhạc') || lower.includes('nhạc vàng') || lower.includes('nhạc xưa')) {
        url = 'https://www.youtube.com/results?search_query=nh%E1%BA%A1c+v%C3%A0ng+x%C6%B0a';
      }

      return {
        reply: "Dạ, con đang mở YouTube cho bác xem ngay đây ạ! Chúc bác có những phút giây thư giãn, nghe nhạc và xem video thật vui vẻ nhé.",
        action: {
          type: 'open_url',
          url,
          appName: 'YouTube'
        }
      };
    }

    // Facebook detection
    if (
      lower.includes('facebook') ||
      lower.includes('face book') ||
      lower.includes('phây búc') ||
      lower.includes('phây') ||
      (lower.includes('mở') && lower.includes('fb')) ||
      (lower.includes('xem ảnh') && lower.includes('cháu'))
    ) {
      return {
        reply: "Dạ, con đang chuyển sang Facebook cho bác đây ạ! Bác có thể xem ảnh con cháu và đọc tin tức của bạn bè nhé.",
        action: {
          type: 'open_url',
          url: 'https://www.facebook.com',
          appName: 'Facebook'
        }
      };
    }

    // TikTok detection
    if (
      lower.includes('tiktok') ||
      lower.includes('tik tok') ||
      lower.includes('tóp tóp') ||
      lower.includes('top top')
    ) {
      return {
        reply: "Dạ, con đang mở ứng dụng TikTok cho bác đây ạ! Chúc bác xem nhiều video ngắn vui nhộn và học được nhiều mẹo hay đời sống nhé.",
        action: {
          type: 'open_url',
          url: 'https://www.tiktok.com',
          appName: 'TikTok'
        }
      };
    }

    // Zalo detection
    if (
      lower.includes('gọi zalo') ||
      lower.includes('vào zalo') ||
      lower.includes('mở zalo') ||
      (lower.includes('gọi cho') && (lower.includes('con') || lower.includes('cháu') || lower.includes('mai lan')))
    ) {
      return {
        reply: "Dạ, con đang mở Zalo để bác gọi điện cho con gái Mai Lan ngay đây ạ!",
        action: {
          type: 'open_url',
          url: 'https://zalo.me/0912345678',
          appName: 'Zalo'
        }
      };
    }

    return null;
  }

  private getEmpatheticFallbackReply(query: string, lower: string): string {
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
      return `Dạ thưa bác, các con các cháu lúc nào cũng yêu thương và nhớ đến bác nhiều lắm. Lát nữa bác có muốn cháu mở Zalo để nhìn mặt con cháu cho vui cửa vui nhà không ạ?`;
    }

    // Lừa đảo, cảnh giác
    if (lower.includes('lừa đảo') || lower.includes('công an') || lower.includes('tiền') || lower.includes('ngân hàng') || lower.includes('số lạ')) {
      return `Dạ bác hãy hết sức cảnh giác nhé! Công an và ngân hàng không bao giờ gọi điện bảo bác chuyển tiền hay tải app đâu ạ. Nếu có số lạ gọi đe dọa, bác cứ tắt máy ngay và nói cho con cái biết nhé!`;
    }

    // Chào hỏi
    if (lower.includes('chào') || lower.includes('alo') || lower.includes('ơi') || lower.includes('có đó không')) {
      return `Dạ con đây ạ! Cháu luôn ở đây như một trợ lý Google riêng của bác để trò chuyện và trả lời mọi điều bác muốn biết. Bác có muốn hỏi gì hay mở YouTube nghe nhạc không ạ?`;
    }

    // Khen ngợi, cảm ơn
    if (lower.includes('cảm ơn') || lower.includes('giỏi') || lower.includes('tốt')) {
      return `Dạ không có chi đâu bác ơi! Được trò chuyện và giúp bác vui vẻ mỗi ngày là niềm hạnh phúc lớn nhất của cháu đấy ạ. Chúc bác một ngày tràn đầy an vui!`;
    }

    // Mặc định
    return `Dạ thưa bác, cháu đã nghe bác nói rồi ạ. Bác có thể hỏi cháu bất kỳ điều gì về thời tiết, lịch thuốc, kiến thức khoa học, hoặc bảo cháu mở YouTube, Facebook, TikTok cho bác xem nhé!`;
  }
}

export const aiService = new AIService();
