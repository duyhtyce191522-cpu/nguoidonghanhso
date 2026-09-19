import React from 'react';
import { Reminder } from '../../types';
import { audioFeedback } from '../../services/speechService';
import { Pill, Activity, Droplets, Dumbbell, Calendar, Check, Clock, CheckCircle2 } from 'lucide-react';

interface ReminderCardProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminders, onToggle }) => {
  const getIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'medicine':
        return <Pill size={22} color="#059669" />;
      case 'blood_pressure':
        return <Activity size={22} color="#DC2626" />;
      case 'water':
        return <Droplets size={22} color="#0284C7" />;
      case 'exercise':
        return <Dumbbell size={22} color="#D97706" />;
      default:
        return <Calendar size={22} color="#7C3AED" />;
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
    <section className="reminder-section-container" id="reminders-section" aria-label="Lịch uống thuốc">
      <div className="section-header">
        <div className="section-title">
          <Clock size={24} color="#386641" />
          <span>Lịch Uống Thuốc Hôm Nay</span>
        </div>
        <div className="reminder-progress-badge">
          {isAllDone ? "✓ Hoàn thành tất cả" : `Đã uống: ${completedCount}/${reminders.length}`}
        </div>
      </div>

      {isAllDone && (
        <div className="reminder-celebration-banner">
          <div className="celebration-icon">🎉</div>
          <div>
            <strong>Hoan hô bác!</strong> Bác đã uống đủ tất cả các cữ thuốc hôm nay rồi ạ. Bác nhớ nghỉ ngơi thật thoải mái nhé!
          </div>
        </div>
      )}

      <div className="reminders-list">
        {reminders.map((rem) => {
          const isDone = rem.completed;
          return (
            <div
              key={rem.id}
              className={`med-card-item period-${rem.period} ${isDone ? 'is-completed' : ''}`}
            >
              {/* Card Header: Period badge & Time */}
              <div className="med-card-header">
                <div className={`med-period-tag tag-${rem.period}`}>
                  <span className="period-dot"></span>
                  <span>{getPeriodLabel(rem.period)}</span>
                </div>
                <div className="med-time-display">
                  <Clock size={16} />
                  <span>{rem.time}</span>
                </div>
              </div>

              {/* Card Content: Title & Dosage */}
              <div className="med-card-body">
                <div className="med-title-row">
                  <div className="med-icon-box">
                    {getIcon(rem.type)}
                  </div>
                  <h4 className="med-title">{rem.title}</h4>
                </div>

                {rem.dosage && (
                  <div className="med-dosage-box">
                    <span className="dosage-icon">💊</span>
                    <span><strong>Liều dùng:</strong> {rem.dosage}</span>
                  </div>
                )}

                {rem.note && (
                  <div className="med-note-box">
                    <span className="note-icon">💡</span>
                    <span>{rem.note}</span>
                  </div>
                )}

                {isDone && rem.completedAt && (
                  <div className="med-done-timestamp">
                    <CheckCircle2 size={16} color="#15803D" />
                    <span>Đã xác nhận uống lúc {new Date(rem.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* Big Full-Width 3D Action Button */}
              <div className="med-action-wrapper">
                <button
                  onClick={() => handleToggle(rem)}
                  className={`med-check-btn ${isDone ? 'btn-done' : 'btn-active'}`}
                  title={isDone ? "Bấm để đánh dấu chưa uống" : "Bấm để xác nhận đã uống thuốc"}
                >
                  <Check size={24} strokeWidth={3} />
                  <span>{isDone ? "ĐÃ UỐNG XONG ✓" : "BẤM ĐÃ UỐNG THUỐC"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
