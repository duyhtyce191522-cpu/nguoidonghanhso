import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Heart,
  Shield,
  ShieldCheck,
  Smartphone,
  Users,
  ArrowRight,
  ArrowLeft,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Lock,
  Sparkles,
  PhoneCall,
  Delete
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

type OnboardingStep =
  | 'role_select'
  | 'caregiver_phone'
  | 'caregiver_otp'
  | 'caregiver_pin'
  | 'caregiver_success'
  | 'senior_code'
  | 'senior_success';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { loginCaregiver, pairSenior, userPhone, familyRole } = useApp();

  const [step, setStep] = useState<OnboardingStep>('role_select');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [testOtp, setTestOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [seniorCodeInput, setSeniorCodeInput] = useState(['', '', '', '', '', '']);
  const [pairedSeniorName, setPairedSeniorName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const seniorCodeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = async (inputPhone?: string) => {
    const targetPhone = (inputPhone || phone).trim();
    if (!targetPhone || targetPhone.length < 9) {
      setError('Vui lòng nhập đúng số điện thoại (VD: 0912 345 678)');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const res = await api.sendOtp(targetPhone);
      if (res.success) {
        if (res.testOtp) {
          setTestOtp(res.testOtp);
        }
        setCountdown(60);
        setStep('caregiver_otp');
        // Reset OTP inputs
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setError(res.error || 'Không thể gửi mã OTP, vui lòng thử lại');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ khi gửi OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (enteredOtp?: string) => {
    const fullOtp = enteredOtp || otp.join('');
    if (fullOtp.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(phone, fullOtp);
      if (res.success) {
        setFamilyCode(res.familyCode || '829104');
        if (res.hasCustomPin && res.pin) {
          // Already has custom PIN, log in directly
          loginCaregiver(res.phone || phone, res.pin, res.familyCode);
          setStep('caregiver_success');
        } else {
          // Go to set custom PIN
          setStep('caregiver_pin');
        }
      } else {
        setError(res.error || 'Mã OTP không hợp lệ hoặc đã hết hạn');
      }
    } catch (e) {
      setError('Lỗi kết nối khi xác thực OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Save Custom PIN
  const handleSavePin = async () => {
    if (pin.length !== 4) {
      setError('Mã PIN phải có đúng 4 chữ số');
      return;
    }
    if (pin !== confirmPin) {
      setError('Mã xác nhận PIN không khớp nhau. Vui lòng nhập lại!');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const res = await api.setPin(pin, phone);
      if (res.success) {
        loginCaregiver(phone, pin, familyCode);
        setStep('caregiver_success');
      } else {
        setError(res.error || 'Không thể lưu mã PIN');
      }
    } catch (e) {
      setError('Lỗi kết nối khi lưu mã PIN');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Pair Senior Device
  const handlePairSenior = async (codeToPair?: string) => {
    const fullCode = codeToPair || seniorCodeInput.join('');
    if (fullCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số mã ghép nối');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const res = await api.pairFamilyCode(fullCode);
      if (res.success && res.phone) {
        setPairedSeniorName(res.profile?.preferredGreeting || 'Cha Mẹ');
        pairSenior(res.phone, fullCode, res.profile);
        setStep('senior_success');
      } else {
        setError(res.error || 'Mã ghép nối không chính xác. Hãy kiểm tra lại trên máy con cái!');
      }
    } catch (e) {
      setError('Lỗi kết nối khi ghép nối gia đình');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Quick Demo Mode
  const handleUseDemo = () => {
    loginCaregiver('0912345678', '1234', '829104');
  };

  return createPortal(
    <div className="modal-overlay pin-modal-overlay">
      <div
        className="pin-modal-content"
        style={{
          maxWidth: '460px',
          width: '95%',
          padding: '24px 22px',
          borderRadius: '28px',
          background: '#FFFFFF',
          border: '2px solid #E8E3DA',
          boxShadow: '0 25px 60px rgba(22, 40, 30, 0.35)'
        }}
      >
        {/* ================= STEP 0: ROLE SELECTION ================= */}
        {step === 'role_select' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #386641 0%, #2D5335 100%)',
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(56, 102, 65, 0.35)',
                  marginBottom: '12px'
                }}
              >
                <Heart size={30} fill="#FFFFFF" strokeWidth={2.2} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16281E', margin: '0 0 6px 0' }}>
                Chào Mừng Bạn Đến Với
              </h2>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#386641', letterSpacing: '-0.02em' }}>
                Người Đồng Hành Số
              </div>
              <p style={{ fontSize: '0.9rem', color: '#576B60', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                Trợ lý thông minh chăm sóc sức khỏe & đồng hành cùng người lớn tuổi
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {/* Option A: Caregiver */}
              <div
                onClick={() => {
                  setError('');
                  setStep('caregiver_phone');
                }}
                style={{
                  background: '#F7FBF8',
                  border: '2px solid #386641',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: '0 4px 14px rgba(56, 102, 65, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#386641',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Dành Cho Con Cháu
                  </span>
                  <ArrowRight size={18} color="#386641" />
                </div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#16281E', margin: '4px 0' }}>
                  Tôi là Con Cháu (Cài Đặt Cho Cha Mẹ)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#576B60', margin: 0, lineHeight: 1.4 }}>
                  Đăng nhập bằng Số Điện Thoại $\rightarrow$ Nhận mã OTP $\rightarrow$ Quản trị đơn thuốc từ xa & lấy mã kết nối cho cha mẹ.
                </p>
              </div>

              {/* Option B: Senior */}
              <div
                onClick={() => {
                  setError('');
                  setStep('senior_code');
                }}
                style={{
                  background: '#FFFDF9',
                  border: '2px solid #E87A5D',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: '0 4px 14px rgba(232, 122, 93, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#BC4749',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Dành Cho Cha Mẹ
                  </span>
                  <ArrowRight size={18} color="#BC4749" />
                </div>
                <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#16281E', margin: '4px 0' }}>
                  Tôi là Cha Mẹ (Kết Nối Với Con)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#576B60', margin: 0, lineHeight: 1.4 }}>
                  Chỉ cần nhập <strong>Mã Ghép Nối 6 số</strong> từ máy con gửi qua để vào dùng ngay. Không cần mật khẩu!
                </p>
              </div>
            </div>

            {/* Quick Demo Access */}
            <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #ECE7DE' }}>
              <button
                onClick={handleUseDemo}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#718096',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  textDecoration: 'underline',
                  fontWeight: 600
                }}
              >
                💡 Bỏ qua, trải nghiệm bản mẫu dùng thử (Demo Gia Đình Bác Hùng)
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 1 (CAREGIVER): ENTER PHONE ================= */}
        {step === 'caregiver_phone' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setStep('role_select')}
                style={{ background: '#F1EFEA', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} color="#16281E" />
              </button>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16281E', margin: 0 }}>
                  Số Điện Thoại Con Cháu
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#576B60' }}>Bước 1/3: Đăng nhập quản trị gia đình</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#576B60', marginBottom: '14px', lineHeight: 1.4 }}>
              Nhập số điện thoại của bạn để nhận mã xác thực OTP. Mỗi số điện thoại sẽ quản lý một hồ sơ gia đình độc lập.
            </p>

            {/* Phone Input */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#386641',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderRight: '1px solid #CBD5E1',
                  paddingRight: '10px'
                }}
              >
                🇻🇳 +84
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="VD: 0912 345 678"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 85px',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#16281E',
                  borderRadius: '16px',
                  border: '2px solid #CBD5E1',
                  outline: 'none',
                  letterSpacing: '0.04em',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            {/* Quick Test Presets */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: '#718096', marginBottom: '6px', fontWeight: 700 }}>
                💡 Gợi ý thử nghiệm nhanh:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPhone('0912345678')}
                  style={{
                    background: '#EDF2F7',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#2D3748'
                  }}
                >
                  0912345678 (Gia đình 1)
                </button>
                <button
                  onClick={() => setPhone('0988123456')}
                  style={{
                    background: '#EDF2F7',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: '#2D3748'
                  }}
                >
                  0988123456 (Gia đình 2)
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E53E3E', fontSize: '0.86rem', marginBottom: '12px', background: '#FFF5F5', padding: '10px 12px', borderRadius: '12px', border: '1px solid #FEB2B2' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handleSendOtp()}
              disabled={isLoading || !phone}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: !phone ? '#CBD5E1' : 'linear-gradient(135deg, #386641 0%, #2D5335 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: !phone ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: !phone ? 'none' : '0 8px 20px rgba(56, 102, 65, 0.3)'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                <>
                  <span>Nhận Mã Xác Thực OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= STEP 2 (CAREGIVER): VERIFY OTP ================= */}
        {step === 'caregiver_otp' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setStep('caregiver_phone')}
                style={{ background: '#F1EFEA', border: 'none', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={18} color="#16281E" />
              </button>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16281E', margin: 0 }}>
                  Xác Thực Mã OTP
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#576B60' }}>Bước 2/3: Kiểm tra tin nhắn SMS</span>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#576B60', marginBottom: '14px', lineHeight: 1.4 }}>
              Mã 6 chữ số đã được gửi tới số: <strong style={{ color: '#16281E' }}>{phone}</strong>
            </p>

            {/* Test OTP Hint Banner */}
            {testOtp && (
              <div
                onClick={() => {
                  const digits = testOtp.split('');
                  setOtp(digits);
                  handleVerifyOtp(testOtp);
                }}
                style={{
                  background: '#ECFDF5',
                  border: '1px dashed #059669',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                title="Bấm vào để tự động điền"
              >
                <div style={{ fontSize: '0.86rem', color: '#065F46' }}>
                  💡 Mã OTP thử nghiệm: <strong style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>{testOtp}</strong>
                </div>
                <span style={{ fontSize: '0.78rem', background: '#059669', color: 'white', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                  Tự điền
                </span>
              </div>
            )}

            {/* 6 OTP Input Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[idx]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const newOtp = [...otp];
                    newOtp[idx] = val;
                    setOtp(newOtp);

                    if (val && idx < 5) {
                      otpRefs.current[idx + 1]?.focus();
                    }

                    if (newOtp.every(d => d !== '')) {
                      handleVerifyOtp(newOtp.join(''));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                      otpRefs.current[idx - 1]?.focus();
                    }
                  }}
                  style={{
                    width: 44,
                    height: 52,
                    borderRadius: '12px',
                    border: otp[idx] ? '2px solid #386641' : '2px solid #CBD5E1',
                    background: otp[idx] ? '#F7FBF8' : '#FFFFFF',
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    color: '#16281E',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E53E3E', fontSize: '0.86rem', marginBottom: '12px', background: '#FFF5F5', padding: '10px 12px', borderRadius: '12px', border: '1px solid #FEB2B2' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handleVerifyOtp()}
              disabled={isLoading || otp.some(d => !d)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: otp.some(d => !d) ? '#CBD5E1' : 'linear-gradient(135deg, #386641 0%, #2D5335 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: otp.some(d => !d) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <span>Xác Nhận & Tiếp Tục</span>}
            </button>

            <div style={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <span style={{ fontSize: '0.84rem', color: '#718096' }}>
                  Gửi lại mã sau <strong>{countdown}s</strong>
                </span>
              ) : (
                <button
                  onClick={() => handleSendOtp()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#386641',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Chưa nhận được mã? Gửi lại OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3 (CAREGIVER): SET CUSTOM PIN ================= */}
        {step === 'caregiver_pin' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}
              >
                <Lock size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#16281E', margin: 0 }}>
                Tự Đặt Mã PIN Bảo Vệ (4 Số)
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#576B60', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                Mã PIN này dùng để khóa bảng quản trị con cái, tránh người lớn tuổi bấm nhầm.
              </p>
            </div>

            {/* Input PIN */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#16281E', marginBottom: '6px' }}>
                Nhập mã PIN mới (4 số):
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: '2px solid #CBD5E1',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Confirm PIN */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#16281E', marginBottom: '6px' }}>
                Xác nhận lại mã PIN:
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '14px',
                  border: '2px solid #CBD5E1',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E53E3E', fontSize: '0.86rem', marginBottom: '12px', background: '#FFF5F5', padding: '10px 12px', borderRadius: '12px', border: '1px solid #FEB2B2' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleSavePin}
              disabled={isLoading || pin.length !== 4 || confirmPin.length !== 4}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: (pin.length !== 4 || confirmPin.length !== 4) ? '#CBD5E1' : 'linear-gradient(135deg, #386641 0%, #2D5335 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: (pin.length !== 4 || confirmPin.length !== 4) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <span>Lưu Mã PIN & Vào Ứng Dụng</span>}
            </button>
          </div>
        )}

        {/* ================= STEP 4 (CAREGIVER): SUCCESS & FAMILY CODE ================= */}
        {step === 'caregiver_success' && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#D1FAE5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16281E', margin: 0 }}>
              Thiết Lập Thành Công!
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#576B60', margin: '6px 0 16px 0', lineHeight: 1.4 }}>
              Tài khoản quản lý của bạn đã sẵn sàng. Dưới đây là <strong>Mã Kết Nối Gia Đình</strong> để kết nối máy của cha mẹ:
            </p>

            {/* Family Code Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '2px solid #86EFAC',
                borderRadius: '20px',
                padding: '18px',
                marginBottom: '16px',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#166534', fontWeight: 800, marginBottom: '6px' }}>
                MÃ GHÉP NỐI MÁY CHA MẸ (6 CHỮ SỐ)
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  color: '#14532D',
                  fontFamily: 'monospace',
                  marginBottom: '10px'
                }}
              >
                {familyCode.slice(0, 3)} {familyCode.slice(3)}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(familyCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                style={{
                  background: copiedCode ? '#059669' : '#166534',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedCode ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                <span>{copiedCode ? 'Đã sao chép mã!' : 'Sao chép mã 6 số'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#576B60', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              👉 Trên điện thoại của cha mẹ: Tải app, chọn <strong>"Tôi là Cha Mẹ"</strong> và nhập mã số ở trên là 2 máy sẽ tự động kết nối với nhau!
            </p>

            <button
              onClick={() => {
                if (onClose) onClose();
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #386641 0%, #2D5335 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(56, 102, 65, 0.3)'
              }}
            >
              <span>Vào Bảng Quản Trị Con Cháu</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ================= STEP 1 (SENIOR): ENTER 6-DIGIT CODE ================= */}
        {step === 'senior_code' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={() => setStep('role_select')}
                style={{ background: '#F1EFEA', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ArrowLeft size={20} color="#16281E" />
              </button>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#16281E', margin: 0 }}>
                  KẾT NỐI VỚI CON CHÁU
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#576B60' }}>Chỉ cần làm 1 lần duy nhất</span>
              </div>
            </div>

            <p style={{ fontSize: '1rem', color: '#16281E', marginBottom: '16px', lineHeight: 1.5, background: '#FEF3C7', padding: '12px 14px', borderRadius: '16px', border: '1px solid #FDE68A' }}>
              👵 <strong>Bác hãy bảo con cháu đọc cho Bác Mã Ghép Nối 6 số</strong> (hiển thị trên máy của con cháu) rồi bấm vào các ô bên dưới nhé:
            </p>

            {/* 6 Senior Code Inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '18px' }}>
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  ref={(el) => (seniorCodeRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={seniorCodeInput[idx]}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const next = [...seniorCodeInput];
                    next[idx] = val;
                    setSeniorCodeInput(next);

                    if (val && idx < 5) {
                      seniorCodeRefs.current[idx + 1]?.focus();
                    }

                    if (next.every(d => d !== '')) {
                      handlePairSenior(next.join(''));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !seniorCodeInput[idx] && idx > 0) {
                      seniorCodeRefs.current[idx - 1]?.focus();
                    }
                  }}
                  style={{
                    width: 48,
                    height: 58,
                    borderRadius: '14px',
                    border: seniorCodeInput[idx] ? '3px solid #BC4749' : '2px solid #CBD5E1',
                    background: seniorCodeInput[idx] ? '#FFF5F5' : '#FFFFFF',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    color: '#16281E',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C53030', fontSize: '0.92rem', marginBottom: '14px', background: '#FFF5F5', padding: '12px', borderRadius: '14px', border: '1px solid #FEB2B2' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => handlePairSenior()}
              disabled={isLoading || seniorCodeInput.some(d => !d)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '18px',
                background: seniorCodeInput.some(d => !d) ? '#CBD5E1' : 'linear-gradient(135deg, #BC4749 0%, #9E2A2B 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: seniorCodeInput.some(d => !d) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: seniorCodeInput.some(d => !d) ? 'none' : '0 8px 20px rgba(188, 71, 73, 0.35)'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={22} className="animate-spin" />
                  <span>Đang kết nối...</span>
                </>
              ) : (
                <>
                  <span>KẾT NỐI NGAY</span>
                  <ArrowRight size={22} />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= STEP 2 (SENIOR): SUCCESS ================= */}
        {step === 'senior_success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: '#D1FAE5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <CheckCircle2 size={42} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16281E', margin: '0 0 8px 0' }}>
              KẾT NỐI THÀNH CÔNG!
            </h3>
            <p style={{ fontSize: '1.05rem', color: '#2D5335', margin: '0 0 24px 0', lineHeight: 1.5, fontWeight: 700 }}>
              Dạ, chào mừng {pairedSeniorName || 'Bác'}! Ứng dụng đã được kết nối với con cháu và cập nhật đầy đủ lịch thuốc của Bác.
            </p>

            <button
              onClick={() => {
                if (onClose) onClose();
              }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #386641 0%, #2D5335 100%)',
                color: 'white',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(56, 102, 65, 0.4)'
              }}
            >
              <span>VÀO DÙNG TRỢ LÝ NGAY</span>
              <ArrowRight size={22} />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
