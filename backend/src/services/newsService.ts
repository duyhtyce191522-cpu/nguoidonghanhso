import { NewsItem } from '../types';

interface CachedNews {
  items: NewsItem[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

const DEFAULT_CURATED_NEWS: NewsItem[] = [
  {
    id: "news-health-1",
    title: "Chế độ ăn và thói quen vàng giúp kiểm soát huyết áp cho người cao tuổi",
    summary: "Các chuyên gia y tế khuyên người lớn tuổi nên ăn nhạt, tăng cường rau củ quả, uống nước ấm từng ngụm nhỏ và duy trì vận động nhẹ nhàng mỗi sáng.",
    category: "health",
    date: "Hôm nay",
    source: "Báo Sức Khỏe & Đời Sống",
    audioText: "Thưa bác, các bác sĩ khuyến cáo người cao tuổi nên ăn nhạt bớt muối, ăn nhiều rau luộc và duy trì uống đủ nước ấm rải đều trong ngày để huyết áp luôn ổn định nhé ạ."
  },
  {
    id: "news-health-2",
    title: "Mẹo ngâm chân nước gừng ấm buổi tối giúp lưu thông khí huyết và ngủ sâu",
    summary: "Nước ấm khoảng 40 độ pha chút muối biển và gừng tươi đập dập, ngâm 15 phút trước khi đi ngủ giúp làm ấm kinh mạch, giảm tê bì chân tay và ngủ ngon tới sáng.",
    category: "health",
    date: "Hôm nay",
    source: "Y Học Cổ Truyền",
    audioText: "Tối nay bác có thể bảo người nhà chuẩn bị một chậu nước ấm pha gừng và chút muối để ngâm chân 15 phút trước khi đi ngủ, vừa ấm tạng phủ vừa ngủ rất ngon giấc ạ."
  },
  {
    id: "news-tips-1",
    title: "Cảnh giác: Thủ đoạn giả danh cơ quan nhà nước đe dọa qua điện thoại",
    summary: "Cơ quan công an và ngân hàng không bao giờ làm việc hay yêu cầu chuyển tiền qua điện thoại. Khi có số lạ gọi đến hù dọa, bác hãy tắt máy ngay và thông báo cho con cái.",
    category: "tips",
    date: "Hôm qua",
    source: "Cổng Thông Tin An Ninh Mạng",
    audioText: "Bác lưu ý giúp cháu: Nếu có số điện thoại lạ gọi đến xưng là công an đòi tiền hay bảo bấm vào đường link, bác hãy cúp máy ngay và gọi cho con cháu nhé!"
  },
  {
    id: "news-weather-1",
    title: "Thời tiết hôm nay: Không khí trong lành, nắng dịu thích hợp vận động nhẹ",
    summary: "Nhiệt độ các vùng dao động dễ chịu, độ ẩm ôn hòa. Người cao tuổi nên tập thể dục dưỡng sinh vào sáng sớm hoặc đi dạo vào chiều mát.",
    category: "weather",
    date: "Hôm nay",
    source: "Trung Tâm Dự Báo Khí Tượng",
    audioText: "Thời tiết hôm nay rất đẹp, trời nắng dịu và thoáng mát. Chiều nay bác có thể ra sân hít thở khí trời và đi dạo 15 phút cho khoan khoái gân cốt nhé ạ."
  }
];

export class NewsService {
  private cache: CachedNews | null = null;

  /**
   * Fetch latest live news from Vietnamese RSS feeds
   */
  async fetchLiveNews(): Promise<NewsItem[]> {
    // Check if cache is still fresh
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.cache.items;
    }

    try {
      const feeds = [
        { url: 'https://vnexpress.net/rss/suc-khoe.rss', category: 'health' as const, source: 'VnExpress Sức Khỏe' },
        { url: 'https://vnexpress.net/rss/doi-song.rss', category: 'life' as const, source: 'VnExpress Đời Sống' },
        { url: 'https://vnexpress.net/rss/thoi-su.rss', category: 'tips' as const, source: 'VnExpress Thời Sự' }
      ];

      const feedPromises = feeds.map(async (feed) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) return [];
          const xml = await res.text();
          return this.parseRssItems(xml, feed.category, feed.source);
        } catch (e) {
          console.warn(`Could not fetch RSS from ${feed.source}:`, e);
          return [];
        }
      });

      const results = await Promise.all(feedPromises);
      const combined = results.flat();

      if (combined.length >= 3) {
        // Sort and select top curated news
        const curated = combined.slice(0, 8);
        this.cache = {
          items: curated,
          fetchedAt: Date.now()
        };
        return curated;
      }
    } catch (err) {
      console.warn("Error fetching live RSS news, using curated backup:", err);
    }

    // Fallback to rich curated elder news
    return DEFAULT_CURATED_NEWS;
  }

  /**
   * Parse RSS XML into clean NewsItem objects
   */
  private parseRssItems(xml: string, category: NewsItem['category'], source: string): NewsItem[] {
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    const parsed: NewsItem[] = [];

    for (let i = 0; i < Math.min(items.length, 4); i++) {
      const itemXml = items[i];
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemXml.match(/<title>(.*?)<\/title>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemXml.match(/<description>(.*?)<\/description>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);

      const title = titleMatch ? titleMatch[1].trim() : '';
      let summary = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      // Skip empty or too short items
      if (!title || summary.length < 15) continue;

      // Clean CDATA artifacts
      summary = summary.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");

      // Format date
      let dateStr = 'Hôm nay';
      if (pubDateMatch) {
        try {
          const d = new Date(pubDateMatch[1]);
          dateStr = d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' });
        } catch (e) {}
      }

      parsed.push({
        id: `rss-${category}-${Date.now()}-${i}`,
        title,
        summary,
        category,
        date: dateStr,
        source,
        audioText: `Thưa bác, ${title}. Cụ thể là: ${summary}`
      });
    }

    return parsed;
  }

  /**
   * Generate an affectionate, radio-style Audio Digest for the elderly to listen to
   */
  async getAudioNewsDigest(greeting = 'Bác'): Promise<{ text: string; items: NewsItem[] }> {
    const news = await this.fetchLiveNews();
    const topItems = news.slice(0, 3);

    const intro = `Dạ con chào ${greeting} ạ! Con xin phép đọc điểm bản tin mới nhất hôm nay cho bác nghe nhé:`;

    const bulletins = topItems.map((item, idx) => {
      const order = idx === 0 ? 'Tin thứ nhất' : idx === 1 ? 'Tin thứ hai' : 'Tin thứ ba';
      return `${order}, về ${item.category === 'health' ? 'sức khỏe' : item.category === 'tips' ? 'đời sống cảnh giác' : 'xã hội'}: "${item.title}". Tóm tắt: ${item.summary}`;
    }).join(' ');

    const outro = `Đó là những tin tức đáng chú ý nhất hôm nay. Con kính chúc ${greeting} một ngày thật vui vẻ, an lành và dồi dào sức khỏe ạ!`;

    const fullDigestText = `${intro} ${bulletins} ${outro}`;

    return {
      text: fullDigestText,
      items: news
    };
  }
}

export const newsService = new NewsService();
