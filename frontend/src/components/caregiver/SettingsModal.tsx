import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { EmergencyContact } from '../../types';
import { Save, Plus, Trash2, Phone, User, Check, KeyRound, Bell, BellRing } from 'lucide-react';
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
      setPinError('Mã PIN phải gồm đúng 4 chữ số (0-9)');
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
      onRefreshContacts();
    } catch (e) {
      console.error("Add contact error", e);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm("Xóa số điện thoại này khỏi danh bạ khẩn cấp?")) {
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
      {/* Web Push Notification Settings */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellRing size={20} color="#2563EB" />
            <span>Thông Báo Đẩy & Chuông Nhắc Uống Thuốc</span>
          </h4>

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

        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '14px', lineHeight: 1.45 }}>
          Khi đến giờ thuốc, điện thoại sẽ tự động rung và hiện thông báo chuẩn hệ thống. Bấm vào thông báo sẽ mở ứng dụng và AI cất giọng nhắc bác.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {notifPermission !== 'granted' ? (
            <button
              onClick={handleRequestNotification}
              style={{
                padding: '10px 18px',
                background: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
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
                padding: '10px 18px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BellRing size={16} />
              <span>{isTestSent ? '✓ Đã Bắn Thông Báo Thử!' : '🧪 Thử Nghiệm Chuông & Rung Ngay'}</span>
            </button>
          )}
        </div>
      </div>

      {/* PIN Protection Setting */}
      <form
        onSubmit={handleSavePin}
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={20} color="#D97706" />
          <span>Mã PIN Khóa Chế Độ Người Nhà</span>
        </h4>
        <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '14px' }}>
          Mã PIN này được dùng để bảo vệ quyền truy cập, tránh người lớn tuổi bấm nhầm vào trang quản trị.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '140px' }}>
            <input
              className="form-input"
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => {
                setNewPin(e.target.value);
                setPinError('');
              }}
              style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '0.3em', fontWeight: 800 }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 18px',
              background: '#0284C7',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPinSaved ? (
              <>
                <Check size={16} />
                <span>Đã Đổi Mã PIN!</span>
              </>
            ) : (
              <span>Cập Nhật PIN</span>
            )}
          </button>
        </div>

        {pinError && (
          <div style={{ color: '#DC2626', fontSize: '0.85rem', fontWeight: 700, marginTop: '8px' }}>
            {pinError}
          </div>
        )}
      </form>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #CBD5E1',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="#0284C7" />
          <span>Hồ Sơ & Cách Xưng Hô Của Người Lớn Tuổi</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cách AI xưng hô (Rất quan trọng)</label>
            <input
              className="form-input"
              placeholder="Ví dụ: Bác Hùng, Ông Hùng, Cụ Hùng"
              value={preferredGreeting}
              onChange={(e) => setPreferredGreeting(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Năm sinh</label>
            <input
              className="form-input"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(Number(e.target.value))}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Ghi chú bệnh lý & dặn dò AI</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={healthNotes}
              onChange={(e) => setHealthNotes(e.target.value)}
              placeholder="Ví dụ: Huyết áp cao, hay quên sau ăn, cần nhắc uống nước ấm..."
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0284C7',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: '4px'
          }}
        >
          {isSaved ? (
            <>
              <Check size={18} />
              <span>Đã Lưu Thành Công!</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Lưu Cấu Hình Hồ Sơ</span>
            </>
          )}
        </button>
      </form>

      {/* Emergency Contacts Management */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #CBD5E1',
        borderRadius: '16px',
        padding: '18px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={20} color="#DC2626" />
          <span>Danh Bạ Khẩn Cấp (Nút SOS Sẽ Gọi Đến Đây)</span>
        </h4>

        {/* Existing Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {contacts.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{c.name}</strong>
                  <span style={{ fontSize: '0.78rem', background: '#E2E8F0', padding: '2px 6px', borderRadius: '6px' }}>
                    {c.relation}
                  </span>
                  {c.isPrimary && (
                    <span style={{ fontSize: '0.78rem', background: '#FEF2F2', color: '#DC2626', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                      Ưu tiên
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#0284C7', fontWeight: 700, marginTop: '2px' }}>
                  {c.phone}
                </div>
              </div>

              <button
                onClick={() => handleDeleteContact(c.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px'
                }}
                title="Xóa người liên hệ"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAddContact} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Tên người nhận</label>
            <input
              className="form-input"
              placeholder="VD: Con gái Mai Lan"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Quan hệ</label>
            <input
              className="form-input"
              placeholder="VD: Con gái cả"
              value={newContactRelation}
              onChange={(e) => setNewContactRelation(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.82rem' }}>Số điện thoại</label>
            <input
              className="form-input"
              placeholder="VD: 0912 345 678"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 16px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Plus size={16} />
            <span>Thêm Số</span>
          </button>
        </form>
      </div>
    </div>
  );
};
