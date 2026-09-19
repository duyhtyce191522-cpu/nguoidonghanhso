// Web Notification & Medication Reminder Scheduler Service

import { Reminder } from '../types';
import { speechService } from './speechService';

class NotificationService {
  private notifiedRemindersToday: Set<string> = new Set();
  private schedulerInterval: any = null;

  constructor() {
    this.listenToServiceWorkerMessages();
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  // Trigger a standard system notification with vibration
  async sendNotification(title: string, options: {
    body: string;
    tag?: string;
    data?: any;
    vibrate?: number[];
  }): Promise<boolean> {
    if (!this.isSupported()) return false;

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    const notificationOptions: any = {
      body: options.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: options.tag || 'medication-reminder',
      vibrate: options.vibrate || [200, 100, 200, 100, 300],
      data: options.data || {},
      requireInteraction: true // Keep on screen until acknowledged
    };

    try {
      // Use Service Worker registration if available (preferred on Android & Chrome)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch (e) {
      console.warn('Service worker notification failed, falling back to Notification API:', e);
    }

    try {
      // Fallback to standard window Notification
      const notif = new Notification(title, notificationOptions);
      notif.onclick = () => {
        window.focus();
        if (options.data?.title) {
          speechService.speak(`Bác ơi, đã đến giờ uống thuốc ${options.data.title} rồi nhé ạ!`);
        }
      };
      return true;
    } catch (e) {
      console.warn('Notification failed:', e);
      return false;
    }
  }

  // Send a quick test notification to verify bell and vibration
  async sendTestNotification(): Promise<boolean> {
    const success = await this.sendNotification('💊 [Thử Nghiệm] Đã đến giờ uống thuốc Huyết Áp!', {
      body: 'Liều dùng: 1 viên sau ăn sáng. Nhớ uống cùng nước ấm bác nhé!',
      vibrate: [200, 100, 200],
      data: {
        title: 'Huyết Áp (Amlodipine)'
      }
    });

    if (success) {
      speechService.speak("Đã kích hoạt thông báo thử nghiệm thành công!");
    }
    return success;
  }

  // Start background scheduler that checks every 30 seconds
  startScheduler(getReminders: () => Reminder[]) {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }

    // Reset daily notifications cache at midnight
    const now = new Date();
    const todayDateString = now.toDateString();

    this.schedulerInterval = setInterval(() => {
      const currentNow = new Date();
      // Clear cache if day changed
      if (currentNow.toDateString() !== todayDateString) {
        this.notifiedRemindersToday.clear();
      }

      const currentTimeStr = currentNow.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const reminders = getReminders();

      for (const rem of reminders) {
        // If reminder is scheduled for current minute and not completed and not yet notified
        if (rem.time === currentTimeStr && !rem.completed) {
          const cacheKey = `${todayDateString}-${rem.id}-${rem.time}`;
          if (!this.notifiedRemindersToday.has(cacheKey)) {
            this.notifiedRemindersToday.add(cacheKey);

            // Fire standard system notification
            this.sendNotification(`💊 Bác ơi, đến giờ uống: ${rem.title}!`, {
              body: `Thời gian: ${rem.time} • Liều: ${rem.dosage || 'Theo chỉ định'}. ${rem.note || 'Nhớ uống nước ấm bác nhé!'}`,
              tag: `reminder-${rem.id}`,
              vibrate: [250, 100, 250, 100, 400],
              data: {
                reminderId: rem.id,
                title: rem.title
              }
            });
          }
        }
      }
    }, 25000); // Check every 25 seconds
  }

  stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  // Listen to messages from Service Worker when user clicks a notification
  private listenToServiceWorkerMessages() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          const rem = event.data.reminder;
          // Smooth scroll to reminders section
          const el = document.getElementById('reminders-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          // Speak aloud in Vietnamese
          if (rem && rem.title) {
            speechService.speak(`Bác ơi, đã đến giờ uống thuốc ${rem.title} rồi nhé ạ! Bác uống xong nhớ bấm xác nhận đã uống nhé.`);
          }
        }
      });
    }
  }
}

export const notificationService = new NotificationService();
