// Real-time Universal Knowledge Service for "Người Đồng Hành Số"
// Acts like Google Assistant answering general knowledge, science, history, geography, math, health & culture

interface QuickFact {
  keywords: string[];
  answer: string;
}

const INSTANT_FACTS: QuickFact[] = [
  // Capitals
  {
    keywords: ['thủ đô', 'pháp'],
    answer: 'Dạ thưa bác, thủ đô của nước Pháp là thành phố Paris – kinh đô ánh sáng nổi tiếng với tháp Eiffel và dòng sông Seine thơ mộng ạ.'
  },
  {
    keywords: ['thủ đô', 'việt nam'],
    answer: 'Dạ thưa bác, thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là Hà Nội, thành phố ngàn năm văn hiến với Hồ Gươm và 36 phố phường ạ.'
  },
  {
    keywords: ['thủ đô', 'nhật'],
    answer: 'Dạ thưa bác, thủ đô của Nhật Bản là Tokyo, một trong những đại đô thị sầm uất và hiện đại bậc nhất thế giới ạ.'
  },
  {
    keywords: ['thủ đô', 'mỹ'],
    answer: 'Dạ thưa bác, thủ đô của Hợp chúng quốc Hoa Kỳ (Mỹ) là Washington D.C., nơi đặt Nhà Trắng và Điện Capitol ạ.'
  },
  {
    keywords: ['thủ đô', 'hoa kỳ'],
    answer: 'Dạ thưa bác, thủ đô của Hợp chúng quốc Hoa Kỳ (Mỹ) là Washington D.C., nơi đặt Nhà Trắng và Điện Capitol ạ.'
  },
  {
    keywords: ['thủ đô', 'hàn quốc'],
    answer: 'Dạ thưa bác, thủ đô của Hàn Quốc là thành phố Seoul, nằm bên dòng sông Hàn ạ.'
  },
  {
    keywords: ['thủ đô', 'trung quốc'],
    answer: 'Dạ thưa bác, thủ đô của Trung Quốc là Bắc Kinh, nơi có Tử Cấm Thành và Quảng trường Thiên An Môn ạ.'
  },
  {
    keywords: ['thủ đô', 'anh'],
    answer: 'Dạ thưa bác, thủ đô của Vương quốc Anh là Luân Đôn (London), nổi tiếng với tháp đồng hồ Big Ben và sông Thames ạ.'
  },
  {
    keywords: ['thủ đô', 'nga'],
    answer: 'Dạ thưa bác, thủ đô của Liên bang Nga là Mát-xcơ-va (Moscow), nổi tiếng với Quảng trường Đỏ và điện Kremlin ạ.'
  },
  {
    keywords: ['thủ đô', 'thái lan'],
    answer: 'Dạ thưa bác, thủ đô của Thái Lan là Băng Cốc (Bangkok) ạ.'
  },

  // Astronomy & Science
  {
    keywords: ['mặt trời', 'cách', 'trái đất'],
    answer: 'Dạ thưa bác, Trái Đất cách Mặt Trời khoảng 149,6 triệu kilômét. Ánh sáng từ Mặt Trời mất khoảng 8 phút 20 giây để chiếu tới Trái Đất của chúng ta đấy ạ.'
  },
  {
    keywords: ['bao nhiêu', 'hành tinh'],
    answer: 'Dạ thưa bác, Hệ Mặt Trời của chúng ta có 8 hành tinh chính thức: Sao Thủy, Sao Kim, Trái Đất, Sao Hỏa, Sao Mộc, Sao Thổ, Sao Thiên Vương và Sao Hải Vương ạ.'
  },
  {
    keywords: ['bầu trời', 'màu xanh'],
    answer: 'Dạ thưa bác, bầu trời có màu xanh ban ngày là do hiện tượng tán xạ ánh sáng (tán xạ Rayleigh). Các phân tử khí trong khí quyển tán xạ ánh sáng màu xanh lam mạnh hơn nhiều so với các màu đỏ, cam, vàng ạ.'
  },
  {
    keywords: ['bóng đèn', 'phát minh'],
    answer: 'Dạ thưa bác, Thomas Edison là nhà phát minh nổi tiếng nhất đã hoàn thiện và thương mại hóa bóng đèn sợi đốt thành công vào năm 1879 ạ.'
  },

  // Vietnamese History & Culture
  {
    keywords: ['bác hồ', 'sinh'],
    answer: 'Dạ thưa bác, Chủ tịch Hồ Chí Minh kính yêu sinh ngày 19 tháng 5 năm 1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An ạ.'
  },
  {
    keywords: ['quốc khánh', 'việt nam'],
    answer: 'Dạ thưa bác, ngày Quốc khánh của nước ta là ngày 2 tháng 9 năm 1945, ngày Bác Hồ đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình ạ.'
  },
  {
    keywords: ['fansipan'],
    answer: 'Dạ thưa bác, đỉnh núi cao nhất Việt Nam là đỉnh Fansipan cao 3.143 mét tại Sa Pa, Lào Cai, được mệnh danh là Nóc nhà Đông Dương ạ.'
  },
  {
    keywords: ['cao nhất', 'việt nam'],
    answer: 'Dạ thưa bác, đỉnh núi cao nhất Việt Nam là đỉnh Fansipan cao 3.143 mét tại Sa Pa, Lào Cai, được mệnh danh là Nóc nhà Đông Dương ạ.'
  },

  // Elderly Health Tips
  {
    keywords: ['huyết áp', 'cao'],
    answer: 'Dạ thưa bác, khi bị huyết áp cao, bác nhớ nghỉ ngơi tĩnh dưỡng, tránh lo âu xúc động, hạn chế ăn muối, ăn nhạt hơn và uống thuốc huyết áp đều đặn mỗi sáng theo đơn của bác sĩ nhé ạ.'
  },
  {
    keywords: ['mất ngủ'],
    answer: 'Dạ thưa bác, để ngủ ngon hơn, buổi tối bác có thể ngâm chân với nước ấm pha chút muối hoặc gừng, uống một ly nước ấm ấm, nghe nhạc xưa êm dịu và không nên xem điện thoại sát giờ ngủ bác nhé.'
  },
  {
    keywords: ['tía tô'],
    answer: 'Dạ thưa bác, lá tía tô có tính ấm, giúp giải cảm, hạ sốt, làm dịu dạ dày và hỗ trợ giảm đau nhức xương khớp rất tốt trong y học cổ truyền Việt Nam ạ.'
  }
];

