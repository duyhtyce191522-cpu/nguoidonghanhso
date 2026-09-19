import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { api } from './services/api';
import { Reminder, NewsItem, GuideItem, EmergencyContact } from './types';
import { Header } from './components/common/Header';
import { DeviceFrame } from './components/common/DeviceFrame';
import { VoiceAssistant } from './components/senior/VoiceAssistant';
import { QuickAppDock } from './components/senior/QuickAppDock';
import { ReminderCard } from './components/senior/ReminderCard';
import { NewsReader } from './components/senior/NewsReader';
import { DeviceGuides } from './components/senior/DeviceGuides';
import { SOSButton } from './components/senior/SOSButton';
import { CaregiverHome } from './components/caregiver/CaregiverHome';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { notificationService } from './services/notificationService';

export const AppContent: React.FC = () => {
  const { mode } = useApp();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [remList, newsList, guideList, contactList] = await Promise.all([
        api.getReminders(),
        api.getNews(),
        api.getGuides(),
        api.getContacts()
      ]);
      setReminders(remList);
      setNews(newsList);
      setGuides(guideList);
      setContacts(contactList);
    } catch (e) {
      console.error("Initial fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run notification scheduler in background for active reminders
  useEffect(() => {
    if (reminders.length > 0) {
      notificationService.startScheduler(() => reminders);
    }
    return () => notificationService.stopScheduler();
  }, [reminders]);

  const handleToggleReminder = async (id: string) => {
    try {
      const updated = await api.toggleReminder(id);
      if (updated) {
        setReminders(prev => prev.map(r => r.id === id ? updated : r));
      }
    } catch (e) {
      console.error("Toggle reminder error", e);
    }
  };

  return (
    <DeviceFrame>
      <div className="app-container">
        {/* PWA Home Screen Install Banner */}
        <PWAInstallBanner />

        <Header />

        <main className="main-content">
          {mode === 'senior' ? (
            <div className="senior-flow-layout">
              {/* 1. Senior Voice & Google Knowledge Assistant */}
              <VoiceAssistant
                onOpenNews={() => {
                  const el = document.getElementById('news-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenGuides={() => {
                  const el = document.getElementById('guides-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onRefreshReminders={fetchData}
              />

              {/* 2. Quick App Dock (YouTube, Facebook, TikTok, Zalo) */}
              <QuickAppDock />

              {/* 3. Medication & Health Reminders */}
              <ReminderCard
                reminders={reminders}
                onToggle={handleToggleReminder}
              />

              {/* 4. Step-by-Step Tech Guides */}
              <div id="guides-section">
                <DeviceGuides guides={guides} contacts={contacts} />
              </div>

              {/* 5. Elderly News & Weather Reader */}
              <div id="news-section">
                <NewsReader newsList={news} />
              </div>

              {/* 6. Emergency SOS Action */}
              <SOSButton />
            </div>
          ) : (
            <CaregiverHome />
          )}
        </main>
      </div>
    </DeviceFrame>
  );
};

export default AppContent;
