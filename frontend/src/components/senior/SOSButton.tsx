import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { audioFeedback, speechService } from '../../services/speechService';
import { EmergencyContact } from '../../types';
import { AlertTriangle, PhoneCall, X, ShieldCheck, Ambulance } from 'lucide-react';

export const SOSButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isAlerting, setIsAlerting] = useState(false);
  const [contactCalled, setContactCalled] = useState<EmergencyContact | null>(null);

  const handleOpenSOS = () => {
    setShowConfirm(true);
    setCountdown(3);
    setIsAlerting(false);
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
    speechService.speak("Đang kích hoạt cuộc gọi khẩn cấp tới người nhà và cấp cứu!");
    try {
      const res = await api.triggerSOS("Bác bấm nút khẩn cấp SOS trên ứng dụng");
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

  return (
    <>
      <button
        onClick={handleOpenSOS}
        className="sos-banner-btn"
        title="Bấm để gọi cấp cứu hoặc người thân khi gặp nạn"
      >
        <div className="sos-content">
          <div style={{
            background: 'white',
            borderRadius: '50%',
            width: 52,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={32} color="#DC2626" />
          </div>
          <div>
            <div className="sos-title">NÚT KHẨN CẤP (SOS)</div>
            <div className="sos-desc">Chạm vào đây khi thấy mệt hoặc cần người nhà giúp đỡ gấp</div>
          </div>
        </div>

        <PhoneCall size={32} />
      </button>

      {/* Confirmation & Active Emergency Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ textAlign: 'center', border: '4px solid #DC2626' }}
          >
            {!isAlerting ? (
              <div>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AlertTriangle size={48} />
                </div>

                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#991B1B', marginBottom: '8px' }}>
                  XÁC NHẬN BÁO ĐỘNG KHẨN CẤP
                </h3>

                <p style={{ fontSize: '1.15rem', color: '#1E293B', marginBottom: '20px', lineHeight: 1.5 }}>
                  Ứng dụng sẽ tự động gọi cho người thân sau <strong>{countdown}</strong> giây!
                </p>

                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#DC2626', marginBottom: '24px' }}>
                  {countdown}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '16px',
                      background: '#F1F5F9',
                      border: '2px solid #CBD5E1',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Bấm Hủy (Tôi Bấm Nhầm)
                  </button>

                  <button
                    onClick={triggerEmergency}
                    style={{
                      flex: 1,
                      padding: '16px',
                      borderRadius: '16px',
                      background: '#DC2626',
                      color: 'white',
                      border: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Gọi Luôn Bây Giờ!
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: '#DC2626',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)'
                }}>
                  <PhoneCall size={50} className="animate-pulse" />
                </div>

                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#991B1B', marginBottom: '8px' }}>
                  ĐANG KẾT NỐI CUỘC GỌI CỨU HỘ!
                </h3>

                <div style={{
                  background: '#FEF2F2',
                  border: '2px solid #FECACA',
                  borderRadius: '16px',
                  padding: '18px',
                  margin: '20px 0',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', marginBottom: '4px' }}>
                    📞 Người nhận: {contactCalled?.name || 'Nguyễn Thị Mai Lan (Con gái)'}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', marginBottom: '8px' }}>
                    Số điện thoại: {contactCalled?.phone || '0912 345 678'}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#64748B' }}>
                    ✓ Đã gửi tin nhắn thông báo vị trí & cảnh báo khẩn cấp tới con cháu.
                  </div>
                </div>

                {/* Direct emergency telephone links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <a
                    href={`tel:${contactCalled?.phone || '0912345678'}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      background: '#059669',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '14px',
                      borderRadius: '14px',
                      fontSize: '1.15rem',
                      fontWeight: 800
                    }}
                  >
                    <PhoneCall size={22} />
                    <span>Bấm Để Quay Số Trực Tiếp</span>
                  </a>

                  <a
                    href="tel:115"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      background: '#DC2626',
                      color: 'white',
                      textDecoration: 'none',
                      padding: '14px',
                      borderRadius: '14px',
                      fontSize: '1.15rem',
                      fontWeight: 800
                    }}
                  >
                    <Ambulance size={22} />
                    <span>Gọi Cấp Cứu 115</span>
                  </a>
                </div>

                <button
                  onClick={handleCancel}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Tôi Đã An Toàn, Đóng Cửa Sổ Này
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
