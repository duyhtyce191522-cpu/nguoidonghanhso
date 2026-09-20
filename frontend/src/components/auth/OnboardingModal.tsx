import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Heart,
  Shield,
  Smartphone,
  UserCheck,
  PhoneCall,
  Lock,
  Calendar,
  AlertCircle,
  Activity,
  CheckCircle2,
  Users
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { loginWithPhoneAndPin, userPhone } = useApp();

  // Mode: 'register' (khởi tạo hồ sơ mới) | 'login' (đã có tài khoản gia đình)
  const [tab, setTab] = useState<'register' | 'login'>('register');

  // Form states
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredGreeting, setPreferredGreeting] = useState('Bác Hùng');
  const [birthYear, setBirthYear] = useState('1952');
  const [healthNotes, setHealthNotes] = useState('Huyết áp hơi cao, hay quên giờ uống thuốc sau ăn sáng.');
  const [contactName, setContactName] = useState('Mai Lan');
  const [contactRelation, setContactRelation] = useState('Con gái');
  const [contactPhone, setContactPhone] = useState('');
  const [targetDeviceRole, setTargetDeviceRole] = useState<'senior' | 'caregiver'>('senior');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanP = phone.trim().replace(/[\s\-\.]/g, '');
    if (!cleanP || cleanP.length < 9) {
      setError('Vui lòng nhập đúng số điện thoại gia đình (tối thiểu 9 số)');
      return;
    }
    if (!pin || pin.length < 4) {
      setError('Mã PIN bảo vệ phải có ít nhất 4 chữ số');
      return;
    }
    if (pin !== confirmPin) {
      setError('Mã PIN xác nhận không khớp');
      return;
    }
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên của người lớn tuổi');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.registerFamily({
        phone: cleanP,
        pin,
        profile: {
          fullName: fullName.trim(),
          preferredGreeting: preferredGreeting.trim() || 'Bác',
          birthYear: parseInt(birthYear, 10) || 1952,
          healthNotes: healthNotes.trim()
        },
        contact: contactPhone.trim() ? {
          name: contactName.trim() || 'Con cái',
          relation: contactRelation.trim() || 'Con gái',
          phone: contactPhone.trim()
        } : undefined
      });

      if (res.success && res.phone) {
        loginWithPhoneAndPin(res.phone, pin, targetDeviceRole, res.profile);
        if (onClose) onClose();
      } else {
        setError(res.error || 'Khởi tạo hồ sơ thất bại, vui lòng thử lại');
      }
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ khi tạo hồ sơ: ' + (err?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanP = phone.trim().replace(/[\s\-\.]/g, '');
    if (!cleanP || cleanP.length < 9) {
      setError('Vui lòng nhập đúng số điện thoại gia đình');
      return;
    }
    if (!pin) {
      setError('Vui lòng nhập mã PIN bảo vệ');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.loginFamily(cleanP, pin);
      if (res.success && res.phone) {
        loginWithPhoneAndPin(res.phone, pin, targetDeviceRole, res.profile);
        if (onClose) onClose();
      } else {
        setError(res.error || 'Số điện thoại hoặc mã PIN chưa đúng');
      }
    } catch (err: any) {
      setError('Lỗi kết nối máy chủ khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  const isMandatory = !userPhone;

  return createPortal(
    <div
      className="modal-overlay pin-modal-overlay"
      style={{
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (!isMandatory && onClose) onClose();
      }}
    >
      <div
        className="pin-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 22px',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '2px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669 0%, #0284C7 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)',
              marginBottom: '10px'
            }}
          >
            <Heart size={32} fill="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
            Người Đồng Hành Số
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
            Ứng dụng chăm sóc sức khỏe & đồng hành thông minh cho người lớn tuổi
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '18px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: tab === 'register' ? '#FFFFFF' : 'transparent',
              color: tab === 'register' ? '#059669' : '#64748B',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: tab === 'register' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            📝 Khởi Tạo Hồ Sơ Mới
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: tab === 'login' ? '#FFFFFF' : 'transparent',
              color: tab === 'login' ? '#059669' : '#64748B',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: tab === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🔑 Đã Có Tài Khoản
          </button>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: REGISTER NEW PROFILE */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            {/* Section A: Family Credentials */}
            <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={18} color="#059669" />
                <span>1. Tài Khoản Dùng Chung Gia Đình</span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Số điện thoại gia đình (SĐT con cái hoặc cha mẹ) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 38px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                  <Smartphone size={18} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Đặt Mã PIN (4 số) *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="VD: 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Nhập lại PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="VD: 1234"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '4px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section B: Senior Profile */}
            <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={18} color="#0284C7" />
                <span>2. Thông Tin Người Lớn Tuổi</span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Họ và tên người lớn tuổi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn Hùng"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Danh xưng AI gọi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Bác Hùng / Bố Hùng"
                    value={preferredGreeting}
                    onChange={(e) => setPreferredGreeting(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ width: '110px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Năm sinh
                  </label>
                  <input
                    type="number"
                    placeholder="1952"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Tiền sử bệnh lý / Lưu ý sức khỏe
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Huyết áp hơi cao, hay quên giờ uống thuốc sau ăn sáng..."
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Section C: Emergency SOS Contact */}
            <div style={{ marginBottom: '16px', background: '#FEF2F2', padding: '14px', borderRadius: '16px', border: '1px solid #FECACA' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991B1B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneCall size={18} color="#DC2626" />
                <span>3. Số Điện Thoại Cứu Hộ SOS Khẩn Cấp</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#7F1D1D', marginBottom: '4px' }}>
                    Tên người thân nhận SOS
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Mai Lan"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #FECACA',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#7F1D1D', marginBottom: '4px' }}>
                    Quan hệ
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Con gái"
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #FECACA',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#7F1D1D', marginBottom: '4px' }}>
                  Số điện thoại người thân *
                </label>
                <input
                  type="tel"
                  placeholder="VD: 0987 654 321"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1px solid #FECACA',
                    fontSize: '1rem',
                    fontWeight: 800,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Section D: Device Mode */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                4. Điện thoại này đang dùng cho ai?
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div
                  onClick={() => setTargetDeviceRole('senior')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: targetDeviceRole === 'senior' ? '2px solid #059669' : '1px solid #CBD5E1',
                    background: targetDeviceRole === 'senior' ? '#ECFDF5' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>👴 Cho Cha Mẹ</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Chữ to, giọng nói AI, SOS</div>
                </div>

                <div
                  onClick={() => setTargetDeviceRole('caregiver')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: targetDeviceRole === 'caregiver' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                    background: targetDeviceRole === 'caregiver' ? '#F0F9FF' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#0284C7', fontSize: '0.95rem' }}>📱 Cho Con Cái</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Quản lý lịch thuốc & SOS</div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                fontSize: '1.05rem',
                fontWeight: 900,
                border: 'none',
                cursor: isLoading ? 'wait' : 'pointer',
                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)'
              }}
            >
              {isLoading ? 'Đang khởi tạo hồ sơ...' : '✓ HOÀN TẤT & BẮT ĐẦU SỬ DỤNG'}
            </button>
          </form>
        )}

        {/* TAB 2: LOGIN WITH EXISTING PHONE & PIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px', background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Số điện thoại gia đình
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '13px 14px 13px 40px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      boxSizing: 'border-box'
                    }}
                  />
                  <Smartphone size={20} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Mã PIN bảo vệ (4 chữ số)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="Nhập mã PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '13px 14px 13px 40px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      letterSpacing: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={20} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  Chọn chế độ mở máy này:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div
                    onClick={() => setTargetDeviceRole('senior')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: targetDeviceRole === 'senior' ? '2px solid #059669' : '1px solid #CBD5E1',
                      background: targetDeviceRole === 'senior' ? '#ECFDF5' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#059669' }}>👴 Cha Mẹ</div>
                  </div>
                  <div
                    onClick={() => setTargetDeviceRole('caregiver')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: targetDeviceRole === 'caregiver' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                      background: targetDeviceRole === 'caregiver' ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#0284C7' }}>📱 Con Cái</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                fontSize: '1.05rem',
                fontWeight: 900,
                border: 'none',
                cursor: isLoading ? 'wait' : 'pointer',
                boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)'
              }}
            >
              {isLoading ? 'Đang đăng nhập...' : '🔑 ĐĂNG NHẬP & ĐỒNG BỘ'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
