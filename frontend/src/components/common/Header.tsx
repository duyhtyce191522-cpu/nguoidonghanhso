import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, UserCheck, Shield, Type, Pill, BookOpen, Newspaper, Smartphone } from 'lucide-react';
import { PinModal } from './PinModal';

export const Header: React.FC = () => {
  const { mode, setMode, fontScale, setFontScale, profile } = useApp();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const cycleFontScale = () => {
    if (fontScale === 'normal') setFontScale('large');
    else if (fontScale === 'large') setFontScale('extra-large');
    else setFontScale('normal');
  };

  const getFontScaleLabel = () => {
    if (fontScale === 'normal') return 'Chữ Vừa';
    if (fontScale === 'large') return 'Chữ To';
    return 'Cực Đại';
  };

  const handleModeClick = () => {
    if (mode === 'senior') {
      // Prompt for PIN to enter Caregiver mode
      setIsPinModalOpen(true);
    } else {
      // Returning to Senior mode is direct
      setMode('senior');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon-wrapper">
            <Heart size={24} strokeWidth={2.5} fill="white" />
          </div>
          <div>
            <div className="brand-title">Đồng Hành Số</div>
            <div className="brand-subtitle">
              {mode === 'senior' ? `Trợ lý của ${profile.preferredGreeting}` : 'Bảng Quản Trị Người Thân'}
            </div>
          </div>
        </div>

        <div className="header-controls">
          {/* Realtime clock display */}
          <div style={{ textAlign: 'right', marginRight: '4px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#16281E', lineHeight: 1.1 }}>{timeStr}</div>
            <div style={{ fontSize: '0.75rem', color: '#576B60', fontWeight: 600 }}>{dateStr}</div>
          </div>

          {/* Font scale toggle */}
          <button
            onClick={cycleFontScale}
            title="Đổi kích cỡ chữ"
            className="font-scale-button"
          >
            <Type size={14} />
            <span>{getFontScaleLabel()}</span>
          </button>

          {/* Mode Switcher with PIN */}
          <button
            onClick={handleModeClick}
            className={`mode-toggle-btn ${mode === 'caregiver' ? 'caregiver-active' : ''}`}
            title={mode === 'senior' ? "Chuyển sang Chế độ Người Nhà (Cần mã PIN)" : "Quay lại Giao diện Bác"}
          >
            {mode === 'senior' ? (
              <>
                <Shield size={16} />
                <span>Người Nhà</span>
              </>
            ) : (
              <>
                <UserCheck size={16} />
                <span>Về Giao Diện Bác</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Jump Anchors on Senior Mode */}
      {mode === 'senior' && (
        <div className="quick-jump-bar">
          <button
            onClick={() => scrollToSection('voice-section')}
            className="quick-jump-chip"
          >
            🎙️ Trợ Lý Giọng Nói
          </button>
          <button
            onClick={() => scrollToSection('quick-apps-section')}
            className="quick-jump-chip"
          >
            <Smartphone size={15} color="#386641" />
            Mở Ứng Dụng
          </button>
          <button
            onClick={() => scrollToSection('reminders-section')}
            className="quick-jump-chip"
          >
            <Pill size={15} color="#4A7C59" />
            Lịch Thuốc
          </button>
          <button
            onClick={() => scrollToSection('guides-section')}
            className="quick-jump-chip"
          >
            <BookOpen size={15} color="#386641" />
            Cẩm Nang
          </button>
          <button
            onClick={() => scrollToSection('news-section')}
            className="quick-jump-chip"
          >
            <Newspaper size={15} color="#8C705F" />
            Bản Tin Sức Khỏe
          </button>
        </div>
      )}

      {/* PIN Modal for Caregiver mode protection */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setMode('caregiver');
        }}
      />
    </header>
  );
};
