import React, { useState } from 'react';
import { GuideItem } from '../../types';
import { speechService } from '../../services/speechService';
import { BookOpen, Video, ShieldAlert, Thermometer, ChevronRight, X, Volume2, ArrowLeft, ArrowRight } from 'lucide-react';

interface DeviceGuidesProps {
  guides: GuideItem[];
}

export const DeviceGuides: React.FC<DeviceGuidesProps> = ({ guides }) => {
  const [activeGuide, setActiveGuide] = useState<GuideItem | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const getGuideIcon = (id: string) => {
    if (id.includes('zalo')) return <Video size={28} color="white" />;
    if (id.includes('fraud')) return <ShieldAlert size={28} color="white" />;
    return <Thermometer size={28} color="white" />;
  };

  const getGuideBgColor = (id: string) => {
    if (id.includes('zalo')) return 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)';
    if (id.includes('fraud')) return 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
    return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
  };

  const handleOpenGuide = (guide: GuideItem) => {
    setActiveGuide(guide);
    setActiveStepIndex(0);
    // Read the first step aloud automatically
    const firstStep = guide.steps[0];
    if (firstStep) {
      handleReadStep(`Hướng dẫn: ${guide.title}. Bước 1: ${firstStep.title}. ${firstStep.instruction}`);
    }
  };

  const handleReadStep = (stepText: string) => {
    speechService.stopSpeaking();
    speechService.speak(stepText);
  };

  const handleNextStep = () => {
    if (!activeGuide) return;
    if (activeStepIndex < activeGuide.steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      const step = activeGuide.steps[nextIdx];
      handleReadStep(`Bước ${step.stepNumber}: ${step.title}. ${step.instruction}`);
    }
  };

  const handlePrevStep = () => {
    if (!activeGuide) return;
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      setActiveStepIndex(prevIdx);
      const step = activeGuide.steps[prevIdx];
      handleReadStep(`Bước ${step.stepNumber}: ${step.title}. ${step.instruction}`);
    }
  };

  const handleClose = () => {
    speechService.stopSpeaking();
    setActiveGuide(null);
  };

  return (
    <div id="guides-section" style={{ marginTop: '24px' }}>
      <div className="section-header">
        <div className="section-title">
          <BookOpen size={24} color="#1E40AF" />
          <span>Cẩm Nang Công Nghệ & Sống Khỏe</span>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {guides.map((guide) => (
          <div
            key={guide.id}
            onClick={() => handleOpenGuide(guide)}
            style={{
              background: '#FFFFFF',
              border: '2.5px solid #E2E8F0',
              borderRadius: '18px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: getGuideBgColor(guide.id),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                {getGuideIcon(guide.id)}
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px', lineHeight: 1.3 }}>
                {guide.title}
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.45, marginBottom: '12px' }}>
                {guide.description}
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#1D4ED8',
              fontWeight: 800,
              fontSize: '0.92rem',
              borderTop: '1px solid #F1F5F9',
              paddingTop: '10px'
            }}>
              <span>Xem hướng dẫn ({guide.steps.length} bước)</span>
              <ChevronRight size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Guide Detail Mobile Bottom Sheet / Modal */}
      {activeGuide && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  Độ dễ: {activeGuide.difficulty}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: '4px', lineHeight: 1.3 }}>
                  {activeGuide.title}
                </h3>
              </div>

              <button
                className="btn-close-modal"
                onClick={handleClose}
                title="Đóng cửa sổ"
              >
                <X size={22} />
              </button>
            </div>

            {/* Step Progress Indicators */}
            <div style={{ display: 'flex', gap: '6px', margin: '12px 0 16px' }}>
              {activeGuide.steps.map((s, idx) => (
                <div
                  key={s.stepNumber}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    handleReadStep(`Bước ${s.stepNumber}: ${s.title}. ${s.instruction}`);
                  }}
                  style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: '4px',
                    background: idx === activeStepIndex ? '#1E40AF' : idx < activeStepIndex ? '#059669' : '#E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title={`Bước ${s.stepNumber}`}
                />
              ))}
            </div>

            {/* Active Step Card */}
            {(() => {
              const currentStep = activeGuide.steps[activeStepIndex];
              return (
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '2px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '16px',
                    minHeight: '180px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        {currentStep.stepNumber}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: '#0F172A' }}>{currentStep.title}</strong>
                    </div>

                    <button
                      onClick={() => handleReadStep(`Bước ${currentStep.stepNumber}: ${currentStep.title}. ${currentStep.instruction}`)}
                      style={{
                        background: '#EFF6FF',
                        border: 'none',
                        color: '#1D4ED8',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Nghe đọc bước này"
                    >
                      <Volume2 size={15} />
                      <span>Nghe đọc</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '1.08rem', color: '#1E293B', lineHeight: 1.6, margin: '12px 0' }}>
                    {currentStep.instruction}
                  </p>

                  {currentStep.tip && (
                    <div style={{
                      background: '#FFFBEB',
                      borderLeft: '4px solid #F59E0B',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.9rem',
                      color: '#92400E',
                      fontWeight: 600
                    }}>
                      💡 <strong>Mẹo nhỏ:</strong> {currentStep.tip}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Navigation Buttons [Bước trước] [Bước tiếp theo] */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={handlePrevStep}
                disabled={activeStepIndex === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: activeStepIndex === 0 ? '#F1F5F9' : '#E2E8F0',
                  color: activeStepIndex === 0 ? '#94A3B8' : '#1E293B',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: activeStepIndex === 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={18} />
                <span>Bước trước</span>
              </button>

              {activeStepIndex < activeGuide.steps.length - 1 ? (
                <button
                  onClick={handleNextStep}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#1E40AF',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Bước tiếp theo</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  Tôi Đã Hiểu Xong ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
