import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { audioFeedback, speechService } from '../../services/speechService';
import { EmergencyContact } from '../../types';
import { AlertTriangle, PhoneCall, MessageSquare, Ambulance, MapPin } from 'lucide-react';

export const SOSButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAlerting, setIsAlerting] = useState(false);
  const [contactCalled, setContactCalled] = useState<EmergencyContact | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6))
          });
        },
        (err) => {
          console.warn('Geolocation error / permission ignored:', err);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  };

  const handleOpenSOS = () => {
    setShowConfirm(true);
    setCountdown(3);
    setIsAlerting(false);
    fetchLocation();
    audioFeedback.playSOSTone();
  };

  useEffect(() => {
    let timer: any;
    if (showConfirm && !isAlerting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showConfirm && !isAlerting && countdown === 0) {
      triggerEmergency();
    }
    return () => clearTimeout(timer);
  }, [showConfirm, isAlerting, countdown]);

  const triggerEmergency = async () => {
    setIsAlerting(true);
    audioFeedback.playSOSTone();
    speechService.speak("Đang kích hoạt cuộc gọi và tin nhắn khẩn cấp gửi tới người nhà và cấp cứu!");
    try {
      const locationText = userLocation
        ? `Tọa độ vị trí: ${userLocation.lat}, ${userLocation.lng} (Bản đồ: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng})`
        : 'Vị trí hiện tại của gia đình';

      const res = await api.triggerSOS(`Bác bấm nút khẩn cấp SOS trên ứng dụng. ${locationText}`);
      if (res && res.contactToCall) {
        setContactCalled(res.contactToCall);
      }
    } catch (e) {
      console.error("SOS trigger error", e);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setIsAlerting(false);
    speechService.stopSpeaking();
  };

  const rawPhone = contactCalled?.phone || '0912345678';
  const cleanPhone = rawPhone.replace(/[\s\-\.]/g, '');
  const locationUrl = userLocation
    ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
    : '';
  const smsBodyText = `[CỨU HỘ KHẨN CẤP SOS] Người nhà đang cần trợ giúp khẩn cấp!${locationUrl ? ` Vị trí hiện tại: ${locationUrl}` : ''}`;
  const smsLink = `sms:${cleanPhone}?body=${encodeURIComponent(smsBodyText)}`;

  return (
    <div id="sos-section" style={{ marginTop: '18px' }}>
      <button
        onClick={handleOpenSOS}
        className="sos-banner-btn"
        title="Bấm để gọi cấp cứu hoặc người thân khi gặp nạn"
      >
        <div className="sos-content">
          <div className="sos-icon-circle">
            <AlertTriangle size={30} color="#DC2626" />
          </div>
          <div>
            <div className="sos-title">NÚT CỨU HỘ KHẨN CẤP (SOS)</div>
            <div className="sos-desc">Chạm vào đây khi thấy mệt hoặc cần người nhà giúp đỡ gấp</div>
          </div>
        </div>

        <PhoneCall size={28} />
      </button>

      {/* Confirmation & Active Emergency Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', border: '3px solid #DC2626', maxWidth: '440px' }}
          >
            {!isAlerting ? (
              <div>
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <AlertTriangle size={42} />
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991B1B', marginBottom: '6px' }}>
                  XÁC NHẬN BÁO ĐỘNG KHẨN CẤP
                </h3>

                <p style={{ fontSize: '1.05rem', color: '#1E293B', marginBottom: '16px', lineHeight: 1.5 }}>
                  Ứng dụng sẽ tự động kích hoạt cuộc gọi & tin nhắn cứu hộ sau <strong>{countdown}</strong> giây!
                </p>

                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#DC2626', marginBottom: '20px' }}>
                  {countdown}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '14px',
                      background: '#F1F5F9',
                      border: '2px solid #CBD5E1',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Bấm Hủy (Bấm Nhầm)
                  </button>

                  <button
                    onClick={triggerEmergency}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '14px',
                      background: '#DC2626',
                      color: 'white',
                      border: 'none',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Gọi Ngay!
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: '#DC2626',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)'
                }}>
                  <PhoneCall size={42} className="animate-pulse" />
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#991B1B', marginBottom: '6px' }}>
                  ĐANG KẾT NỐI CUỘC GỌI CỨU HỘ!
                </h3>

                <div style={{
                  background: '#FEF2F2',
                  border: '2px solid #FECACA',
                  borderRadius: '14px',
                  padding: '14px',
                  margin: '14px 0',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#991B1B', marginBottom: '3px' }}>
                    📞 Người nhận: {contactCalled?.name || 'Nguyễn Thị Mai Lan (Con gái)'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', marginBottom: '6px' }}>
                    Số điện thoại: {contactCalled?.phone || rawPhone}
                  </div>
                  {userLocation && (
                    <div style={{ fontSize: '0.88rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <MapPin size={16} />
                      <span>Đã gắn vị trí GPS tọa độ: {userLocation.lat}, {userLocation.lng}</span>
                    </div>
                  )}
                </div>

                {/* Direct emergency telephone & SMS actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {/* Call Direct */}
                  <a
                    href={`tel:${cleanPhone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#059669',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <PhoneCall size={22} />
                    <span>Bấm Để Gọi Ngay Cho Người Thân</span>
                  </a>

                  {/* SMS with Location */}
                  <a
                    href={smsLink}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#2563EB',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    <MessageSquare size={22} />
                    <span>Gửi Tin Nhắn Khẩn Cấp Kèm Vị Trí</span>
                  </a>

                  {/* Ambulance 115 */}
                  <a
                    href="tel:115"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#DC2626',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '14px',
                      borderRadius: '12px',
                      fontSize: '1.05rem',
                      fontWeight: 800
                    }}
                  >
                    <Ambulance size={22} />
                    <span>Gọi Cấp Cứu Y Tế 115</span>
                  </a>
                </div>

                <button
                  onClick={handleCancel}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Tôi Đã An Toàn, Đóng Cửa Sổ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
