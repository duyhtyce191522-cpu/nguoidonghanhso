import React from 'react';
import { speechService } from '../../services/speechService';
import { Youtube, Facebook, Smartphone, ExternalLink, PlaySquare } from 'lucide-react';

interface QuickAppDockProps {
  onAppOpened?: (appName: string) => void;
}

export const QuickAppDock: React.FC<QuickAppDockProps> = ({ onAppOpened }) => {
  const [openingApp, setOpeningApp] = React.useState<string | null>(null);

  const handleOpenApp = (name: string, url: string, voiceGreeting: string) => {
    // Nếu người dùng chạm thêm lần nữa trong lúc đang đọc, mở tab ngay lập tức
    if (openingApp === name) {
      speechService.stopSpeaking();
      setOpeningApp(null);
      window.open(url, '_blank');
      if (onAppOpened) onAppOpened(name);
      return;
    }

    speechService.stopSpeaking();
    setOpeningApp(name);

    const openTab = () => {
      setOpeningApp(null);
      try {
        window.open(url, '_blank');
      } catch (e) {
        console.warn("Popup blocked, fallback touch available:", e);
      }
      if (onAppOpened) onAppOpened(name);
    };

    // Đọc lời chào trước, mở tab ngay khi đọc xong
    speechService.speak(voiceGreeting, {
      onEnd: openTab,
      onError: openTab
    });
  };

  return (
    <section className="quick-app-section" id="quick-apps-section" aria-label="Bàn phím mở nhanh ứng dụng">
      <div className="section-header">
        <div className="section-title">
          <Smartphone size={24} color="#386641" />
          <span>Mở Ứng Dụng Yêu Thích</span>
        </div>
        <span className="section-badge-soft">
          {openingApp ? '🔊 Đang đọc lời chào...' : 'Chạm 1 lần để mở'}
        </span>
      </div>

      <div className="app-dock-grid">
        {/* YouTube */}
        <button
          onClick={() =>
            handleOpenApp(
              'YouTube',
              'https://www.youtube.com/results?search_query=ca+nh%E1%BA%A1c+c%E1%BA%A3i+l%C6%B0%C6%A1ng',
              'Dạ, con mở YouTube ngay đây ạ!'
            )
          }
          className={`app-dock-tile app-youtube ${openingApp === 'YouTube' ? 'dock-opening' : ''}`}
          title="Mở YouTube xem ca nhạc, cải lương, phim"
        >
          <div className="app-tile-icon youtube-bg">
            <Youtube size={26} color="white" />
          </div>
          <span className="app-tile-name">YouTube</span>
          <span className="app-tile-sub">
            {openingApp === 'YouTube' ? '🔊 Sắp mở...' : 'Ca Nhạc, Cải Lương'}
          </span>
        </button>

        {/* Facebook */}
        <button
          onClick={() =>
            handleOpenApp(
              'Facebook',
              'https://www.facebook.com',
              'Dạ, con đang chuyển sang Facebook đây ạ!'
            )
          }
          className={`app-dock-tile app-facebook ${openingApp === 'Facebook' ? 'dock-opening' : ''}`}
          title="Mở Facebook xem ảnh con cháu và bạn bè"
        >
          <div className="app-tile-icon facebook-bg">
            <Facebook size={26} color="white" />
          </div>
          <span className="app-tile-name">Facebook</span>
          <span className="app-tile-sub">
            {openingApp === 'Facebook' ? '🔊 Sắp mở...' : 'Xem Ảnh Con'}
          </span>
        </button>

        {/* TikTok */}
        <button
          onClick={() =>
            handleOpenApp(
              'TikTok',
              'https://www.tiktok.com',
              'Dạ, con mở TikTok ngay đây ạ!'
            )
          }
          className={`app-dock-tile app-tiktok ${openingApp === 'TikTok' ? 'dock-opening' : ''}`}
          title="Mở TikTok xem video vui nhộn"
        >
          <div className="app-tile-icon tiktok-bg">
            <PlaySquare size={26} color="white" />
          </div>
          <span className="app-tile-name">TikTok</span>
          <span className="app-tile-sub">
            {openingApp === 'TikTok' ? '🔊 Sắp mở...' : 'Video Vui'}
          </span>
        </button>

        {/* Zalo */}
        <button
          onClick={() =>
            handleOpenApp(
              'Zalo',
              'https://zalo.me/0912345678',
              'Dạ, con mở Zalo ngay đây ạ!'
            )
          }
          className={`app-dock-tile app-zalo ${openingApp === 'Zalo' ? 'dock-opening' : ''}`}
          title="Mở Zalo gọi điện cho người thân"
        >
          <div className="app-tile-icon zalo-bg">
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'white' }}>Zalo</span>
          </div>
          <span className="app-tile-name">Zalo</span>
          <span className="app-tile-sub">
            {openingApp === 'Zalo' ? '🔊 Sắp mở...' : 'Gọi Cho Con'}
          </span>
        </button>
      </div>
    </section>
  );
};
