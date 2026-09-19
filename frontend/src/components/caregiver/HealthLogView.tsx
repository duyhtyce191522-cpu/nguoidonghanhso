import React from 'react';
import { HealthLog } from '../../types';
import { CheckCircle2, MessageSquare, AlertTriangle, Activity, Clock } from 'lucide-react';

interface HealthLogViewProps {
  logs: HealthLog[];
}

export const HealthLogView: React.FC<HealthLogViewProps> = ({ logs }) => {
  const getLogIcon = (type: HealthLog['type']) => {
    switch (type) {
      case 'medicine_taken':
        return <CheckCircle2 size={20} color="#059669" />;
      case 'voice_chat':
        return <MessageSquare size={20} color="#2563EB" />;
      case 'blood_pressure':
        return <Activity size={20} color="#0284C7" />;
      case 'sos_alert':
        return <AlertTriangle size={20} color="#DC2626" />;
      default:
        return <Clock size={20} color="#64748B" />;
    }
  };

  const getLogBg = (type: HealthLog['type']) => {
    switch (type) {
      case 'medicine_taken': return '#ECFDF5';
      case 'voice_chat': return '#EFF6FF';
      case 'blood_pressure': return '#F0F9FF';
      case 'sos_alert': return '#FEF2F2';
      default: return '#F8FAFC';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
          Nhật Ký Tương Tác & Sức Khỏe
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748B' }}>
          Ghi nhận thời gian thực khi bác uống thuốc, trò chuyện với trợ lý AI hoặc kích hoạt trợ giúp.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {logs.map((log) => {
          const date = new Date(log.timestamp);
          const timeFormatted = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

          return (
            <div
              key={log.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{
                background: getLogBg(log.type),
                width: 40,
                height: 40,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getLogIcon(log.type)}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.95rem', color: '#1E293B', fontWeight: 600, lineHeight: 1.5 }}>
                  {log.description}
                </p>
                <span style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px', display: 'inline-block' }}>
                  🕒 {timeFormatted} - ngày {dateFormatted}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
