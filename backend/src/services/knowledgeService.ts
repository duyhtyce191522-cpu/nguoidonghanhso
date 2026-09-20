// Real-time Universal Knowledge Service for "Người Đồng Hành Số"
// Answers general knowledge, science, history, geography, math, Vietnamese culture & classic poetry

interface QuickFact {
  keywords: string[];
  answer: string;
}

const INSTANT_FACTS: QuickFact[] = [
  // Capitals & Geography
  {
    keywords: ['thủ đô', 'pháp'],
    answer: 'Dạ thưa bác, thủ đô của nước Pháp là thành phố Paris – kinh đô ánh sáng nổi tiếng với tháp Eiffel và dòng sông Seine thơ mộng ạ.'
  },
  {
    keywords: ['thủ đô', 'việt nam'],
    answer: 'Dạ thưa bác, thủ đô của nước Việt Nam ta là Hà Nội ngàn năm văn hiến, với Tháp Rùa Hồ Gươm và ba mươi sáu phố phường cổ kính ạ.'
  },
  {
    keywords: ['thủ đô', 'nhật'],
    answer: 'Dạ thưa bác, thủ đô của Nhật Bản là Tokyo, một thành phố hiện đại và rất ngăn nắp, sạch đẹp ạ.'
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
    answer: 'Dạ thưa bác, thủ đô của Hàn Quốc là thành phố Seoul, nằm êm đềm bên dòng sông Hàn ạ.'
  },
  {
    keywords: ['thủ đô', 'trung quốc'],
    answer: 'Dạ thưa bác, thủ đô của Trung Quốc là Bắc Kinh, nơi có Cố Cung Tử Cấm Thành và Vạn Lý Trường Thành nổi tiếng ạ.'
  },
  {
    keywords: ['thủ đô', 'anh'],
    answer: 'Dạ thưa bác, thủ đô của nước Anh là Luân Đôn (London), nổi tiếng với tháp đồng hồ Big Ben và dòng sông Thames thơ mộng ạ.'
  },
  {
    keywords: ['thủ đô', 'nga'],
    answer: 'Dạ thưa bác, thủ đô của Liên bang Nga là Mát-xcơ-va (Moscow), nổi tiếng với Quảng trường Đỏ và điện Kremlin cổ kính ạ.'
  },
  {
    keywords: ['thủ đô', 'thái lan'],
    answer: 'Dạ thưa bác, thủ đô của Thái Lan là Băng Cốc (Bangkok), xứ sở chùa Vàng ạ.'
  },

  // Vietnamese History & Culture
  {
    keywords: ['bác hồ', 'sinh'],
    answer: 'Dạ thưa bác, Bác Hồ kính yêu sinh ngày 19 tháng 5 năm 1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An ạ.'
  },
  {
    keywords: ['quốc khánh', 'việt nam'],
    answer: 'Dạ thưa bác, ngày Quốc khánh của nước ta là ngày 2 tháng 9 năm 1945, ngày Bác Hồ đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình lịch sử ạ.'
  },
  {
    keywords: ['fansipan'],
    answer: 'Dạ thưa bác, đỉnh núi cao nhất Việt Nam là đỉnh Fansipan cao 3.143 mét tại Sa Pa, tỉnh Lào Cai, được mệnh danh là Nóc nhà Đông Dương ạ.'
  },
  {
    keywords: ['núi', 'cao nhất'],
    answer: 'Dạ thưa bác, đỉnh núi cao nhất Việt Nam là đỉnh Fansipan cao 3.143 mét tại Sa Pa, Lào Cai, được mệnh danh là Nóc nhà Đông Dương ạ.'
  },
  {
    keywords: ['sông', 'dài nhất', 'việt nam'],
    answer: 'Dạ thưa bác, con sông dài nhất chảy hoàn toàn trong lãnh thổ Việt Nam là sông Đồng Nai (dài 586 km). Còn con sông lớn nhất chảy qua nước ta là sông Mê Kông hùng vĩ ạ.'
  },
  {
    keywords: ['vịnh hạ long'],
    answer: 'Dạ thưa bác, Vịnh Hạ Long thuộc tỉnh Quảng Ninh, là di sản thiên nhiên thế giới được UNESCO công nhận với hàng nghìn hòn đảo đá vôi kỳ vĩ trên làn nước xanh ngọc bích ạ.'
  },

  // Famous Vietnamese Poems
  {
    keywords: ['bài thơ', 'quê hương'],
    answer: 'Dạ thưa bác, cháu xin đọc tặng bác câu thơ nổi tiếng của nhà thơ Đỗ Trung Quân: "Quê hương là chùm khế ngọt, cho con trèo hái mỗi ngày. Quê hương là đường đi học, con về rợp bướm vàng bay." Nghe thật thân thương và ấm lòng bác nhỉ!'
  },
  {
    keywords: ['đọc thơ'],
    answer: 'Dạ thưa bác, cháu xin đọc tặng bác đôi câu thơ chúc thọ thật ý nghĩa: "Xuân an khang đức tài như ý, Niên thịnh vượng phúc thọ vô biên." Con kính chúc bác luôn an vui, mạnh khỏe bên con cháu ạ!'
  },
  {
    keywords: ['ca dao'],
    answer: 'Dạ thưa bác, dân gian ta có câu ca dao rất đẹp về công ơn cha mẹ: "Công cha như núi Thái Sơn, Nghĩa mẹ như nước trong nguồn chảy ra. Một lòng thờ mẹ kính cha, Cho tròn chữ hiếu mới là đạo con." ạ.'
  },

  // Science & Astronomy
  {
    keywords: ['mặt trời', 'cách', 'trái đất'],
    answer: 'Dạ thưa bác, Trái Đất cách Mặt Trời khoảng 149,6 triệu kilômét. Ánh sáng từ Mặt Trời mất khoảng 8 phút 20 giây để chiếu tới Trái Đất của chúng ta đấy ạ.'
  },
  {
    keywords: ['bao nhiêu', 'hành tinh'],
    answer: 'Dạ thưa bác, Hệ Mặt Trời của chúng ta có 8 hành tinh: Sao Thủy, Sao Kim, Trái Đất, Sao Hỏa, Sao Mộc, Sao Thổ, Sao Thiên Vương và Sao Hải Vương ạ.'
  },
  {
    keywords: ['bầu trời', 'màu xanh'],
    answer: 'Dạ thưa bác, bầu trời có màu xanh ban ngày là do bầu khí quyển tán xạ ánh sáng màu xanh lam từ mặt trời mạnh hơn các màu khác, tạo nên màu trời trong xanh êm đềm ạ.'
  },
  {
    keywords: ['bóng đèn', 'phát minh'],
    answer: 'Dạ thưa bác, nhà bác học Thomas Edison là người đã hoàn thiện và phổ biến chiếc bóng đèn điện chiếu sáng đầu tiên cho nhân loại vào năm 1879 ạ.'
  },
  {
    keywords: ['mặt trăng', 'đầu tiên'],
    answer: 'Dạ thưa bác, phi hành gia Neil Armstrong người Mỹ là người đầu tiên đặt chân lên Mặt Trăng vào ngày 20 tháng 7 năm 1969 trên con tàu Apollo 11 ạ.'
  }
];

