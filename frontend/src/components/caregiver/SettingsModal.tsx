import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { EmergencyContact } from '../../types';
import {
  Save,
  Plus,
  Trash2,
  Phone,
  User,
  Check,
  KeyRound,
  Bell,
  BellRing,
  PhoneCall,
  ShieldAlert,
  Heart,
  Calendar,
  FileText,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

interface SettingsModalProps {
  contacts: EmergencyContact[];
  onRefreshContacts: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ contacts, onRefreshContacts }) => {
  const { profile, setProfile, caregiverPin, setCaregiverPin } = useApp();
  const [fullName, setFullName] = useState(profile.fullName);
  const [preferredGreeting, setPreferredGreeting] = useState(profile.preferredGreeting);
  const [birthYear, setBirthYear] = useState(profile.birthYear);
  const [healthNotes, setHealthNotes] = useState(profile.healthNotes);
  const [isSaved, setIsSaved] = useState(false);

  // Caregiver PIN management
  const [newPin, setNewPin] = useState(caregiverPin);
  const [isPinSaved, setIsPinSaved] = useState(false);
  const [pinError, setPinError] = useState('');

  // New contact form
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isContactSaved, setIsContactSaved] = useState(false);

  // Quick chips for relations
  const quickRelations = ['Con gái', 'Con trai', 'Bác sĩ', 'Hàng xóm', 'Người chăm sóc'];

  // Quick chips for greetings
  const nameParts = (fullName || 'Hùng').trim().split(' ');
  const lastName = nameParts[nameParts.length - 1] || 'Hùng';
  const quickGreetings = [`Bác ${lastName}`, `Ông ${lastName}`, `Bà ${lastName}`, `Cụ ${lastName}`, `Chú ${lastName}`];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateProfile({
        fullName,
        preferredGreeting,
        birthYear: Number(birthYear),
        healthNotes
      });
      setProfile(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (e) {
      console.error("Save profile error", e);
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('Mã PIN phải gồm đúng 4 chữ số (ví dụ: 1234)');
      return;
    }
    setCaregiverPin(newPin);
    setPinError('');
    setIsPinSaved(true);
    setTimeout(() => setIsPinSaved(false), 2500);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    try {
      await api.addContact({
        name: newContactName.trim(),
        relation: newContactRelation.trim() || 'Người thân',
        phone: newContactPhone.trim(),
        isPrimary: contacts.length === 0
      });
      setNewContactName('');
      setNewContactRelation('');
      setNewContactPhone('');
      setIsContactSaved(true);
      setTimeout(() => setIsContactSaved(false), 2500);
      onRefreshContacts();
    } catch (e) {
      console.error("Add contact error", e);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi danh bạ khẩn cấp không?`)) {
      await api.deleteContact(id);
      onRefreshContacts();
    }
  };

  const [notifPermission, setNotifPermission] = useState<string>(() => {
    return notificationService.getPermission();
  });
  const [isTestSent, setIsTestSent] = useState(false);

  const handleRequestNotification = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
  };

  const handleSendTestNotification = async () => {
    setIsTestSent(true);
    await notificationService.sendTestNotification();
    setTimeout(() => setIsTestSent(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ========================================================================= */}
      {/* 1. EMERGENCY SOS CONTACTS (FIRST PRIORITY) */}
      {/* ========================================================================= */}
      <div className="setting-panel-card" style={{ borderTop: '4px solid #DC2626' }}>
        <div className="setting-card-header">
          <div className="setting-card-title">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PhoneCall size={20} color="#DC2626" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', color: '#991B1B' }}>Danh Bạ Khẩn Cấp SOS</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                Khi người lớn tuổi bấm nút SOS, hệ thống sẽ ưu tiên quay số đến các liên hệ này
              </div>
            </div>
          </div>

          <span style={{
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 800
          }}>
            {contacts.length} số sẵn sàng
          </span>
        </div>

        {/* Contact List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {contacts.length === 0 ? (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              background: '#FFF1F2',
              borderRadius: '14px',
              border: '1.5px dashed #FDA4AF',
              color: '#9F1239'
            }}>
              <ShieldAlert size={32} style={{ margin: '0 auto 8px', color: '#E11D48' }} />
              <strong>Chưa có số điện thoại khẩn cấp nào!</strong>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                Vui lòng nhập ít nhất 1 số điện thoại của con cháu hoặc bác sĩ ở biểu mẫu bên dưới.
              </p>
            </div>
          ) : (
            contacts.map((c) => {
              const initial = c.name ? c.name.charAt(0).toUpperCase() : '👤';
              return (
                <div key={c.id} className="contact-item-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div className="contact-avatar-badge">
                      {initial}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                          {c.name}
                        </span>
                        <span style={{
                          fontSize: '0.78rem',
                          background: '#E2E8F0',
                          color: '#334155',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 700
                        }}>
                          {c.relation}
                        </span>
                        {c.isPrimary && (
                          <span style={{
                            fontSize: '0.75rem',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            ★ Gọi Đầu Tiên
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '1rem',
                        color: '#0284C7',
                        fontWeight: 800,
                        marginTop: '3px',
                        letterSpacing: '0.02em'
                      }}>
                        {c.phone}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Direct Test Call & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, '')}`}
                      className="contact-call-btn"
                      title="Gọi kiểm tra trực tiếp số điện thoại này"
                    >
                      <Phone size={14} />
                      <span>Gọi Thử</span>
                    </a>

                    <button
                      onClick={() => handleDeleteContact(c.id, c.name)}
                      className="contact-delete-btn"
                      title="Xóa người liên hệ này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Contact Form (Never Clipped, 100% Mobile Friendly) */}
        <div style={{
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '0.98rem',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Plus size={18} color="#059669" />
            <span>Thêm Người Thân / Bác Sĩ Vào Danh Bạ Khẩn Cấp</span>
          </div>

          <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Họ tên người nhận cuộc gọi *
                </label>
                <input
                  className="form-input"
                  placeholder="Ví dụ: Con gái Mai Lan"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                  Số điện thoại *
                </label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="Ví dụ: 0912 345 678"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Mối quan hệ với bác (chạm để chọn nhanh):
              </label>
              <div className="relation-chips-wrapper">
                {quickRelations.map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    className={`relation-chip-btn ${newContactRelation === rel ? 'active' : ''}`}
                    onClick={() => setNewContactRelation(rel)}
                  >
                    + {rel}
                  </button>
                ))}
              </div>
              <input
                className="form-input"
                placeholder="Hoặc tự gõ (Ví dụ: Cháu đích tôn, Bác sĩ điều trị...)"
                value={newContactRelation}
                onChange={(e) => setNewContactRelation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {isContactSaved ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Đã Thêm Vào Danh Bạ Thành Công!</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Lưu Số Vào Danh Bạ Khẩn Cấp</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SENIOR PROFILE & AI GREETING (SECOND PRIORITY) */}
      {/* ========================================================================= */}
      <div className="setting-panel-card" style={{ borderTop: '4px solid #0284C7' }}>
        <div className="setting-card-header">
          <div className="setting-card-title">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="#0284C7" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', color: '#0369A1' }}>Hồ Sơ & Cách AI Xưng Hô Thân Mật</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                Giúp trợ lý AI giao tiếp ấm áp, đúng vai vế và nắm rõ bệnh lý của bác
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Preview Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #E8F5E9 100%)',
          border: '1.5px solid #A7F3D0',
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#386641',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            fontWeight: 800,
            flexShrink: 0
          }}>
            🧓
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
              Trạng thái xưng hô hiện tại của AI:
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#14532D', marginTop: '2px' }}>
              Dạ, con chào {preferredGreeting}! ({fullName} - {new Date().getFullYear() - birthYear} tuổi)
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                Họ và tên người lớn tuổi *
              </label>
              <input
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                Năm sinh ({birthYear ? `${new Date().getFullYear() - birthYear} tuổi` : ''})
              </label>
              <input
                className="form-input"
                type="number"
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                min={1900}
                max={new Date().getFullYear()}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Cách AI xưng hô với người lớn tuổi (Rất quan trọng):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '6px 0 8px' }}>
              {quickGreetings.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`greeting-chip-btn ${preferredGreeting === g ? 'active' : ''}`}
                  onClick={() => setPreferredGreeting(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              className="form-input"
              placeholder="Ví dụ: Bác Hùng, Ông Hùng, Cụ Hùng, Bà Lan..."
              value={preferredGreeting}
              onChange={(e) => setPreferredGreeting(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              Ghi chú bệnh lý & Dặn dò AI khi trò chuyện:
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              placeholder="Ví dụ: Huyết áp hơi cao, hay quên sau ăn, cần nhắc uống nước ấm, dặn dò đi lại cẩn thận..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.92rem',
                lineHeight: 1.5
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={18} />
                <span>Đã Lưu Cấu Hình Hồ Sơ Thành Công!</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Lưu Thay Đổi Hồ Sơ & Xưng Hô</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECURITY PIN & PUSH NOTIFICATIONS */}
      {/* ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* PIN Protection Setting */}
        <form
          onSubmit={handleSavePin}
          className="setting-panel-card"
          style={{ margin: 0 }}
        >
          <div className="setting-card-title" style={{ marginBottom: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={18} color="#D97706" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', color: '#B45309' }}>Mã PIN Khóa Quản Trị</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                Bảo vệ tránh người lớn tuổi bấm nhầm
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '12px' }}>
            Mã gồm đúng 4 chữ số (mặc định: 1234).
          </p>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value);
                setPinError('');
              }}
              style={{
                width: '120px',
                textAlign: 'center',
                fontSize: '1.3rem',
                letterSpacing: '0.3em',
                fontWeight: 900,
                padding: '8px 10px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1'
              }}
              required
            />

            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px 14px',
                background: '#D97706',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isPinSaved ? (
                <>
                  <Check size={16} />
                  <span>Đã Đổi PIN!</span>
                </>
              ) : (
                <span>Đổi Mã PIN</span>
              )}
            </button>
          </div>

          {pinError && (
            <div style={{ color: '#DC2626', fontSize: '0.82rem', fontWeight: 700, marginTop: '8px' }}>
              {pinError}
            </div>
          )}
        </form>

        {/* Web Push Notification Settings */}
        <div
          className="setting-panel-card"
          style={{ margin: 0 }}
        >
          <div className="setting-card-title" style={{ marginBottom: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BellRing size={18} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', color: '#1D4ED8' }}>Thông Báo Đẩy Giờ Thuốc</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                Rung và phát chuông chuẩn trên máy
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              fontSize: '0.82rem',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontWeight: 800,
              background: notifPermission === 'granted' ? '#DCFCE7' : '#FEF2F2',
              color: notifPermission === 'granted' ? '#166534' : '#991B1B',
              border: notifPermission === 'granted' ? '1px solid #86EFAC' : '1px solid #FECACA'
            }}>
              {notifPermission === 'granted' ? '✓ Đã Bật Quyền' : 'Chưa Cấp Quyền'}
            </span>
          </div>

          {notifPermission !== 'granted' ? (
            <button
              onClick={handleRequestNotification}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Bell size={16} />
              <span>Bật Thông Báo Trên Máy</span>
            </button>
          ) : (
            <button
              onClick={handleSendTestNotification}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <BellRing size={16} />
              <span>{isTestSent ? '✓ Đã Bắn Chuông Thử!' : '🧪 Thử Chuông & Rung'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
