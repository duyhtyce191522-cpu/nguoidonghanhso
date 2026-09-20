import React, { useState, useEffect } from 'react';
import { NewsItem } from '../../types';
import { api } from '../../services/api';
import { speechService } from '../../services/speechService';
import {
  Newspaper,
  Volume2,
  Square,
  CloudSun,
  HeartPulse,
  ShieldAlert,
  Sparkles,
  Radio,
  RefreshCw,
  Clock,
  Play,
  CheckCircle2
} from 'lucide-react';

interface NewsReaderProps {
  newsList: NewsItem[];
}

export const NewsReader: React.FC<NewsReaderProps> = ({ newsList: initialNews }) => {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [isPlayingDigest, setIsPlayingDigest] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [digestText, setDigestText] = useState<string>('');

  useEffect(() => {
    if (initialNews && initialNews.length > 0) {
      setNews(initialNews);
    }
  }, [initialNews]);

  const getCategoryIcon = (category: NewsItem['category']) => {
    switch (category) {
      case 'weather': return <CloudSun size={18} color="#0284C7" />;
      case 'health': return <HeartPulse size={18} color="#059669" />;
      case 'tips': return <ShieldAlert size={18} color="#DC2626" />;
      default: return <Sparkles size={18} color="#D97706" />;
    }
  };

  const getCategoryName = (category: NewsItem['category']) => {
    switch (category) {
      case 'weather': return 'Thời Tiết';
      case 'health': return 'Sức Khỏe';
      case 'tips': return 'Cảnh Giác & Đời Sống';
      default: return 'Mẹo Sống Vui';
    }
  };

  // Refresh latest live news from RSS
  const handleRefreshNews = async () => {
    setIsRefreshing(true);
    try {
      const freshList = await api.getNews();
      if (freshList && freshList.length > 0) {
        setNews(freshList);
      }
    } catch (e) {
      console.warn("Could not refresh live news", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Play full Radio Audio News Digest
  const handlePlayDigest = async () => {
    if (isPlayingDigest) {
      speechService.stopSpeaking();
      setIsPlayingDigest(false);
      return;
    }

    // Stop any single article playback
    speechService.stopSpeaking();
    setReadingId(null);
    setIsPlayingDigest(true);

    try {
      let textToRead = digestText;
      if (!textToRead) {
        const res = await api.getNewsAudioDigest();
        if (res && res.text) {
          textToRead = res.text;
          setDigestText(res.text);
          if (res.items && res.items.length > 0) {
            setNews(res.items);
          }
        } else {
          textToRead = 'Dạ thưa bác, bản tin sức khỏe hôm nay: Bác sĩ khuyên người cao tuổi nên ăn nhạt bớt muối, uống đủ nước ấm rải đều trong ngày và giữ tinh thần vui vẻ để luôn mạnh khỏe ạ!';
        }
      }

      speechService.speak(textToRead, {
        onEnd: () => {
          setIsPlayingDigest(false);
        },
        onError: () => {
          setIsPlayingDigest(false);
        }
      });
    } catch (e) {
      console.error("Audio digest error", e);
      setIsPlayingDigest(false);
    }
  };

  // Play individual article
  const handleReadSingleArticle = (item: NewsItem) => {
    if (readingId === item.id) {
      speechService.stopSpeaking();
      setReadingId(null);
      return;
    }

    speechService.stopSpeaking();
    setIsPlayingDigest(false);
    setReadingId(item.id);

    const textToRead = `${item.title}. ${item.audioText || item.summary}`;
    speechService.speak(textToRead, {
      onEnd: () => {
        setReadingId(null);
      },
      onError: () => {
        setReadingId(null);
      }
    });
  };

  return (
    <div id="news-section" style={{ marginTop: '24px' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Newspaper size={24} color="#1E40AF" />
          <span>Bản Tin Sức Khỏe & Đời Sống Mỗi Ngày</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '8px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }}></span>
            Cập nhật trực tiếp
          </span>

          <button
            onClick={handleRefreshNews}
            disabled={isRefreshing}
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              padding: '6px 12px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: '#334155'
            }}
            title="Tải tin mới nhất hôm nay"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Mới nhất</span>
          </button>
        </div>
      </div>

      {/* Hero Radio News Broadcast Banner */}
      <div
        style={{
          background: isPlayingDigest
            ? 'linear-gradient(135deg, #1E3A8A 0%, #065F46 100%)'
            : 'linear-gradient(135deg, #1E40AF 0%, #047857 100%)',
          borderRadius: '22px',
          padding: '20px 18px',
          color: '#FFFFFF',
          marginBottom: '16px',
          boxShadow: '0 8px 24px rgba(30, 64, 175, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              <Radio size={14} />
              <span>ĐÀI PHÁT THANH ĐIỂM BÁO</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '2px 0 6px 0', lineHeight: 1.3 }}>
              Nghe Toàn Bộ Bản Tin Hôm Nay
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#E2E8F0', margin: 0, lineHeight: 1.4 }}>
              Hệ thống tự động chọn lọc các tin tức sức khỏe, cảnh giác và thời tiết mới nhất hôm nay để đọc to cho bác nghe như đài radio!
            </p>
          </div>

          {/* Soundwave animation if playing */}
          {isPlayingDigest && (
            <div className="audio-soundwave" style={{ alignSelf: 'center', padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
              <div className="soundwave-bar" style={{ background: '#FDE047' }}></div>
              <div className="soundwave-bar" style={{ background: '#FDE047' }}></div>
              <div className="soundwave-bar" style={{ background: '#FDE047' }}></div>
              <div className="soundwave-bar" style={{ background: '#FDE047' }}></div>
            </div>
          )}
        </div>

        {/* Big Action Button */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={handlePlayDigest}
            style={{
              background: isPlayingDigest ? '#DC2626' : '#FDE047',
              color: isPlayingDigest ? '#FFFFFF' : '#1E3A8A',
              border: 'none',
              borderRadius: '16px',
              padding: '14px 20px',
              fontSize: '1.08rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.2s ease',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            {isPlayingDigest ? (
              <>
                <Square size={20} fill="#FFFFFF" />
                <span>ĐANG PHÁT ĐIỂM BÁO • BẤM ĐỂ DỪNG</span>
              </>
            ) : (
              <>
                <Volume2 size={22} />
                <span>📻 BẤM ĐỂ NGHE ĐỌC ĐIỂM BÁO HÔM NAY</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* News List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {news.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#FFFFFF',
              border: readingId === item.id ? '2px solid #1E40AF' : '2px solid #E2E8F0',
              borderRadius: '20px',
              padding: '18px',
              boxShadow: readingId === item.id ? '0 8px 20px rgba(30, 64, 175, 0.15)' : '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#F1F5F9',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#1E293B'
              }}>
                {getCategoryIcon(item.category)}
                {getCategoryName(item.category)}
              </span>

              <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                <span>{item.source} • {item.date}</span>
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '6px 0 8px 0', lineHeight: 1.35 }}>
              {item.title}
            </h3>

            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6, marginBottom: '14px' }}>
              {item.summary}
            </p>

            <button
              onClick={() => handleReadSingleArticle(item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: readingId === item.id ? '#FEE2E2' : '#EFF6FF',
                color: readingId === item.id ? '#DC2626' : '#1D4ED8',
                fontSize: '0.96rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {readingId === item.id ? (
                <>
                  <Square size={16} fill="#DC2626" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} />
                  <span>🔊 Bấm để nghe đọc bài này</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
