import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Heart, Volume2, UserCheck, Shield, Sparkles, Type } from 'lucide-react';

export const Header: React.FC = () => {
  const { mode, setMode, fontScale, setFontScale, profile } = useApp();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

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
    return 'Chữ Cực Đại';
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon-wrapper">
            <Heart size={26} strokeWidth={2.5} fill="white" />
          </div>
          <div>
            <div className="brand-title">Đồng Hành Số</div>
            <div className="brand-subtitle">
              {mode === 'senior' ? `Trợ lý của ${profile.preferredGreeting}` : 'Bảng Quản Lý Người Thân'}
            </div>
          </div>
        </div>

        <div className="header-controls">
          {/* Realtime clock display */}
          <div style={{ textAlign: 'right', marginRight: '6px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>{timeStr}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>{dateStr}</div>
          </div>

          {/* Font scale toggle */}
          <button
            onClick={cycleFontScale}
            title="Đổi kích cỡ chữ"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              background: '#F8FAFC',
              border: '2px solid #CBD5E1',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#334155'
            }}
          >
            <Type size={16} />
            <span>{getFontScaleLabel()}</span>
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setMode(mode === 'senior' ? 'caregiver' : 'senior')}
            className={`mode-toggle-btn ${mode === 'caregiver' ? 'caregiver-active' : ''}`}
            title="Chuyển chế độ Người lớn tuổi / Người nhà"
          >
            {mode === 'senior' ? (
              <>
                <Shield size={18} />
                <span>Chế độ Người Nhà</span>
              </>
            ) : (
              <>
                <UserCheck size={18} />
                <span>Về Giao Diện Bác</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
