// Web & Native Capacitor Local Notification & Medication Reminder Scheduler Service

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Reminder } from '../types';
import { speechService } from './speechService';

class NotificationService {
  private notifiedRemindersToday: Set<string> = new Set();
  private schedulerInterval: any = null;
  private isNative: boolean = false;
  private channelCreated: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.init();
  }

  private async init() {
    if (this.isNative) {
      await this.setupNativeChannel();
      this.listenToNativeNotificationAction();
    } else {
      this.listenToServiceWorkerMessages();
    }
  }

  // Setup High-Priority Android Notification Channel (Loud Sound, Vibrate, Lock Screen)
  private async setupNativeChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'medication_alarms',
        name: 'Chuông Báo Uống Thuốc Khẩn Thiết',
        description: 'Thông báo to rõ, rung mạnh trên màn hình khóa khi đến giờ uống thuốc',
        importance: 5, // 5 = Urgent / High priority on Android
        visibility: 1, // 1 = Public (Display full notification on lock screen)
        vibration: true,
        lights: true,
        lightColor: '#DC2626'
      });
      this.channelCreated = true;
    } catch (e) {
      console.warn('Native notification channel creation failed:', e);
    }
  }

  isSupported(): boolean {
    if (this.isNative) return true;
    return 'Notification' in window;
  }

  getPermission(): string {
    if (this.isNative) return 'granted';
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    if (this.isNative) {
      try {
        const res = await LocalNotifications.requestPermissions();
        return res.display === 'granted';
      } catch (e) {
        console.warn('Native permission request failed:', e);
        return false;
      }
    }

    if (!('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      console.warn('Web notification permission request failed:', e);
      return false;
    }
  }

  // Trigger a system notification (works on both Native Android and Web)
  async sendNotification(title: string, options: {
    body: string;
    tag?: string;
    data?: any;
    vibrate?: number[];
  }): Promise<boolean> {
    const granted = await this.requestPermission();
    if (!granted) return false;

    if (this.isNative) {
      try {
        const numericId = Math.floor(Math.random() * 1000000) + 1;
        await LocalNotifications.schedule({
          notifications: [
            {
              id: numericId,
              title,
              body: options.body,
              channelId: 'medication_alarms',
              schedule: { at: new Date(Date.now() + 500), allowWhileIdle: true },
              extra: options.data || {},
              smallIcon: 'ic_launcher',
              iconColor: '#059669'
            }
          ]
        });
        return true;
      } catch (e) {
        console.warn('Native notification schedule error:', e);
      }
    }

    // Web Browser fallback
    const notificationOptions: any = {
      body: options.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: options.tag || 'medication-reminder',
      vibrate: options.vibrate || [200, 100, 200, 100, 300],
      data: options.data || {},
      requireInteraction: true
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch (e) {
      console.warn('Service worker notification failed:', e);
    }

    try {
      const notif = new Notification(title, notificationOptions);
      notif.onclick = () => {
        window.focus();
        if (options.data?.title) {
          speechService.speak(`Bác ơi, đã đến giờ uống thuốc ${options.data.title} rồi nhé ạ!`);
        }
      };
      return true;
    } catch (e) {
      console.warn('Web notification failed:', e);
      return false;
    }
  }

  // Send test notification to verify bell and vibration
  async sendTestNotification(): Promise<boolean> {
    const success = await this.sendNotification('💊 [Thử Nghiệm] Đã đến giờ uống thuốc Huyết Áp!', {
      body: 'Liều dùng: 1 viên sau ăn sáng. Nhớ uống cùng nước ấm bác nhé!',
      vibrate: [250, 100, 250, 100, 400],
      data: {
        title: 'Huyết Áp (Amlodipine)'
      }
    });

    if (success) {
      speechService.speak("Đã kích hoạt chuông báo nhắc thuốc thử nghiệm thành công!");
    }
    return success;
  }

  // Schedule native recurring daily alarms for all active reminders
  async scheduleAllRemindersNatively(reminders: Reminder[]) {
    if (!this.isNative) return;

    try {
      // Cancel previous pending reminders before rescheduling
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const notifsToSchedule = [];
      const now = new Date();

      for (let i = 0; i < reminders.length; i++) {
        const rem = reminders[i];
        if (rem.completed) continue;

        const parts = rem.time.split(':');
        if (parts.length !== 2) continue;
        const targetHours = parseInt(parts[0], 10);
        const targetMinutes = parseInt(parts[1], 10);

        const scheduledTime = new Date();
        scheduledTime.setHours(targetHours, targetMinutes, 0, 0);

        // If today's time has already passed, schedule for tomorrow
        if (scheduledTime.getTime() <= now.getTime()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        notifsToSchedule.push({
          id: (i + 1) * 1000 + targetHours * 60 + targetMinutes,
          title: `💊 Bác ơi, đến giờ uống: ${rem.title}!`,
          body: `Thời gian: ${rem.time} • Liều: ${rem.dosage || 'Theo chỉ định'}. ${rem.note || 'Nhớ uống nước ấm bác nhé!'}`,
          channelId: 'medication_alarms',
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day' as const,
            allowWhileIdle: true
          },
          extra: {
            reminderId: rem.id,
            title: rem.title
          },
          smallIcon: 'ic_launcher',
          iconColor: '#059669'
        });
      }

      if (notifsToSchedule.length > 0) {
        await LocalNotifications.schedule({ notifications: notifsToSchedule });
        console.log(`[NotificationService] Scheduled ${notifsToSchedule.length} native alarms.`);
      }
    } catch (e) {
      console.warn('Failed to schedule native recurring alarms:', e);
    }
  }

  // Foreground polling scheduler (runs when app is active)
  startScheduler(getReminders: () => Reminder[]) {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }

    // Schedule native alarms once when reminders update
    const initialReminders = getReminders();
    this.scheduleAllRemindersNatively(initialReminders);

    const now = new Date();
    const todayDateString = now.toDateString();

    this.schedulerInterval = setInterval(() => {
      const currentNow = new Date();
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
        if (rem.time === currentTimeStr && !rem.completed) {
          const cacheKey = `${todayDateString}-${rem.id}-${rem.time}`;
          if (!this.notifiedRemindersToday.has(cacheKey)) {
            this.notifiedRemindersToday.add(cacheKey);

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
    }, 25000);
  }

  stopScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  // Listen to native tap actions
  private listenToNativeNotificationAction() {
    try {
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
        const extra = notificationAction.notification.extra;
        const el = document.getElementById('reminders-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        if (extra && extra.title) {
          speechService.speak(`Bác ơi, đã đến giờ uống thuốc ${extra.title} rồi nhé ạ! Bác uống xong nhớ bấm xác nhận đã uống nhé.`);
        }
      });
    } catch (e) {
      console.warn('Native notification listener registration failed:', e);
    }
  }

  private listenToServiceWorkerMessages() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
          const rem = event.data.reminder;
          const el = document.getElementById('reminders-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
          if (rem && rem.title) {
            speechService.speak(`Bác ơi, đã đến giờ uống thuốc ${rem.title} rồi nhé ạ! Bác uống xong nhớ bấm xác nhận đã uống nhé.`);
          }
        }
      });
    }
  }
}

export const notificationService = new NotificationService();
