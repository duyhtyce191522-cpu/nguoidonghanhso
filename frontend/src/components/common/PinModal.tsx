import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Lock, Delete, X, AlertCircle, ShieldCheck } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { caregiverPin } = useApp();
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setErrorMessage('');

    if (nextPin.length === 4) {
      if (nextPin === caregiverPin) {
        setEnteredPin('');
        onSuccess();
      } else {
        setErrorMessage('Mã PIN không đúng. Vui lòng thử lại!');
        setTimeout(() => {
          setEnteredPin('');
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClose = () => {
    setEnteredPin('');
    setErrorMessage('');
    onClose();
  };

  return createPortal(
    <div className="modal-overlay pin-modal-overlay" onClick={handleClose}>
      <div
        className="pin-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} />
            </div>
            <strong style={{ fontSize: '1.2rem', color: '#16281E' }}>Khóa Người Nhà</strong>
          </div>

          <button
            onClick={handleClose}
            className="btn-close-modal"
            title="Đóng"
            style={{ width: 36, height: 36 }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#576B60', marginBottom: '14px', textAlign: 'center' }}>
          Nhập mã PIN 4 số để vào trang quản trị (Tránh trường hợp ông/bà bấm nhầm):
        </p>

        {/* PIN Circles Display */}
        <div className="pin-display">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`pin-dot ${index < enteredPin.length ? 'filled' : ''} ${errorMessage ? 'error' : ''}`}
            >
              {index < enteredPin.length ? '•' : ''}
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="pin-error-text">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="pin-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              className="pin-key"
              onClick={() => handleDigit(digit)}
            >
              {digit}
            </button>
          ))}
          <button
            className="pin-key aux"
            onClick={handleClose}
          >
            Hủy
          </button>
          <button
            className="pin-key"
            onClick={() => handleDigit('0')}
          >
            0
          </button>
          <button
            className="pin-key aux"
            onClick={handleDelete}
            title="Xóa 1 số"
          >
            <Delete size={22} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.84rem', color: '#576B60' }}>
          💡 Mã PIN mặc định: <strong style={{ color: '#386641' }}>1234</strong> (có thể đổi trong cài đặt)
        </div>
      </div>
    </div>,
    document.body
  );
};
