// Notification utility functions
export class NotificationSound {
  private audio: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audio = new Audio("/notification-sound.mp3");
      this.audio.preload = "auto";
      this.audio.volume = 0.7; // Set volume to 70%
    } catch (error) {
      console.warn("Could not initialize notification audio:", error);
    }
  }

  public async playNotificationSound() {
    if (!this.audio) {
      this.initializeAudio();
    }

    try {
      if (this.audio) {
        // Reset audio to beginning in case it was already played
        this.audio.currentTime = 0;
        await this.audio.play();
      }
    } catch (error) {
      console.warn("Could not play notification sound:", error);
      // Fallback to browser notification sound or system beep
      this.playFallbackNotification();
    }
  }

  private playFallbackNotification() {
    // Create a simple beep sound using Web Audio API as fallback
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // 800 Hz tone
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn("Could not play fallback notification sound:", error);
    }
  }

  public setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// Request notification permission from the browser
export const requestNotificationPermission = async () => {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

// Show a browser notification
export const showBrowserNotification = (
  title: string,
  body: string,
  options?: NotificationOptions
) => {
  if ("Notification" in window && Notification.permission === "granted") {
    return new Notification(title, {
      body,
      icon: "/zap.svg", // Using the existing app icon
      badge: "/zap.svg",
      tag: "new-order", // This will replace previous notifications with the same tag
      ...options,
    });
  }
  return null;
};
