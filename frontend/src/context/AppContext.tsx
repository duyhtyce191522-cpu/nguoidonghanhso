import React, { createContext, useContext, useState, useEffect } from 'react';
import { SeniorProfile } from '../types';
import { api } from '../services/api';
import { speechService } from '../services/speechService';

type AppMode = 'senior' | 'caregiver';
type FontScale = 'normal' | 'large' | 'extra-large';
type DeviceMode = 'mobile' | 'tablet' | 'fullscreen';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (device: DeviceMode) => void;
  profile: SeniorProfile;
  setProfile: React.Dispatch<React.SetStateAction<SeniorProfile>>;
  refreshProfile: () => Promise<void>;
  caregiverPin: string;
  setCaregiverPin: (pin: string) => void;
  unlockAudio: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('senior');
  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [caregiverPin, setCaregiverPinState] = useState<string>(() => {
    return localStorage.getItem('caregiver_pin') || '1234';
  });

  const setCaregiverPin = (pin: string) => {
    setCaregiverPinState(pin);
    localStorage.setItem('caregiver_pin', pin);
  };

  const [profile, setProfile] = useState<SeniorProfile>({
    fullName: 'Nguyễn Văn Hùng',
    preferredGreeting: 'Bác Hùng',
    birthYear: 1952,
    healthNotes: 'Huyết áp hơi cao, hay quên giờ uống thuốc sau ăn sáng.'
  });

  const unlockAudio = () => {
    speechService.unlockAudio();
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getCaregiverDashboard();
      if (data && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.warn("Could not fetch profile", e);
    }
  };

  useEffect(() => {
    refreshProfile();
    // Pre-unlock audio on any body touch or click
    const handleFirstGesture = () => {
      speechService.unlockAudio();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-font', fontScale);
    document.body.setAttribute('data-mode', mode);
  }, [fontScale, mode]);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        fontScale,
        setFontScale,
        deviceMode,
        setDeviceMode,
        profile,
        setProfile,
        refreshProfile,
        caregiverPin,
        setCaregiverPin,
        unlockAudio
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
