import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Tablet, Monitor } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children }) => {
  const { deviceMode, setDeviceMode } = useApp();

  return (
    <div className={`device-frame-wrapper ${deviceMode}`}>
      <div className={`device-frame ${deviceMode}`}>
        {children}
      </div>

      {/* Floating Device Mode Switcher */}
      <div className="device-toolbar">
        <span style={{ fontSize: '0.8rem', color: '#CBD5E1', marginRight: '4px' }}>Khung nhìn:</span>
        <button
          className={`device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
          onClick={() => setDeviceMode('mobile')}
          title="Xem dạng Điện thoại"
        >
          <Smartphone size={16} />
          <span>Điện thoại</span>
        </button>
        <button
          className={`device-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
          onClick={() => setDeviceMode('tablet')}
          title="Xem dạng Máy tính bảng (Tablet)"
        >
          <Tablet size={16} />
          <span>Tablet</span>
        </button>
        <button
          className={`device-btn ${deviceMode === 'fullscreen' ? 'active' : ''}`}
          onClick={() => setDeviceMode('fullscreen')}
          title="Xem dạng Toàn màn hình"
        >
          <Monitor size={16} />
          <span>Toàn màn hình</span>
        </button>
      </div>
    </div>
  );
};
