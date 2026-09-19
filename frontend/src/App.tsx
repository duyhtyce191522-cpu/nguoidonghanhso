import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { api } from './services/api';
import { Reminder, NewsItem, GuideItem } from './types';
import { Header } from './components/common/Header';
import { DeviceFrame } from './components/common/DeviceFrame';
import { VoiceAssistant } from './components/senior/VoiceAssistant';
import { ReminderCard } from './components/senior/ReminderCard';
import { NewsReader } from './components/senior/NewsReader';
import { DeviceGuides } from './components/senior/DeviceGuides';
import { SOSButton } from './components/senior/SOSButton';
import { CaregiverHome } from './components/caregiver/CaregiverHome';

export const AppContent: React.FC = () => {
  const { mode } = useApp();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [remList, newsList, guideList] = await Promise.all([
        api.getReminders(),
        api.getNews(),
        api.getGuides()
      ]);
      setReminders(remList);
      setNews(newsList);
      setGuides(guideList);
    } catch (e) {
      console.error("Initial fetch error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <Header />

        <main className="main-content">
          {mode === 'senior' ? (
            <div>
              {/* Senior Voice Assistant Section */}
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

              {/* Reminders & Medications */}
              <ReminderCard
                reminders={reminders}
                onToggle={handleToggleReminder}
              />

              {/* Step-by-Step Tech Guides */}
              <div id="guides-section">
                <DeviceGuides guides={guides} />
              </div>

              {/* Elderly News & Weather Reader */}
              <div id="news-section">
                <NewsReader newsList={news} />
              </div>

              {/* Emergency SOS Fixed / Banner Action */}
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
