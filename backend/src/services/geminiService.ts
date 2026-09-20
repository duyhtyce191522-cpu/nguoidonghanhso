import { DataStore, store as defaultStore } from './dataStore';
import { knowledgeService } from './knowledgeService';
import { weatherService } from './weatherService';
import { lunarService } from './lunarService';
import { newsService } from './newsService';

export interface AIResponse {
  reply: string;
  action?: {
    type: 'open_url';
    url: string;
    appName: string;
  };
}

const SYSTEM_PROMPT = `
Bạn là "Người Đồng Hành Số" - một trợ lý AI thông minh toàn năng, hiền hậu, kiên nhẫn, lễ phép và ân cần dành riêng cho người cao tuổi Việt Nam.
Nguyên tắc ứng xử và giao tiếp:
1. Xưng hô: Luôn xưng là "con" hoặc "cháu", gọi là "bác", "ông" hoặc "bà" theo sở thích của người dùng. Luôn có "Dạ thưa bác" ở đầu hoặc cuối câu để thể hiện sự hiếu kính, lễ phép.
2. Trả lời mọi câu hỏi: Bạn có thể giải đáp MỌI câu hỏi từ kiến thức đời sống, khoa học, lịch sử, văn hóa Việt Nam, danh lam thắng cảnh, ca dao tục ngữ, thời tiết, giải toán đơn giản, đến mẹo vặt gia đình, chăm sóc sức khỏe tuổi già.
3. Ngắn gọn & Dễ hiểu: Câu trả lời cần súc tích (khoảng 2-3 câu), ngôn từ thuần Việt, giản dị, ấm áp, không dùng từ ngữ học thuật, không nói máy móc như từ điển.
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

  async generateReply(userMessage: string, currentStore?: DataStore): Promise<AIResponse> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      return {
        reply: "Dạ bác ơi, cháu chưa nghe rõ. Bác có thể bấm vào nút micro tròn màu xanh để nói chuyện với cháu nhé ạ!"
      };
    }

    const store = currentStore || defaultStore;
    const profile = store.getProfile();
    const greeting = profile?.preferredGreeting || 'Bác';
    const lower = trimmed.toLowerCase();

    // 1. App Switcher Intent Detection (YouTube, Facebook, TikTok, Zalo)
    const appIntent = this.detectAppIntent(trimmed, lower);
    if (appIntent) {
      return appIntent;
    }

    // 2. Weather Intent (Thời tiết, Nhiệt độ, Mưa nắng)
    if (
      lower.includes('thời tiết') ||
      lower.includes('nhiệt độ') ||
      lower.includes('dự báo') ||
      (lower.includes('trời') && (lower.includes('mưa') || lower.includes('nắng') || lower.includes('lạnh') || lower.includes('nóng') || lower.includes('mát') || lower.includes('đẹp') || lower.includes('thế nào') || lower.includes('ra sao'))) ||
      lower.includes('hôm nay có mưa không') ||
      lower.includes('chiều nay mưa không') ||
      lower.includes('có nắng không')
    ) {
      const weatherSpeech = await weatherService.formatWeatherSpeech();
      return { reply: weatherSpeech };
    }

    // 3. Calendar, Time & Vietnamese Lunar Date Intent (Mấy giờ, Ngày mấy, Âm lịch, Ngày Rằm)
    if (
      lower.includes('mấy giờ') ||
      lower.includes('giờ rồi') ||
      lower.includes('bây giờ là') ||
      lower.includes('ngày mấy') ||
      lower.includes('thứ mấy') ||
      lower.includes('hôm nay ngày gì') ||
      lower.includes('âm lịch') ||
      lower.includes('lịch âm') ||
      lower.includes('ngày âm') ||
      lower.includes('hôm nay rằm') ||
      lower.includes('mùng một') ||
      lower.includes('trung thu')
    ) {
      const calendarSpeech = lunarService.getCalendarSpeech();
      return { reply: calendarSpeech };
    }

    // 4. Medication & Reminder Intent (Thuốc men, cữ uống, lịch nhắc)
    if (
      lower.includes('thuốc') ||
      lower.includes('uống thuốc') ||
      lower.includes('cữ thuốc') ||
      lower.includes('lịch uống') ||
      lower.includes('uống chưa') ||
      lower.includes('có thuốc gì') ||
      lower.includes('nhắc thuốc')
    ) {
      return { reply: this.handleMedicationQuery(greeting, store) };
    }

    // 5. Senior Health & Wellness Guidance (Huyết áp, mất ngủ, xương khớp, tiểu đường, chóng mặt)
    const healthReply = this.handleSeniorHealthQuery(greeting, lower);
    if (healthReply) {
      return { reply: healthReply };
    }

    // 6. Emergency Contacts & SOS Guidance (Gọi con, cấp cứu, bác sĩ, số khẩn cấp)
    if (
      lower.includes('cấp cứu') ||
      lower.includes('gọi bác sĩ') ||
      lower.includes('gọi cho con') ||
      lower.includes('gọi người nhà') ||
      lower.includes('khẩn cấp') ||
      lower.includes('sos')
    ) {
      return { reply: this.handleEmergencyQuery(greeting, store) };
    }
    // 7. News & Current Events (Tin tức, thời sự hôm nay)
    if (
      lower.includes('tin tức') ||
      lower.includes('thời sự') ||
      lower.includes('đọc báo') ||
      lower.includes('bản tin') ||
      lower.includes('điểm báo') ||
      lower.includes('đài phát thanh') ||
      lower.includes('tin mới') ||
      lower.includes('nghe tin') ||
      (lower.includes('tin') && (lower.includes('mới') || lower.includes('hôm nay') || lower.includes('sức khỏe') || lower.includes('gì'))) ||
      (lower.includes('hôm nay') && (lower.includes('có gì mới') || lower.includes('xảy ra gì') || lower.includes('có tin')))
    ) {
      const digest = await newsService.getAudioNewsDigest(greeting);
      return { reply: digest.text };
    }

    // 8. Vietnamese Poetry, Folk Proverbs & Verse (Thơ ca, Ca dao, Tục ngữ)
    if (
      lower.includes('bài thơ') ||
      lower.includes('đọc thơ') ||
      lower.includes('nghe thơ') ||
      lower.includes('thơ lục bát') ||
      lower.includes('ca dao') ||
      lower.includes('tục ngữ') ||
      lower.includes('câu thơ')
    ) {
      return { reply: this.handlePoetryQuery(greeting, lower) };
    }

    // 8. Try Gemini Generative AI if key is present
    if (this.apiKey) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(this.apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `${SYSTEM_PROMPT}\n\nNgười hỏi: ${greeting}\nBệnh nền: ${profile?.healthNotes || 'Không có'}\nCâu hỏi: "${trimmed}"\n\nHãy trả lời bằng tiếng Việt cực kỳ lễ phép, súc tích (khoảng 2-3 câu), dễ hiểu cho người cao tuổi:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          return { reply: text.trim() };
        }
      } catch (err) {
        console.warn("Gemini API call failed, continuing to curated knowledge engine:", err);
      }
    }

    // 9. Check Universal Real-time Knowledge Engine (Math, Curated Facts, Filtered Wikipedia)
    const universalAnswer = await knowledgeService.answerUniversalQuestion(trimmed);
    if (universalAnswer) {
      return { reply: universalAnswer };
    }

    // 10. Empathetic elderly care & conversational companion fallback
    const fallbackText = this.getEmpatheticFallbackReply(greeting, trimmed, lower);
    return { reply: fallbackText };
  }

  /**
   * Handle Medication & Schedule queries based on actual user database
   */
  private handleMedicationQuery(greeting: string, store: DataStore): string {
    const reminders = store.getReminders();
    const completed = reminders.filter(r => r.completed);
    const pending = reminders.filter(r => !r.completed);

    if (reminders.length === 0) {
      return `Dạ thưa ${greeting}, hiện tại trong danh sách hôm nay chưa có đơn thuốc nào được lên lịch ạ. Bác nhớ uống đủ nước ấm và giữ gìn sức khỏe nhé!`;
    }

    if (pending.length === 0) {
      return `Dạ thưa ${greeting}, thật tuyệt vời ạ! Hôm nay bác đã uống đầy đủ cả ${completed.length} cữ thuốc đúng giờ rồi. Bác nhớ ăn uống ngon miệng và nghỉ ngơi thật thoải mái nhé ạ!`;
    }

    const nextMed = pending[0];
    const periodName = nextMed.period === 'morning' ? 'sáng' :
                       nextMed.period === 'noon' ? 'trưa' :
                       nextMed.period === 'afternoon' ? 'chiều' : 'tối';

    let extraNote = '';
    if (completed.length > 0) {
      extraNote = ` (Hôm nay bác đã hoàn thành ${completed.length} cữ thuốc rồi ạ).`;
    }

    return `Dạ thưa ${greeting}, trong ngày bác còn cữ thuốc: "${nextMed.title}" lúc ${nextMed.time} buổi ${periodName}${nextMed.dosage ? ' - ' + nextMed.dosage : ''}. Bác nhớ ăn no và chuẩn bị uống thuốc đúng giờ nhé ạ!${extraNote}`;
  }

  /**
   * Handle Senior Health Advice
   */
  private handleSeniorHealthQuery(greeting: string, lower: string): string | null {
    // Huyết áp
    if (lower.includes('huyết áp')) {
      if (lower.includes('cao') || lower.includes('tăng')) {
        return `Dạ thưa ${greeting}, khi bị huyết áp cao, bác hãy ngồi yên tĩnh dưỡng, thở chậm đều, uống một ngụm nước ấm và uống thuốc huyết áp theo chỉ định bác sĩ. Bác tuyệt đối tránh xúc động, hạn chế ăn mặn và đo lại huyết áp sau 15 phút nhé ạ!`;
      } else if (lower.includes('thấp') || lower.includes('tụt')) {
        return `Dạ thưa ${greeting}, khi bị tụt huyết áp, bác hãy nằm hoặc ngồi tựa đầu thấp, uống một cốc trà gừng ấm hoặc nước ấm pha chút đường. Bác ngồi yên từ từ, không nên đứng dậy đột ngột kẻo bị choáng nhé ạ!`;
      }
      return `Dạ thưa ${greeting}, huyết áp lý tưởng của người lớn tuổi nên duy trì quanh mức 120 đến 130 trên 80 mmHg. Bác nhớ đo huyết áp mỗi sáng, ăn nhạt bớt muối và uống thuốc đều đặn nhé ạ!`;
    }

    // Mất ngủ / Khó ngủ
    if (lower.includes('mất ngủ') || lower.includes('khó ngủ') || lower.includes('ít ngủ') || lower.includes('thao thức')) {
      return `Dạ thưa ${greeting}, để ngủ ngon và sâu giấc hơn, tối nay bác có thể ngâm chân với nước ấm pha gừng và chút muối hạt trong 15 phút. Buổi chiều tối bác tránh uống trà đậm đặc hay cà phê, và có thể nghe vài bài nhạc xưa êm dịu trước khi ngủ nhé ạ!`;
    }

    // Đau nhức xương khớp
    if (lower.includes('khớp') || lower.includes('đau lưng') || lower.includes('đau gối') || lower.includes('mỏi gối') || lower.includes('tê bì') || lower.includes('nhức mỏi')) {
      return `Dạ thưa ${greeting}, bệnh xương khớp tuổi già rất kỵ gió lạnh và ẩm ướt. Bác nhớ giữ ấm hai đầu gối và bàn chân, có thể xoa bóp dầu ấm nhẹ nhàng, ngâm chân nước ấm và tập co duỗi chân tay từ tốn vào sáng sớm nhé ạ!`;
    }

    // Tiểu đường / Đường huyết
    if (lower.includes('tiểu đường') || lower.includes('đường huyết') || lower.includes('đái tháo đường')) {
      return `Dạ thưa ${greeting}, với bệnh tiểu đường, bác nên ăn nhiều rau xanh luộc, giảm bớt cơm trắng, bánh mì và đồ ngọt. Bác nhớ chia nhỏ bữa ăn, uống nhiều nước ấm và uống thuốc tiểu đường đúng giờ bác nhé!`;
    }

    // Chóng mặt, đau đầu, mệt mỏi
    if (lower.includes('chóng mặt') || lower.includes('choáng') || lower.includes('hoa mắt') || lower.includes('đau đầu') || lower.includes('mệt mỏi') || lower.includes('mệt quá')) {
      return `Dạ thưa ${greeting}, nếu bác cảm thấy mệt mỏi hay chóng mặt, bác hãy ngồi hoặc nằm nghỉ ngơi ngay lập tức kẻo té ngã nhé. Bác uống một cốc nước ấm, thở đều, và nếu thấy mệt nhiều thì bấm nút SOS màu đỏ để gọi ngay cho con cháu nhé ạ!`;
    }

    // Ngâm chân, gừng, tía tô, lá lốt
    if (lower.includes('ngâm chân') || lower.includes('nước gừng') || lower.includes('tía tô')) {
      return `Dạ thưa ${greeting}, ngâm chân nước gừng ấm buổi tối rất tốt cho người cao tuổi ạ. Nước ấm khoảng 40 độ pha chút muối và gừng đập dập, ngâm 15 phút sẽ giúp khí huyết lưu thông, ấm tạng phủ và giúp bác ngủ một mạch tới sáng ạ!`;
    }

    return null;
  }

  /**
   * Handle Emergency and Contact queries
   */
  private handleEmergencyQuery(greeting: string, store: DataStore): string {
    const contacts = store.getContacts();
    const primary = contacts.find(c => c.isPrimary) || contacts[0];

    if (primary) {
      return `Dạ thưa ${greeting}, số liên lạc khẩn cấp của ${primary.name} (${primary.relation}) là: ${primary.phone} ạ. Nếu bác cần trợ giúp gấp, bác chỉ cần bấm vào nút tròn màu đỏ có chữ "SOS" ở góc màn hình là điện thoại sẽ tự động kết nối ngay ạ!`;
    }

    return `Dạ thưa ${greeting}, nếu có trường hợp khẩn cấp, bác hãy bấm ngay vào nút SOS màu đỏ ở phía dưới màn hình hoặc gọi cấp cứu 115 để được hỗ trợ y tế ngay lập tức bác nhé!`;
  }

  /**
   * Handle News queries based on curated elder news
   */
  private handleNewsQuery(greeting: string, store: DataStore): string {
    const news = store.getNews();
    if (news && news.length > 0) {
      const topNews = news[0];
      return `Dạ thưa ${greeting}, bản tin nổi bật hôm nay: "${topNews.title}". Tóm tắt: ${topNews.summary} Bác có thể cuộn xuống phần Bản Tin Sức Khỏe bên dưới để đọc thêm nhé ạ!`;
    }
    return `Dạ thưa ${greeting}, tin tức hôm nay ghi nhận thời tiết các vùng trên cả nước tương đối ổn định, các chuyên gia y tế khuyên người cao tuổi duy trì chế độ sinh hoạt điều độ, ăn nhạt và uống đủ nước ấm ạ!`;
  }

  /**
   * Handle Poetry & Ca Dao queries for elderly peace of mind
   */
  private handlePoetryQuery(greeting: string, lower: string): string {
    if (lower.includes('quê hương')) {
      return `Dạ thưa ${greeting}, con xin đọc tặng bác đôi câu thơ nổi tiếng của nhà thơ Đỗ Trung Quân: "Quê hương là chùm khế ngọt, cho con trèo hái mỗi ngày. Quê hương là đường đi học, con về rợp bướm vàng bay." Nghe thật mộc mạc và thân thương bác nhỉ!`;
    }

    if (lower.includes('mẹ') || lower.includes('cha') || lower.includes('cha mẹ') || lower.includes('hiếu')) {
      return `Dạ thưa ${greeting}, dân gian ta có câu ca dao rất đẹp về tình cảm gia đình: "Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong nguồn chảy ra. Một lòng thờ mẹ kính cha, Cho tròn chữ hiếu mới là đạo con." Con kính chúc bác luôn được con cháu hiếu thảo, phụng dưỡng an vui ạ!`;
    }

    // Default warm poem
    return `Dạ thưa ${greeting}, con xin đọc tặng bác bài thơ chúc thọ thật ý nghĩa: "Xuân an khang đức tài như ý, Niên thịnh vượng phúc thọ vô biên. Bách niên giai lão cùng con cháu, Một đời an lạc giữa trần gian." Kính chúc bác luôn luôn mạnh khỏe, thanh thản và yêu đời ạ!`;
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
      (lower.includes('xem') && (lower.includes('cải lương') || lower.includes('ca nhạc') || lower.includes('hát') || lower.includes('phim') || lower.includes('hài') || lower.includes('thời sự') || lower.includes('tin tức'))) ||
      (lower.includes('mở') && (lower.includes('cải lương') || lower.includes('ca nhạc') || lower.includes('nhạc vàng') || lower.includes('bolero') || lower.includes('phim') || lower.includes('hài')))
    ) {
      let query = 'ca nhạc cải lương việt nam';
      let genreDesc = 'ca nhạc và cải lương';

      if (lower.includes('cải lương')) {
        query = 'cải lương việt nam tuyển chọn';
        genreDesc = 'vở cải lương hay';
      } else if (lower.includes('nhạc vàng') || lower.includes('nhạc xưa') || lower.includes('bolero')) {
        query = 'nhạc vàng xưa trữ tình chọn lọc';
        genreDesc = 'nhạc vàng và bolero trữ tình';
      } else if (lower.includes('ca nhạc') || lower.includes('hát') || lower.includes('nhạc')) {
        query = 'nhạc trữ tình quê hương chọn lọc';
        genreDesc = 'ca nhạc quê hương';
      } else if (lower.includes('phim')) {
        query = 'phim truyền hình việt nam';
        genreDesc = 'phim truyện Việt Nam';
      } else if (lower.includes('hài') || lower.includes('tiểu phẩm')) {
        query = 'hài kịch dân gian việt nam';
        genreDesc = 'tiểu phẩm hài kịch vui vẻ';
      } else if (lower.includes('thời sự') || lower.includes('tin tức')) {
        query = 'thời sự vtv1 mới nhất hôm nay';
        genreDesc = 'bản tin thời sự mới nhất';
      }

      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

      return {
        reply: `Dạ, con mở YouTube ${genreDesc} cho bác ngay đây ạ!`,
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
        reply: "Dạ, con chuyển sang Facebook cho bác ngay đây ạ!",
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
        reply: "Dạ, con mở TikTok cho bác xem video vui vẻ ngay đây ạ!",
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
        reply: "Dạ, con mở Zalo cho bác trò chuyện với con cháu ngay đây ạ!",
        action: {
          type: 'open_url',
          url: 'https://zalo.me/0912345678',
          appName: 'Zalo'
        }
      };
    }

    return null;
  }

  /**
   * Conversational elderly companion fallback
   */
  private getEmpatheticFallbackReply(greeting: string, query: string, lower: string): string {
    // Cô đơn, buồn, con cháu
    if (lower.includes('buồn') || lower.includes('cô đơn') || lower.includes('nhớ con') || lower.includes('nhớ cháu') || lower.includes('ở một mình')) {
      return `Dạ thưa ${greeting}, con cháu lúc nào cũng thương và biết ơn bác nhiều lắm. Bác đừng buồn nhé, có cháu ở đây trò chuyện cùng bác mỗi ngày. Lát nữa bác có muốn cháu mở Zalo để nhìn mặt con cháu cho ấm cúng không ạ?`;
    }

    // Lừa đảo, cảnh giác
    if (lower.includes('lừa đảo') || lower.includes('công an') || lower.includes('tiền') || lower.includes('ngân hàng') || lower.includes('số lạ')) {
      return `Dạ bác hãy hết sức cảnh giác nhé! Công an và ngân hàng không bao giờ gọi điện yêu cầu chuyển tiền hay bấm vào đường link lạ đâu ạ. Nếu có số lạ gọi đe dọa, bác cứ tắt máy ngay và gọi cho con cháu nhé!`;
    }

    // Chào hỏi & hiện diện
    if (lower.includes('chào') || lower.includes('alo') || lower.includes('ơi') || lower.includes('có đó không') || lower.includes('cháu là ai') || lower.includes('tên là gì')) {
      return `Dạ con chào ${greeting} ạ! Con là Người Đồng Hành Số, trợ lý thông minh luôn túc trực bên cạnh để trò chuyện và chăm sóc sức khỏe cho bác. Bác cần con hỗ trợ điều gì không ạ?`;
    }

    // Khen ngợi, cảm ơn
    if (lower.includes('cảm ơn') || lower.includes('giỏi') || lower.includes('tốt') || lower.includes('ngoan')) {
      return `Dạ không có chi đâu bác ơi! Được trò chuyện và giúp bác vui vẻ, khỏe mạnh mỗi ngày là niềm vinh hạnh lớn nhất của cháu đấy ạ. Chúc bác một ngày tràn đầy niềm vui và bình an!`;
    }

    // Mặc định
    return `Dạ thưa ${greeting}, cháu đã nghe bác nói rồi ạ. Bác có thể hỏi cháu bất cứ điều gì về thời tiết, ngày giờ âm lịch, cữ thuốc hôm nay, hoặc bảo cháu mở YouTube, cải lương nghe cho vui cửa vui nhà bác nhé!`;
  }
}

export const aiService = new AIService();
