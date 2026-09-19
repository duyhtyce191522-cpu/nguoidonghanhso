import React, { useState, useEffect } from 'react';
import { Mic, LayoutGrid, Pill, BookOpen, AlertTriangle } from 'lucide-react';
import { speechService } from '../../services/speechService';

export const BottomNav: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'voice' | 'apps' | 'reminders' | 'guides' | 'sos'>('voice');

  const scrollTo = (id: string, tab: 'voice' | 'apps' | 'reminders' | 'guides' | 'sos') => {
    setActiveTab(tab);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSOSTrigger = () => {
    setActiveTab('sos');
    const el = document.getElementById('sos-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Also provide audible hint
    speechService.stopSpeaking();
    speechService.speak("Bác đang ở khu vực Nút Cứu Hộ Khẩn Cấp SOS ạ!");
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const voiceEl = document.getElementById('voice-section');
      const appsEl = document.getElementById('quick-apps-section');
      const remEl = document.getElementById('reminders-section');
      const guidesEl = document.getElementById('guides-section');
      const sosEl = document.getElementById('sos-section');

      if (sosEl && scrollPos >= sosEl.offsetTop) {
        setActiveTab('sos');
      } else if (guidesEl && scrollPos >= guidesEl.offsetTop) {
        setActiveTab('guides');
      } else if (remEl && scrollPos >= remEl.offsetTop) {
        setActiveTab('reminders');
      } else if (appsEl && scrollPos >= appsEl.offsetTop) {
        setActiveTab('apps');
      } else if (voiceEl) {
        setActiveTab('voice');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Thanh điều hướng chính ứng dụng">
      <div className="bottom-nav-inner">
        {/* Tab 1: Trợ Lý */}
        <button
          onClick={() => scrollTo('voice-section', 'voice')}
          className={`bottom-nav-item ${activeTab === 'voice' ? 'active' : ''}`}
          aria-label="Về mục Trợ lý AI"
        >
          <div className="bottom-nav-icon">
            <Mic size={22} strokeWidth={activeTab === 'voice' ? 2.5 : 2} />
          </div>
          <span className="bottom-nav-label">Trợ Lý</span>
        </button>

        {/* Tab 2: Ứng Dụng */}
        <button
          onClick={() => scrollTo('quick-apps-section', 'apps')}
          className={`bottom-nav-item ${activeTab === 'apps' ? 'active' : ''}`}
          aria-label="Về mục Mở ứng dụng yêu thích"
        >
          <div className="bottom-nav-icon">
            <LayoutGrid size={22} strokeWidth={activeTab === 'apps' ? 2.5 : 2} />
          </div>
          <span className="bottom-nav-label">Ứng Dụng</span>
        </button>

        {/* Tab 3: Lịch Thuốc */}
        <button
          onClick={() => scrollTo('reminders-section', 'reminders')}
          className={`bottom-nav-item ${activeTab === 'reminders' ? 'active' : ''}`}
          aria-label="Về mục Lịch uống thuốc"
        >
          <div className="bottom-nav-icon">
            <Pill size={22} strokeWidth={activeTab === 'reminders' ? 2.5 : 2} />
          </div>
          <span className="bottom-nav-label">Lịch Thuốc</span>
        </button>

        {/* Tab 4: Cẩm Nang */}
        <button
          onClick={() => scrollTo('guides-section', 'guides')}
          className={`bottom-nav-item ${activeTab === 'guides' ? 'active' : ''}`}
          aria-label="Về mục Cẩm nang hướng dẫn"
        >
          <div className="bottom-nav-icon">
            <BookOpen size={22} strokeWidth={activeTab === 'guides' ? 2.5 : 2} />
          </div>
          <span className="bottom-nav-label">Cẩm Nang</span>
        </button>

        {/* Tab 5: Cấp Cứu SOS (Nổi bật) */}
        <button
          onClick={handleSOSTrigger}
          className={`bottom-nav-item sos-nav-item ${activeTab === 'sos' ? 'active' : ''}`}
          aria-label="Cấp cứu khẩn cấp SOS"
        >
          <div className="bottom-nav-icon sos-icon-bg">
            <AlertTriangle size={20} color="white" />
          </div>
          <span className="bottom-nav-label sos-label">SOS</span>
        </button>
      </div>
    </nav>
  );
};
