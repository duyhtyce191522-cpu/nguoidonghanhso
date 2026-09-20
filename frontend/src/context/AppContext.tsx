import React, { createContext, useContext, useState, useEffect } from 'react';
import { SeniorProfile } from '../types';
import { api } from '../services/api';
import { speechService } from '../services/speechService';

export type AppMode = 'senior' | 'caregiver';
export type FamilyRole = 'caregiver' | 'senior';
export type FontScale = 'normal' | 'large' | 'extra-large';
export type DeviceMode = 'mobile' | 'tablet' | 'fullscreen';

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

  // Multi-Family Authentication & Pairing
  userPhone: string;
  familyRole: FamilyRole | null;
  familyCode: string;
  isRegistered: boolean;
  loginWithPhoneAndPin: (phone: string, pin: string, role: FamilyRole, profileData?: SeniorProfile) => void;
  loginCaregiver: (phone: string, pin: string, familyCode?: string) => void;
  pairSenior: (phone: string, familyCode: string, newProfile?: SeniorProfile) => void;
  logout: () => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem('user_phone') || '';
  });

  const [familyRole, setFamilyRole] = useState<FamilyRole | null>(() => {
    return (localStorage.getItem('family_role') as FamilyRole) || null;
  });

  const [familyCode, setFamilyCode] = useState<string>(() => {
    return localStorage.getItem('family_code') || '';
  });

  const [caregiverPin, setCaregiverPinState] = useState<string>(() => {
    return localStorage.getItem('caregiver_pin') || '1234';
  });

  // If already registered, start in their saved mode. Otherwise default to senior.
  const [mode, setMode] = useState<AppMode>(() => {
    const savedRole = localStorage.getItem('family_role');
    if (savedRole === 'caregiver') return 'caregiver';
    return 'senior';
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('user_phone');
  });

  const [fontScale, setFontScale] = useState<FontScale>('large');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');

  const [profile, setProfile] = useState<SeniorProfile>({
    fullName: 'Nguyễn Văn Hùng',
    preferredGreeting: 'Bác Hùng',
    birthYear: 1952,
    healthNotes: 'Huyết áp hơi cao, hay quên giờ uống thuốc sau ăn sáng.'
  });

  const isRegistered = Boolean(userPhone && familyRole);

  const setCaregiverPin = (pin: string) => {
    setCaregiverPinState(pin);
    localStorage.setItem('caregiver_pin', pin);
    api.setPin(pin, userPhone).catch(e => console.warn("Failed to sync PIN with server", e));
  };

  const loginWithPhoneAndPin = (phone: string, pin: string, role: FamilyRole, profileData?: SeniorProfile) => {
    setUserPhone(phone);
    setFamilyRole(role);
    setCaregiverPinState(pin);
    localStorage.setItem('user_phone', phone);
    localStorage.setItem('family_role', role);
    localStorage.setItem('caregiver_pin', pin);
    if (profileData) {
      setProfile(profileData);
    }
    setMode(role);
    setShowOnboarding(false);
    refreshProfile();
  };

  const loginCaregiver = (phone: string, pin: string, code?: string) => {
    setUserPhone(phone);
    setFamilyRole('caregiver');
    localStorage.setItem('user_phone', phone);
    localStorage.setItem('family_role', 'caregiver');
    if (pin) {
      setCaregiverPinState(pin);
      localStorage.setItem('caregiver_pin', pin);
    }
    if (code) {
      setFamilyCode(code);
      localStorage.setItem('family_code', code);
    }
    setMode('caregiver');
    setShowOnboarding(false);
    refreshProfile();
  };

  const pairSenior = (phone: string, code: string, newProfile?: SeniorProfile) => {
    setUserPhone(phone);
    setFamilyRole('senior');
    setFamilyCode(code);
    localStorage.setItem('user_phone', phone);
    localStorage.setItem('family_role', 'senior');
    localStorage.setItem('family_code', code);
    if (newProfile) {
      setProfile(newProfile);
    }
    setMode('senior');
    setShowOnboarding(false);
    refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('user_phone');
    localStorage.removeItem('family_role');
    localStorage.removeItem('family_code');
    localStorage.removeItem('caregiver_pin');
    setUserPhone('');
    setFamilyRole(null);
    setFamilyCode('');
    setCaregiverPinState('1234');
    setMode('senior');
    setShowOnboarding(true);
  };

  const unlockAudio = () => {
    speechService.unlockAudio();
  };

  const refreshProfile = async () => {
    try {
      const data = await api.getCaregiverDashboard();
      if (data && data.profile) {
        setProfile(data.profile);
        if (data.familyCode) {
          setFamilyCode(data.familyCode);
          localStorage.setItem('family_code', data.familyCode);
        }
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
  }, [userPhone]);

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
        unlockAudio,
        userPhone,
        familyRole,
        familyCode,
        isRegistered,
        loginWithPhoneAndPin,
        loginCaregiver,
        pairSenior,
        logout,
        showOnboarding,
        setShowOnboarding
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
