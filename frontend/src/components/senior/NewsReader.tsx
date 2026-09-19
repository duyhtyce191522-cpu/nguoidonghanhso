import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { speechService } from '../../services/speechService';
import { Newspaper, Volume2, Square, CloudSun, HeartPulse, ShieldAlert, Sparkles } from 'lucide-react';

interface NewsReaderProps {
  newsList: NewsItem[];
}

export const NewsReader: React.FC<NewsReaderProps> = ({ newsList }) => {
  const [readingId, setReadingId] = useState<string | null>(null);

  const getCategoryIcon = (category: NewsItem['category']) => {
    switch (category) {
      case 'weather': return <CloudSun size={20} color="#0284C7" />;
      case 'health': return <HeartPulse size={20} color="#059669" />;
      case 'tips': return <ShieldAlert size={20} color="#DC2626" />;
      default: return <Sparkles size={20} color="#D97706" />;
    }
  };

  const getCategoryName = (category: NewsItem['category']) => {
    switch (category) {
      case 'weather': return 'Thời Tiết';
      case 'health': return 'Sức Khỏe';
      case 'tips': return 'Cảnh Giác';
      default: return 'Mẹo Sống Vui';
    }
  };

  const handleReadNews = (item: NewsItem) => {
    if (readingId === item.id) {
      speechService.stopSpeaking();
      setReadingId(null);
      return;
    }

    speechService.stopSpeaking();
    setReadingId(item.id);

    const fullTextToRead = `${item.title}. ${item.audioText || item.summary}`;
    speechService.speak(fullTextToRead, () => {
      setReadingId(null);
    });
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <div className="section-header">
        <div className="section-title">
          <Newspaper size={28} color="#1E40AF" />
          <span>Bản Tin Sức Khỏe & Đời Sống Chọn Lọc</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {newsList.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F1F5F9',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#334155'
              }}>
                {getCategoryIcon(item.category)}
                {getCategoryName(item.category)}
              </span>

              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                {item.source} • {item.date}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', lineHeight: 1.4 }}>
              {item.title}
            </h3>

            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, marginBottom: '14px' }}>
              {item.summary}
            </p>

            <button
              onClick={() => handleReadNews(item)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: readingId === item.id ? '#FEE2E2' : '#EFF6FF',
                color: readingId === item.id ? '#DC2626' : '#1D4ED8',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {readingId === item.id ? (
                <>
                  <Square size={18} fill="#DC2626" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 size={18} />
                  <span>🔊 Bấm để nghe đọc to</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
