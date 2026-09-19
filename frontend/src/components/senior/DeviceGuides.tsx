import React, { useState } from 'react';
import { GuideItem } from '../../types';
import { speechService } from '../../services/speechService';
import { BookOpen, Video, ShieldAlert, Thermometer, ChevronRight, X, Volume2, CheckCircle } from 'lucide-react';

interface DeviceGuidesProps {
  guides: GuideItem[];
}

export const DeviceGuides: React.FC<DeviceGuidesProps> = ({ guides }) => {
  const [activeGuide, setActiveGuide] = useState<GuideItem | null>(null);

  const getGuideIcon = (id: string) => {
    if (id.includes('zalo')) return <Video size={30} color="white" />;
    if (id.includes('fraud')) return <ShieldAlert size={30} color="white" />;
    return <Thermometer size={30} color="white" />;
  };

  const getGuideBgColor = (id: string) => {
    if (id.includes('zalo')) return 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)';
    if (id.includes('fraud')) return 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
    return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
  };

  const handleReadStep = (stepText: string) => {
    speechService.stopSpeaking();
    speechService.speak(stepText);
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <div className="section-header">
        <div className="section-title">
          <BookOpen size={28} color="#1E40AF" />
          <span>Cẩm Nang Công Nghệ & Sống Khỏe</span>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {guides.map((guide) => (
          <div
            key={guide.id}
            onClick={() => setActiveGuide(guide)}
            style={{
              background: '#FFFFFF',
              border: '3px solid #E2E8F0',
              borderRadius: '20px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '16px',
                background: getGuideBgColor(guide.id),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px'
              }}>
                {getGuideIcon(guide.id)}
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                {guide.title}
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                {guide.description}
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#1D4ED8',
              fontWeight: 800,
              fontSize: '1rem',
              borderTop: '1px solid #F1F5F9',
              paddingTop: '12px'
            }}>
              <span>Xem hướng dẫn ({guide.steps.length} bước)</span>
              <ChevronRight size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Guide Detail Modal */}
      {activeGuide && (
        <div className="modal-overlay" onClick={() => setActiveGuide(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  Độ dễ: {activeGuide.difficulty}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', marginTop: '6px' }}>
                  {activeGuide.title}
                </h3>
              </div>

              <button
                className="btn-close-modal"
                onClick={() => setActiveGuide(null)}
                title="Đóng cửa sổ"
              >
                <X size={24} />
              </button>
            </div>

            {/* Steps list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '14px' }}>
              {activeGuide.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  style={{
                    background: '#F8FAFC',
                    border: '2px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '16px 18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#1E40AF',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem'
                      }}>
                        {step.stepNumber}
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: '#0F172A' }}>{step.title}</strong>
                    </div>

                    <button
                      onClick={() => handleReadStep(`Bước ${step.stepNumber}: ${step.title}. ${step.instruction}`)}
                      style={{
                        background: '#EFF6FF',
                        border: 'none',
                        color: '#1D4ED8',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Nghe đọc bước này"
                    >
                      <Volume2 size={16} />
                      <span>Nghe đọc</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '1.05rem', color: '#1E293B', lineHeight: 1.6, marginBottom: step.tip ? '8px' : '0' }}>
                    {step.instruction}
                  </p>

                  {step.tip && (
                    <div style={{
                      background: '#FFFBEB',
                      borderLeft: '4px solid #F59E0B',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.95rem',
                      color: '#92400E',
                      fontWeight: 600
                    }}>
                      💡 <strong>Mẹo nhỏ:</strong> {step.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveGuide(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '14px',
                background: '#1E40AF',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Tôi Đã Hiểu Rõ ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
