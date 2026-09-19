import React, { createContext, useContext, useState, useEffect } from 'react';
import { SeniorProfile } from '../types';
import { api } from '../services/api';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('senior');
  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [profile, setProfile] = useState<SeniorProfile>({
    fullName: 'Nguyễn Văn Hùng',
    preferredGreeting: 'Bác Hùng',
    birthYear: 1952,
    healthNotes: 'Huyết áp hơi cao, hay quên giờ uống thuốc sau ăn sáng.'
  });

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
        refreshProfile
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
