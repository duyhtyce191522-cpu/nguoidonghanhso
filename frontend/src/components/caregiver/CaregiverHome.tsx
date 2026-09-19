import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Reminder, HealthLog, EmergencyContact, CaregiverStats } from '../../types';
import { ReminderManager } from './ReminderManager';
import { HealthLogView } from './HealthLogView';
import { SettingsModal } from './SettingsModal';
import { Heart, Activity, CheckCircle2, AlertCircle, Shield, Calendar, Clock, Settings, RefreshCw } from 'lucide-react';

export const CaregiverHome: React.FC = () => {
  const { profile } = useApp();
  const [activeTab, setActiveTab] = useState<'reminders' | 'logs' | 'settings'>('reminders');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [stats, setStats] = useState<CaregiverStats>({
    totalReminders: 0,
    completedReminders: 0,
    pendingReminders: 0,
    adherenceRate: 100
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getCaregiverDashboard();
      if (data) {
        setStats(data.stats);
        setLogs(data.recentLogs || []);
        setContacts(data.contacts || []);
      }
      const remList = await api.getReminders();
      setReminders(remList);
    } catch (e) {
      console.error("Caregiver fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Caregiver Hero & Stats */}
      <div className="caregiver-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
              Bảng Giám Sát Từ Xa Dành Cho Con Cháu
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>
              Theo Dõi Sức Khỏe & Sinh Hoạt Của {profile.preferredGreeting}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', marginTop: '4px' }}>
              Họ tên: {profile.fullName} ({profile.birthYear} - {new Date().getFullYear() - profile.birthYear} tuổi) • {profile.healthNotes}
            </p>
          </div>

          <button
            onClick={loadData}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Cập nhật</span>
          </button>
        </div>

        {/* Adherence and Task Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.adherenceRate}%</div>
            <div className="stat-label">Tỷ lệ tuân thủ thuốc hôm nay</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.completedReminders} / {stats.totalReminders}</div>
            <div className="stat-label">Cữ thuốc đã hoàn thành</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pendingReminders}</div>
            <div className="stat-label">Cữ thuốc còn lại trong ngày</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{contacts.length}</div>
            <div className="stat-label">Số liên hệ khẩn cấp sẵn sàng</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-item ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          💊 Quản Lý Đơn Thuốc ({reminders.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Nhật Ký Hoạt Động & AI ({logs.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Hồ Sơ & Danh Bạ SOS
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'reminders' && (
        <ReminderManager reminders={reminders} onRefresh={loadData} />
      )}

      {activeTab === 'logs' && (
        <HealthLogView logs={logs} />
      )}

      {activeTab === 'settings' && (
        <SettingsModal contacts={contacts} onRefreshContacts={loadData} />
      )}
    </div>
  );
};
