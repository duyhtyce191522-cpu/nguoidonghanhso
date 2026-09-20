import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Reminder, HealthLog, EmergencyContact, CaregiverStats } from '../../types';
import { ReminderManager } from './ReminderManager';
import { HealthLogView } from './HealthLogView';
import { SettingsModal } from './SettingsModal';
import {
  Heart,
  Activity,
  CheckCircle2,
  AlertCircle,
  Shield,
  Calendar,
  Clock,
  Settings,
  RefreshCw,
  QrCode,
  Copy,
  Smartphone,
  LogOut,
  Share2,
  Radio
} from 'lucide-react';

export const CaregiverHome: React.FC = () => {
  const { profile, familyCode, userPhone, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'reminders' | 'logs' | 'settings' | 'pairing'>('reminders');
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
  const [copied, setCopied] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayCode = familyCode || '829104';

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
  }, [userPhone]);

  const copyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Caregiver Hero & Stats */}
      <div className="caregiver-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#A7F3D0', fontWeight: 800 }}>
                Bảng Giám Sát Từ Xa Dành Cho Con Cháu
              </span>
              {userPhone && (
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 700 }}>
                  📱 SĐT: {userPhone}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '4px', color: '#FFFFFF' }}>
              Theo Dõi Sức Khỏe Của {profile.preferredGreeting}
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: '0.92rem', marginTop: '4px', lineHeight: 1.4 }}>
              Họ tên: <strong>{profile.fullName}</strong> ({profile.birthYear} - {new Date().getFullYear() - profile.birthYear} tuổi) • {profile.healthNotes}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={loadData}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
              }}
              title="Làm mới dữ liệu từ xa"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Cập nhật</span>
            </button>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FECACA',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 800
              }}
              title="Đăng xuất tài khoản gia đình"
            >
              <LogOut size={14} />
              <span>Đổi SĐT</span>
            </button>
          </div>
        </div>

        {/* Adherence and Task Stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-number">🎯 {stats.adherenceRate}%</div>
            <div className="stat-label">Tỷ lệ tuân thủ thuốc hôm nay</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">💊 {stats.completedReminders} / {stats.totalReminders}</div>
            <div className="stat-label">Cữ thuốc đã hoàn thành</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">⏳ {stats.pendingReminders}</div>
            <div className="stat-label">Cữ thuốc còn lại trong ngày</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">🚨 {contacts.length}</div>
            <div className="stat-label">Số liên hệ khẩn cấp sẵn sàng</div>
          </div>
        </div>
      </div>

      {/* Quick Family Pairing Banner */}
      <div
        style={{
          background: '#FFFFFF',
          border: '2px solid #D1FAE5',
          borderRadius: '18px',
          padding: '14px 18px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(56, 102, 65, 0.06)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Smartphone size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#065F46', letterSpacing: '0.04em' }}>
              Mã Ghép Nối Máy Cha Mẹ
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16281E', letterSpacing: '0.15em', fontFamily: 'monospace' }}>
              {displayCode.slice(0, 3)} {displayCode.slice(3)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={copyCode}
            style={{
              background: copied ? '#059669' : '#F0FDF4',
              color: copied ? 'white' : '#166534',
              border: '1px solid #86EFAC',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Đã chép!' : 'Sao chép mã'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pairing')}
            style={{
              background: activeTab === 'pairing' ? '#166534' : '#FFFFFF',
              color: activeTab === 'pairing' ? 'white' : '#374151',
              border: '1px solid #D1D5DB',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <QrCode size={16} />
            <span>Xem hướng dẫn kết nối</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-item ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          💊 Đơn Thuốc ({reminders.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Nhật Ký & AI ({logs.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Hồ Sơ & Danh Bạ SOS
        </button>
        <button
          className={`tab-item ${activeTab === 'pairing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pairing')}
        >
          🔗 Ghép Nối Máy Cha Mẹ
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

      {activeTab === 'pairing' && (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '2px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}
            >
              <Smartphone size={32} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#16281E', margin: '0 0 8px 0' }}>
              Kết Nối Điện Thoại Của Cha Mẹ
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#576B60', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Để cha mẹ có thể dùng trợ lý mà không cần mật khẩu phức tạp, hãy làm theo 3 bước đơn giản dưới đây:
            </p>

            {/* 6-Digit Pairing Code Display */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '2px solid #86EFAC',
                borderRadius: '24px',
                padding: '24px 20px',
                marginBottom: '24px'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.08em', marginBottom: '8px' }}>
                MÃ GHÉP NỐI 6 CHỮ SỐ
              </div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  letterSpacing: '0.22em',
                  color: '#14532D',
                  fontFamily: 'monospace',
                  marginBottom: '14px'
                }}
              >
                {displayCode.slice(0, 3)} {displayCode.slice(3)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  onClick={copyCode}
                  style={{
                    background: copied ? '#059669' : '#166534',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 20px',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(22, 101, 52, 0.25)'
                  }}
                >
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  <span>{copied ? 'Đã sao chép mã!' : 'Sao chép mã'}</span>
                </button>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#386641', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#16281E', display: 'block', marginBottom: '2px' }}>
                    Tải và mở ứng dụng trên máy Cha Mẹ
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.4 }}>
                    Mở ứng dụng "Người Đồng Hành Số" trên điện thoại hoặc máy tính bảng của cha mẹ.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#BC4749', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#16281E', display: 'block', marginBottom: '2px' }}>
                    Chọn "Tôi là Cha Mẹ (Kết nối với con)"
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.4 }}>
                    Tại màn hình đầu tiên, bấm vào nút màu đỏ cam dành riêng cho người lớn tuổi.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: '#F8FAFC', padding: '14px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#16281E', display: 'block', marginBottom: '2px' }}>
                    Nhập mã 6 số <span style={{ color: '#059669' }}>{displayCode}</span>
                  </strong>
                  <span style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.4 }}>
                    Nhập đúng 6 chữ số này một lần duy nhất. Máy cha mẹ sẽ lưu lại vĩnh viễn và mở thẳng Trợ Lý Bác!
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', color: '#166534', padding: '8px 16px', borderRadius: '20px', fontSize: '0.86rem', fontWeight: 700 }}>
              <Radio size={16} className="animate-pulse" color="#059669" />
              <span>Đang sẵn sàng đồng bộ 2 chiều thời gian thực</span>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Inline Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay pin-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <LogOut size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16281E', margin: '0 0 6px 0' }}>
              Đổi Số Điện Thoại Quản Lý?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#576B60', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              Bạn sẽ đăng xuất khỏi tài khoản <strong>{userPhone}</strong> để đăng nhập bằng số điện thoại khác hoặc ghép nối lại máy.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: 800, cursor: 'pointer' }}
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#DC2626', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }}
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
