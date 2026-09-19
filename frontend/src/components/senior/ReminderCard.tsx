import React from 'react';
import { Reminder } from '../../types';
import { audioFeedback } from '../../services/speechService';
import { Pill, Activity, Droplets, Dumbbell, Calendar, Check, Clock } from 'lucide-react';

interface ReminderCardProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminders, onToggle }) => {
  const getIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'medicine':
        return <Pill size={24} color="#2563EB" />;
      case 'blood_pressure':
        return <Activity size={24} color="#DC2626" />;
      case 'water':
        return <Droplets size={24} color="#0284C7" />;
      case 'exercise':
        return <Dumbbell size={24} color="#059669" />;
      default:
        return <Calendar size={24} color="#7C3AED" />;
    }
  };

  const getPeriodLabel = (period: Reminder['period']) => {
    switch (period) {
      case 'morning': return 'Buổi Sáng';
      case 'noon': return 'Buổi Trưa';
      case 'afternoon': return 'Buổi Chiều';
      case 'evening': return 'Buổi Tối';
    }
  };

  const handleToggle = (rem: Reminder) => {
    if (!rem.completed) {
      audioFeedback.playSuccessChime();
    }
    onToggle(rem.id);
  };

  const completedCount = reminders.filter(r => r.completed).length;
  const isAllDone = reminders.length > 0 && completedCount === reminders.length;

  return (
    <div>
      <div className="section-header">
        <div className="section-title">
          <Clock size={28} color="#1E40AF" />
          <span>Lịch Uống Thuốc & Sinh Hoạt Hôm Nay</span>
        </div>
        <div style={{ fontWeight: 700, color: '#059669', fontSize: '1rem', background: '#ECFDF5', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #A7F3D0' }}>
          Đã xong: {completedCount}/{reminders.length}
        </div>
      </div>

      {isAllDone && (
        <div style={{
          background: '#ECFDF5',
          border: '2px solid #86EFAC',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#166534',
          fontWeight: 700,
          fontSize: '1.1rem'
        }}>
          🎉 Hoan hô bác! Bác đã hoàn thành trọn vẹn các cữ thuốc trong ngày rồi ạ!
        </div>
      )}

      {reminders.map((rem) => (
        <div key={rem.id} className={`reminder-card ${rem.completed ? 'completed' : ''}`}>
          <div className="reminder-card-left">
            <div className="reminder-time-badge">
              <div>{rem.time}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.85 }}>{getPeriodLabel(rem.period)}</div>
            </div>

            <div className="reminder-details">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {getIcon(rem.type)}
                <div className="reminder-title">{rem.title}</div>
              </div>

              {rem.dosage && (
                <div className="reminder-subtext">
                  💊 <strong>Liều dùng:</strong> {rem.dosage}
                </div>
              )}

              {rem.note && (
                <div className="reminder-note">
                  💡 {rem.note}
                </div>
              )}

              {rem.completed && rem.completedAt && (
                <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '6px', fontWeight: 600 }}>
                  ✓ Đã uống lúc {new Date(rem.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleToggle(rem)}
            className={`btn-check-medicine ${rem.completed ? 'done' : 'not-done'}`}
            title={rem.completed ? "Bấm để bỏ đánh dấu" : "Bấm để xác nhận đã uống"}
          >
            <Check size={24} strokeWidth={3} />
            <span>{rem.completed ? "Đã Xong ✓" : "Bấm Đã Uống"}</span>
          </button>
        </div>
      ))}
    </div>
  );
};