// Blacklist topics that should NEVER be answered using Wikipedia academic articles
const WIKI_BLACKLIST = [
  'thời tiết', 'nhiệt độ', 'trời', 'mưa', 'nắng', 'gió', 'dự báo',
  'mấy giờ', 'giờ', 'ngày', 'tháng', 'năm', 'thứ', 'âm lịch', 'dương lịch', 'hôm nay',
  'thuốc', 'uống', 'huyết áp', 'tiểu đường', 'khớp', 'mất ngủ', 'ngủ', 'chóng mặt', 'đau',
  'mệt', 'cảm', 'sốt', 'ngâm chân',
  'chào', 'alo', 'tên gì', 'ai đó', 'bác sĩ', 'con gái', 'con trai',
  'buồn', 'cô đơn', 'nhớ', 'vui',
  'zalo', 'youtube', 'facebook', 'tiktok', 'gọi', 'mở'
];

export class KnowledgeService {
  /**
   * Search Vietnamese Wikipedia for genuine general knowledge facts
   */
  async queryWikipedia(query: string): Promise<string | null> {
    try {
      const lower = query.toLowerCase();

      // If query matches any blacklisted senior conversational topic, do NOT query Wikipedia
      const isBlacklisted = WIKI_BLACKLIST.some(kw => lower.includes(kw));
      if (isBlacklisted) {
        return null;
      }

      // Clean query by removing common question filler phrases
      const cleaned = query
        .replace(/^(dạ\s+|cho\s+tôi\s+hỏi\s+|cho\s+bác\s+hỏi\s+|cháu\s+cho\s+bác\s+hỏi\s+|hỏi\s+chút\s+|cháu\s+ơi\s+|bác\s+muốn\s+biết\s+|cho\s+hỏi\s+)/i, '')
        .replace(/(là\s+gì|ở\s+đâu|khi\s+nào|như\s+thế\s+nào|thế\s+nào|mấy\s+giờ|bao\s+nhiêu|của\s+ai|do\s+ai|tại\s+sao|vì\s+sao)\s*[?.,!]*$/i, '')
        .replace(/[?.,!]/g, '')
        .trim();

      if (!cleaned || cleaned.length < 2) return null;

      // 1. Search Wikipedia
      const searchUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleaned)}&format=json&utf8=&srlimit=2`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'NguoiDongHanhSo/1.0 (contact@nguoidonghanhso.vn)' }
      });

      if (!searchRes.ok) return null;
      const searchData: any = await searchRes.json();
      const hits = searchData?.query?.search;
      if (!hits || hits.length === 0) return null;

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
        // Clean citations, parentheses with phonetics or dates like (sinh ngày..., tiếng Anh:...)
        let rawExtract = summaryData.extract
          .replace(/\[\d+\]/g, '')
          .replace(/\s*\([^)]*(?:tiếng|sinh|phát âm|hán tự)[^)]*\)/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim();

        // Take up to first 2 concise sentences
        const sentences = rawExtract.split(/(?<=[.?!])\s+/);
        let concise = sentences.slice(0, 2).join(' ').trim();

        if (concise.length > 20 && concise.length < 320) {
          return `Dạ thưa bác, về ${firstHit.title}, cháu xin chia sẻ với bác là: ${concise}`;
        }
      }
      return null;
    } catch (err) {
      console.warn('Wikipedia query error:', err);
      return null;
    }
  }

  /**
   * Evaluate simple everyday calculations (e.g. 50 nghìn cộng 35 nghìn, 100 chia 4)
   */
  evaluateMath(query: string): string | null {
    const lower = query.toLowerCase();

    // Check if it looks like a math expression
    if (!lower.includes('cộng') && !lower.includes('trừ') && !lower.includes('nhân') && !lower.includes('chia') && !lower.match(/[\+\-\*\/]/)) {
      return null;
    }

    const match = lower.match(/(\d+(?:\.\d+)?)\s*(nghìn|ngàn|triệu)?\s*(cộng|trừ|nhân|chia|[\+\-\*\/])\s*(\d+(?:\.\d+)?)\s*(nghìn|ngàn|triệu)?/);
    if (match) {
      const num1 = parseFloat(match[1]);
      const unit1 = match[2];
      const opRaw = match[3];
      const num2 = parseFloat(match[4]);
      const unit2 = match[5];

      let op = opRaw;
      if (op === 'cộng') op = '+';
      else if (op === 'trừ') op = '-';
      else if (op === 'nhân') op = '*';
      else if (op === 'chia') op = '/';

      let result = 0;
      if (op === '+') result = num1 + num2;
      else if (op === '-') result = num1 - num2;
      else if (op === '*') result = num1 * num2;
      else if (op === '/') {
        if (num2 === 0) return 'Dạ thưa bác, một số không thể chia cho số 0 được ạ!';
        result = num1 / num2;
      }

      const displayResult = Number.isInteger(result) ? result.toLocaleString('vi-VN') : result.toFixed(2);
      const opWord = op === '+' ? 'cộng' : op === '-' ? 'trừ' : op === '*' ? 'nhân' : 'chia';
      const unit = (unit1 || unit2) ? ` ${unit1 || unit2}` : '';
      return `Dạ thưa bác, kết quả phép tính ${num1.toLocaleString('vi-VN')}${unit} ${opWord} ${num2.toLocaleString('vi-VN')}${unit} bằng ${displayResult}${unit} ạ.`;
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

    // 3. Query Vietnamese Wikipedia for facts (only if not blacklisted)
    const wikiExtract = await this.queryWikipedia(query);
    if (wikiExtract) {
      return wikiExtract;
    }

    return null;
  }
}

export const knowledgeService = new KnowledgeService();