export class KnowledgeService {
  /**
   * Search Vietnamese Wikipedia for reliable general knowledge facts
   */
  async queryWikipedia(query: string): Promise<string | null> {
    try {
      // Clean query by removing common question filler phrases
      const cleaned = query
        .replace(/^(dạ\s+|cho\s+tôi\s+hỏi\s+|cho\s+bác\s+hỏi\s+|cháu\s+cho\s+bác\s+hỏi\s+|hỏi\s+chút\s+|cháu\s+ơi\s+)/i, '')
        .replace(/(là\s+gì|ở\s+đâu|khi\s+nào|như\s+thế\s+nào|thế\s+nào|mấy\s+giờ|bao\s+nhiêu|của\s+ai|do\s+ai|tại\s+sao|vì\s+sao)\s*[?.,!]*$/i, '')
        .replace(/[?.,!]/g, '')
        .trim();

      if (!cleaned || cleaned.length < 2) return null;

      // 1. Search Wikipedia
      const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleaned)}&format=json&utf8=&srlimit=3`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'NguoiDongHanhSo/1.0 (contact@nguoidonghanhso.vn)' }
      });

      if (!searchRes.ok) return null;
      const searchData: any = await searchRes.json();
      const hits = searchData?.query?.search;
      if (!hits || hits.length === 0) return null;

      // Pick best hit
      const firstHit = hits[0];
      if (!firstHit || !firstHit.title) return null;

      // 2. Fetch page summary extract
      const summaryUrl = `https://vi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstHit.title)}`;
      const summaryRes = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'NguoiDongHanhSo/1.0 (contact@nguoidonghanhso.vn)' }
      });

      if (!summaryRes.ok) return null;
      const summaryData: any = await summaryRes.json();
      if (summaryData && summaryData.extract) {
        // Return first 2 concise sentences
        const sentences = summaryData.extract.split(/(?<=[.?!])\s+/);
        const concise = sentences.slice(0, 2).join(' ');
        if (concise.length > 15) {
          return concise;
        }
      }
      return null;
    } catch (err) {
      console.warn('Wikipedia query error:', err);
      return null;
    }
  }

  /**
   * Evaluate simple everyday calculations (e.g. 50 cộng 30, 100 chia 4)
   */
  evaluateMath(query: string): string | null {
    const lower = query.toLowerCase();
    
    // Normalized text to math
    let expr = lower
      .replace(/cộng/g, '+')
      .replace(/trừ/g, '-')
      .replace(/nhân/g, '*')
      .replace(/chia/g, '/')
      .replace(/bằng\s*bao\s*nhiêu/g, '')
      .replace(/bằng\s*mấy/g, '')
      .replace(/là\s*mấy/g, '')
      .replace(/[?=]/g, '')
      .trim();

    // Match patterns like "15 + 25" or "100 / 4"
    const match = expr.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const num1 = parseFloat(match[1]);
      const op = match[2];
      const num2 = parseFloat(match[3]);
      let result = 0;

      if (op === '+') result = num1 + num2;
      else if (op === '-') result = num1 - num2;
      else if (op === '*') result = num1 * num2;
      else if (op === '/') {
        if (num2 === 0) return 'Dạ thưa bác, một số không thể chia cho số 0 được ạ!';
        result = num1 / num2;
      }

      // Round to 2 decimals if needed
      const displayResult = Number.isInteger(result) ? result : result.toFixed(2);
      return `Dạ thưa bác, kết quả phép tính ${num1} ${op === '+' ? 'cộng' : op === '-' ? 'trừ' : op === '*' ? 'nhân' : 'chia'} ${num2} bằng ${displayResult} ạ.`;
    }

    return null;
  }

  /**
   * Check Instant curated facts
   */
  checkInstantFacts(query: string): string | null {
    const lower = query.toLowerCase();
    for (const item of INSTANT_FACTS) {
      const matched = item.keywords.every(kw => lower.includes(kw));
      if (matched) {
        return item.answer;
      }
    }
    return null;
  }

  /**
   * Get answer to any general question
   */
  async answerUniversalQuestion(query: string): Promise<string | null> {
    // 1. Check math calculation
    const mathResult = this.evaluateMath(query);
    if (mathResult) return mathResult;

    // 2. Check instant facts
    const instantFact = this.checkInstantFacts(query);
    if (instantFact) return instantFact;

    // 3. Query Vietnamese Wikipedia for facts
    const wikiExtract = await this.queryWikipedia(query);
    if (wikiExtract) {
      return `Dạ thưa bác, theo kiến thức ghi nhận: ${wikiExtract} Bác có muốn hỏi thêm điều gì về chủ đề này không ạ?`;
    }

    return null;
  }
}

export const knowledgeService = new KnowledgeService();
