import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { EmergencyContact } from '../../types';
import { Save, Plus, Trash2, Phone, User, Check } from 'lucide-react';

interface SettingsModalProps {
  contacts: EmergencyContact[];
  onRefreshContacts: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ contacts, onRefreshContacts }) => {
  const { profile, setProfile } = useApp();
  const [fullName, setFullName] = useState(profile.fullName);
  const [preferredGreeting, setPreferredGreeting] = useState(profile.preferredGreeting);
  const [birthYear, setBirthYear] = useState(profile.birthYear);
  const [healthNotes, setHealthNotes] = useState(profile.healthNotes);
  const [isSaved, setIsSaved] = useState(false);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        style={{
          background: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="#0284C7" />
          <span>Hồ Sơ & Xưng Hô Của Người Lớn Tuổi</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
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
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: '8px'
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
        border: '1px solid #CBD5E1',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991B1B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Phone size={20} color="#DC2626" />
          <span>Danh Bạ Khẩn Cấp (Nút SOS Sẽ Gọi Đến Đây)</span>
        </h4>

        {/* Existing Contacts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {contacts.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{c.name}</strong>
                  <span style={{ fontSize: '0.8rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: '6px' }}>
                    {c.relation}
                  </span>
                  {c.isPrimary && (
                    <span style={{ fontSize: '0.8rem', background: '#FEF2F2', color: '#DC2626', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      Ưu tiên gọi trước
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.95rem', color: '#0284C7', fontWeight: 700, marginTop: '2px' }}>
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
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form onSubmit={handleAddContact} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Tên người liên hệ</label>
            <input
              className="form-input"
              placeholder="VD: Con gái Mai Lan"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Quan hệ</label>
            <input
              className="form-input"
              placeholder="VD: Con gái cả"
              value={newContactRelation}
              onChange={(e) => setNewContactRelation(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Số điện thoại</label>
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
              padding: '12px 18px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus size={18} />
            <span>Thêm Số</span>
          </button>
        </form>
      </div>
    </div>
  );
};
