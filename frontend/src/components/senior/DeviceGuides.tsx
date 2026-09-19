import React, { useState, useEffect } from 'react';
import { GuideItem, EmergencyContact } from '../../types';
import { speechService } from '../../services/speechService';
import {
  BookOpen,
  Video,
  ShieldAlert,
  Thermometer,
  ChevronRight,
  X,
  Volume2,
  ArrowLeft,
  ArrowRight,
  PhoneCall,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface DeviceGuidesProps {
  guides: GuideItem[];
  contacts?: EmergencyContact[];
}

export const DeviceGuides: React.FC<DeviceGuidesProps> = ({ guides, contacts = [] }) => {
  const [activeGuide, setActiveGuide] = useState<GuideItem | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Zalo calling & auto-redirect states
  const [selectedContactPhone, setSelectedContactPhone] = useState<string>('');
  const [zaloCountdown, setZaloCountdown] = useState<number | null>(null);
  const [isZaloOpened, setIsZaloOpened] = useState(false);

  // Set default contact
  useEffect(() => {
    if (contacts.length > 0 && !selectedContactPhone) {
      const primary = contacts.find(c => c.isPrimary) || contacts[0];
      setSelectedContactPhone(primary.phone);
    }
  }, [contacts, selectedContactPhone]);

  // Handle countdown when on the last step of Zalo guide
  useEffect(() => {
    let timer: any;
    if (zaloCountdown !== null && zaloCountdown > 0) {
      timer = setTimeout(() => {
        setZaloCountdown(zaloCountdown - 1);
      }, 1000);
    } else if (zaloCountdown === 0) {
      handleTriggerZaloCall();
    }
    return () => clearTimeout(timer);
  }, [zaloCountdown]);

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
    setZaloCountdown(null);
    setIsZaloOpened(false);

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

  const currentContact = contacts.find(c => c.phone === selectedContactPhone) || contacts[0] || {
    name: 'Con gái Mai Lan',
    phone: '0912 345 678',
    relation: 'Con gái cả'
  };

  const handleNextStep = () => {
    if (!activeGuide) return;
    if (activeStepIndex < activeGuide.steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      const step = activeGuide.steps[nextIdx];

      // If entering final step of Zalo guide, trigger auto-countdown
      if (activeGuide.id.includes('zalo') && nextIdx === activeGuide.steps.length - 1) {
        handleReadStep(
          `Bước ${step.stepNumber}: ${step.title}. ${step.instruction}. Bác đã hoàn thành các bước! Ứng dụng sẽ tự động chuyển sang Zalo gọi cho ${currentContact.name} sau 4 giây nữa nhé!`
        );
        setZaloCountdown(4);
      } else {
        handleReadStep(`Bước ${step.stepNumber}: ${step.title}. ${step.instruction}`);
      }
    }
  };

  const handlePrevStep = () => {
    if (!activeGuide) return;
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      setActiveStepIndex(prevIdx);
      setZaloCountdown(null);
      const step = activeGuide.steps[prevIdx];
      handleReadStep(`Bước ${step.stepNumber}: ${step.title}. ${step.instruction}`);
    }
  };

  const handleTriggerZaloCall = () => {
    setZaloCountdown(null);
    setIsZaloOpened(true);

    const cleanPhone = (selectedContactPhone || currentContact.phone || '0912345678').replace(/\s+/g, '');
    const zaloUrl = `https://zalo.me/${cleanPhone}`;

    speechService.stopSpeaking();
    speechService.speak(`Dạ, cháu đang chuyển sang Zalo để bác gọi cho ${currentContact.name} đây ạ!`);

    // Open Zalo in a new tab or trigger Zalo native app
    window.open(zaloUrl, '_blank');
  };

  const handleCancelAutoZalo = () => {
    setZaloCountdown(null);
    speechService.stopSpeaking();
  };

  const handleClose = () => {
    setZaloCountdown(null);
    setIsZaloOpened(false);
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
            className="guide-card-tile"
          >
            <div>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '16px',
                background: getGuideBgColor(guide.id),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: guide.id.includes('zalo') ? '0 6px 16px rgba(2, 132, 199, 0.35)' : guide.id.includes('fraud') ? '0 6px 16px rgba(220, 38, 38, 0.35)' : '0 6px 16px rgba(5, 150, 105, 0.35)'
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
              <span>
                {guide.id.includes('zalo') ? 'Xem & Gọi Zalo ngay' : `Xem hướng dẫn (${guide.steps.length} bước)`}
              </span>
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
                    setZaloCountdown(null);
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
              const isLastStep = activeStepIndex === activeGuide.steps.length - 1;
              const isZaloGuide = activeGuide.id.includes('zalo');

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
                      fontWeight: 600,
                      marginBottom: '10px'
                    }}>
                      💡 <strong>Mẹo nhỏ:</strong> {currentStep.tip}
                    </div>
                  )}

                  {/* SPECIAL AUTOMATIC ZALO CALL CARD ON FINAL STEP */}
                  {isZaloGuide && isLastStep && (
                    <div style={{
                      marginTop: '16px',
                      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                      border: '2.5px solid #3B82F6',
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{
                          background: '#0284C7',
                          color: 'white',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          fontSize: '0.82rem',
                          fontWeight: 800
                        }}>
                          ZALO
                        </div>
                        <strong style={{ fontSize: '1.05rem', color: '#1E3A8A' }}>
                          Tự Động Kết Nối Zalo Người Thân
                        </strong>
                      </div>

                      {/* Select Contact if multiple */}
                      {contacts.length > 1 && (
                        <div style={{ marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Chọn người muốn gọi:
                          </label>
                          <select
                            value={selectedContactPhone}
                            onChange={(e) => {
                              setSelectedContactPhone(e.target.value);
                              setZaloCountdown(4);
                            }}
                            className="form-select"
                            style={{ padding: '8px 12px', fontSize: '0.95rem' }}
                          >
                            {contacts.map(c => (
                              <option key={c.id} value={c.phone}>
                                {c.name} ({c.relation}) - {c.phone}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Countdown & Status */}
                      {zaloCountdown !== null && zaloCountdown > 0 && (
                        <div style={{
                          background: '#FEF3C7',
                          border: '1.5px solid #FCD34D',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          margin: '10px 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}>
                          <div style={{ fontSize: '0.95rem', color: '#92400E', fontWeight: 700 }}>
                            ⏱️ Đang tự động chuyển sang Zalo sau: <strong>{zaloCountdown} giây...</strong>
                          </div>
                          <button
                            onClick={handleCancelAutoZalo}
                            style={{
                              background: '#FDE68A',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              color: '#78350F',
                              cursor: 'pointer'
                            }}
                          >
                            Dừng lại
                          </button>
                        </div>
                      )}

                      {isZaloOpened && (
                        <div style={{
                          background: '#DCFCE7',
                          border: '1.5px solid #86EFAC',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          margin: '10px 0',
                          color: '#166534',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <CheckCircle2 size={18} />
                          <span>Đã mở Zalo để kết nối tới {currentContact.name}!</span>
                        </div>
                      )}

                      {/* Big Action Button to Open Zalo */}
                      <button
                        onClick={handleTriggerZaloCall}
                        style={{
                          width: '100%',
                          minHeight: '56px',
                          padding: '12px 20px',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                          color: 'white',
                          border: 'none',
                          fontSize: '1.1rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                          transition: 'all 0.15s ease',
                          marginTop: '8px'
                        }}
                      >
                        <Video size={24} />
                        <span>MỞ ZALO GỌI CHO {currentContact.name.toUpperCase()} NGAY</span>
                        <ExternalLink size={18} />
                      </button>

                      <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.8rem', color: '#64748B' }}>
                        (Bấm nút này sẽ tự động mở ứng dụng Zalo trên điện thoại để bác gọi nói chuyện)
                      </div>
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
