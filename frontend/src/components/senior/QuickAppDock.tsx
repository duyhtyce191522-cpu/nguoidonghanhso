import React from 'react';
import { speechService } from '../../services/speechService';
import { Youtube, Facebook, Smartphone, ExternalLink, PlaySquare } from 'lucide-react';

interface QuickAppDockProps {
  onAppOpened?: (appName: string) => void;
}

export const QuickAppDock: React.FC<QuickAppDockProps> = ({ onAppOpened }) => {
  const handleOpenApp = (name: string, url: string, voiceGreeting: string) => {
    speechService.stopSpeaking();
    speechService.speak(voiceGreeting);
    window.open(url, '_blank');
    if (onAppOpened) onAppOpened(name);
  };

  return (
    <section className="quick-app-section" id="quick-apps-section" aria-label="Bàn phím mở nhanh ứng dụng">
      <div className="section-header">
        <div className="section-title">
          <Smartphone size={24} color="#386641" />
          <span>Mở Ứng Dụng Yêu Thích</span>
        </div>
        <span className="section-badge-soft">
          Chạm 1 lần để mở
        </span>
      </div>

      <div className="app-dock-grid">
        {/* YouTube */}
        <button
          onClick={() =>
            handleOpenApp(
              'YouTube',
              'https://www.youtube.com',
              'Dạ, con đang mở YouTube cho bác xem ca nhạc và cải lương đây ạ!'
            )
          }
          className="app-dock-tile app-youtube"
          title="Mở YouTube xem ca nhạc, cải lương, phim"
        >
          <div className="app-tile-icon youtube-bg">
            <Youtube size={26} color="white" />
          </div>
          <span className="app-tile-name">YouTube</span>
          <span className="app-tile-sub">Ca Nhạc, Phim</span>
        </button>

        {/* Facebook */}
        <button
          onClick={() =>
            handleOpenApp(
              'Facebook',
              'https://www.facebook.com',
              'Dạ, con đang chuyển sang Facebook cho bác xem ảnh con cháu đây ạ!'
            )
          }
          className="app-dock-tile app-facebook"
          title="Mở Facebook xem ảnh con cháu và bạn bè"
        >
          <div className="app-tile-icon facebook-bg">
            <Facebook size={26} color="white" />
          </div>
          <span className="app-tile-name">Facebook</span>
          <span className="app-tile-sub">Xem Ảnh Con</span>
        </button>

        {/* TikTok */}
        <button
          onClick={() =>
            handleOpenApp(
              'TikTok',
              'https://www.tiktok.com',
              'Dạ, con đang mở TikTok cho bác xem video ngắn vui nhộn đây ạ!'
            )
          }
          className="app-dock-tile app-tiktok"
          title="Mở TikTok xem video vui nhộn"
        >
          <div className="app-tile-icon tiktok-bg">
            <PlaySquare size={26} color="white" />
          </div>
          <span className="app-tile-name">TikTok</span>
          <span className="app-tile-sub">Video Vui</span>
        </button>

        {/* Zalo */}
        <button
          onClick={() =>
            handleOpenApp(
              'Zalo',
              'https://zalo.me/0912345678',
              'Dạ, con đang mở Zalo để bác gọi điện cho con gái Mai Lan ngay đây ạ!'
            )
          }
          className="app-dock-tile app-zalo"
          title="Mở Zalo gọi điện cho người thân"
        >
          <div className="app-tile-icon zalo-bg">
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: 'white' }}>Zalo</span>
          </div>
          <span className="app-tile-name">Zalo</span>
          <span className="app-tile-sub">Gọi Cho Con</span>
        </button>
      </div>
    </section>
  );
};
