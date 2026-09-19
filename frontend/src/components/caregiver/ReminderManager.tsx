import React, { useState } from 'react';
import { Reminder } from '../../types';
import { api } from '../../services/api';
import { Plus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReminderManagerProps {
  reminders: Reminder[];
  onRefresh: () => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({ reminders, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [period, setPeriod] = useState<Reminder['period']>('morning');
  const [type, setType] = useState<Reminder['type']>('medicine');
  const [dosage, setDosage] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;

    setIsSubmitting(true);
    try {
      await api.createReminder({
        title: title.trim(),
        time,
        period,
        type,
        dosage: dosage.trim() || undefined,
        note: note.trim() || undefined
      });
      setTitle('');
      setDosage('');
      setNote('');
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      console.error("Create reminder error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lịch nhắc: "${name}" không?`)) {
      await api.deleteReminder(id);
      onRefresh();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
            Danh Sách Đơn Thuốc & Lịch Sinh Hoạt
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
            Lịch nhắc này sẽ hiển thị to rõ trên màn hình và được AI nhắc giọng nói.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0284C7',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          <span>{showAddForm ? 'Đóng Form' : 'Thêm Lịch Mới'}</span>
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateReminder}
          style={{
            background: '#F8FAFC',
            border: '2px solid #CBD5E1',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}
        >
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369A1', marginBottom: '14px' }}>
            Thêm Cữ Thuốc Hoặc Lịch Sinh Hoạt Mới
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Tên thuốc / Hoạt động *</label>
              <input
                className="form-input"
                placeholder="Ví dụ: Thuốc Huyết Áp (Amlodipine)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ nhắc (Giờ:Phút) *</label>
              <input
                className="form-input"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Buổi trong ngày</label>
              <select
                className="form-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
              >
                <option value="morning">Buổi Sáng</option>
                <option value="noon">Buổi Trưa</option>
                <option value="afternoon">Buổi Chiều</option>
                <option value="evening">Buổi Tối</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Loại lịch</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="medicine">💊 Uống Thuốc</option>
                <option value="blood_pressure">❤️ Đo Huyết Áp</option>
                <option value="water">💧 Uống Nước</option>
                <option value="exercise">🏃 Tập Thể Dục</option>
                <option value="doctor">🩺 Tái Khám Bác Sĩ</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Liều dùng</label>
              <input
                className="form-input"
                placeholder="Ví dụ: 1 viên sau ăn sáng 15 phút"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lời dặn dò cho bác</label>
              <input
                className="form-input"
                placeholder="Ví dụ: Uống với nước ấm đầy ly nhé bác"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              style={{
                padding: '10px 18px',
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 22px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {isSubmitting ? 'Đang Lưu...' : 'Lưu Lịch Nhắc'}
            </button>
          </div>
        </form>
      )}

      {/* Reminders List Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reminders.map((rem) => (
          <div
            key={rem.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                background: rem.completed ? '#ECFDF5' : '#EFF6FF',
                color: rem.completed ? '#059669' : '#0284C7',
                padding: '8px 12px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                minWidth: '70px',
                textAlign: 'center'
              }}>
                {rem.time}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1.05rem', color: '#0F172A' }}>{rem.title}</strong>
                  {rem.completed ? (
                    <span style={{ fontSize: '0.8rem', color: '#059669', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ✓ Đã hoàn thành
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#D97706', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      Chưa uống
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '2px' }}>
                  {rem.dosage && <span>Liều: {rem.dosage} • </span>}
                  {rem.note && <span>Dặn dò: {rem.note}</span>}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(rem.id, rem.title)}
              style={{
                background: '#FEE2E2',
                color: '#DC2626',
                border: 'none',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title="Xóa lịch này"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
