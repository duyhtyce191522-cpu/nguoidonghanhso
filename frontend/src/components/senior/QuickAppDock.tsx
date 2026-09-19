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
          <span>Bấm Mở Ứng Dụng Yêu Thích</span>
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
          className="app-dock-card app-youtube"
          title="Mở YouTube xem ca nhạc, cải lương, phim"
        >
          <div className="app-dock-icon-wrapper youtube-bg">
            <Youtube size={32} color="white" />
          </div>
          <div className="app-dock-info">
            <div className="app-dock-title">
              <span>YouTube</span>
              <ExternalLink size={15} />
            </div>
            <div className="app-dock-desc">Xem Cải Lương, Ca Nhạc, Phim</div>
          </div>
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
          className="app-dock-card app-facebook"
          title="Mở Facebook xem ảnh con cháu và bạn bè"
        >
          <div className="app-dock-icon-wrapper facebook-bg">
            <Facebook size={32} color="white" />
          </div>
          <div className="app-dock-info">
            <div className="app-dock-title">
              <span>Facebook</span>
              <ExternalLink size={15} />
            </div>
            <div className="app-dock-desc">Xem Ảnh Con Cháu & Bạn Bè</div>
          </div>
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
          className="app-dock-card app-tiktok"
          title="Mở TikTok xem video vui nhộn"
        >
          <div className="app-dock-icon-wrapper tiktok-bg">
            <PlaySquare size={32} color="white" />
          </div>
          <div className="app-dock-info">
            <div className="app-dock-title">
              <span>TikTok</span>
              <ExternalLink size={15} />
            </div>
            <div className="app-dock-desc">Video Vui Nhộn, Nấu Ăn</div>
          </div>
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
          className="app-dock-card app-zalo"
          title="Mở Zalo gọi điện cho người thân"
        >
          <div className="app-dock-icon-wrapper zalo-bg">
            <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'white', letterSpacing: '-0.5px' }}>Zalo</span>
          </div>
          <div className="app-dock-info">
            <div className="app-dock-title">
              <span>Zalo</span>
              <ExternalLink size={15} />
            </div>
            <div className="app-dock-desc">Gọi Điện & Nhắn Tin Cho Con</div>
          </div>
        </button>
      </div>
    </section>
  );
};
