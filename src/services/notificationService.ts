/**
 * AYZEK Proactive Notification Engine
 * Multi-layer Notification Dispatcher:
 * 1. Native Capacitor LocalNotifications (Android & iOS Store Apps)
 * 2. Service Worker Push Notification (Android Chrome & iOS 16.4+ Safari PWA)
 * 3. Fallback Web Notification API
 * 4. High-Fidelity Synthesizer Chime (Web Audio API)
 * 5. Device Haptic Feedback (Vibration API)
 * 6. Dynamic In-App Island Banner Dispatcher (Guaranteed visibility in any preview/iframe)
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ProactivePushPayload {
  id: string;
  title: string;
  body: string;
  tag?: string;
  category?: 'briefing' | 'burnout' | 'relationship' | 'commitment' | 'decision' | 'system';
  data?: any;
  delaySeconds?: number;
}

export type InAppNotificationCallback = (payload: ProactivePushPayload & { timestamp: Date }) => void;

class NotificationService {
  private audioCtx: AudioContext | null = null;
  private subscribers: Set<InAppNotificationCallback> = new Set();

  // Subscribe to proactive notifications for in-app floating banner display
  subscribe(callback: InAppNotificationCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Check if browser/environment supports notifications
  isSupported(): boolean {
    if (Capacitor.isNativePlatform()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission {
    if (Capacitor.isNativePlatform()) return 'granted';
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Request user permission for real system notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await LocalNotifications.requestPermissions();
        return res.display === 'granted' ? 'granted' : 'denied';
      } catch (e) {
        console.warn('Native local notification permission error:', e);
        return 'granted';
      }
    }

    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return 'denied';
    }
  }

  // Soft futuristic two-tone pleasant chime via Web Audio API
  playChime() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (this.audioCtx) {
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        // Elegant futuristic two-tone bell chime (C6 to G6 chord)
        osc.frequency.setValueAtTime(1046.5, now); // C6
        osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12); // G6

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (err) {
      // Audio playback might be restricted if user hasn't interacted with document yet
    }
  }

  // Trigger haptic vibration on Android and iOS devices
  triggerHaptic(pattern: number[] = [120, 80, 140]) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored on platforms without vibration motor
      }
    }
  }

  // Dispatch a real proactive notification across all supported layers
  async sendNotification(payload: ProactivePushPayload): Promise<boolean> {
    const { title, body, tag = 'ayzek-proactive', data, category = 'system' } = payload;

    // 1. Play auditory feedback & haptics immediately
    this.playChime();
    this.triggerHaptic([120, 80, 140]);

    // 2. Broadcast to in-app banner listeners (guaranteed in-app visibility in preview/iframe)
    const enrichedPayload = { ...payload, category, timestamp: new Date() };
    this.subscribers.forEach((cb) => {
      try {
        cb(enrichedPayload);
      } catch (e) {
        console.error('Error notifying in-app subscriber:', e);
      }
    });

    // 3. If running inside native Android or iOS Capacitor shell
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 1000000),
              title,
              body,
              schedule: { at: new Date(Date.now() + 100) },
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#06b6d4',
              sound: 'beep.wav',
              extra: data,
            },
          ],
        });
        return true;
      } catch (err) {
        console.warn('Native LocalNotifications error, falling back to Web Notification:', err);
      }
    }

    // 4. Web Notification / PWA Service Worker push
    if (!this.isSupported()) {
      return true; // Already displayed via in-app banner & chime
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      try {
        permission = await this.requestPermission();
      } catch {
        // default remains
      }
    }

    if (permission === 'granted') {
      try {
        // Service Worker notification works in background on Android Chrome & iOS 16.4+ Safari PWA
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration && 'showNotification' in registration) {
            await registration.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/favicon.png',
              tag,
              vibrate: [150, 80, 150],
              data: {
                url: window.location.origin,
                ...data,
              },
            } as any);
            return true;
          }
        }

        // Window Notification constructor fallback
        const notif = new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          tag,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        return true;
      } catch (err) {
        console.warn('Native browser notification dispatch notice:', err);
      }
    }

    return true;
  }

  // Schedule a delayed proactive notification (ideal for testing lock screen popups)
  scheduleNotification(payload: ProactivePushPayload, delaySeconds: number): NodeJS.Timeout {
    return setTimeout(() => {
      this.sendNotification(payload);
    }, delaySeconds * 1000);
  }
}

export const notificationService = new NotificationService();
