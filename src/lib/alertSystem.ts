// Enhanced Air Raid Alert System for FIXER MVP
export interface Alert {
  id: string;
  type: 'air_raid' | 'all_clear' | 'missile_threat' | 'artillery';
  region: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  message: string;
  coordinates?: [number, number];
  radius?: number; // Alert radius in meters
  active: boolean;
  officialSource: boolean;
}

class AlertSystem {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private alertCallbacks: ((alert: Alert) => void)[] = [];
  private audioContext: AudioContext | null = null;
  private isAudioEnabled = true;

  constructor() {
    this.initializeWebSocket();
    this.initializeAudio();
    this.requestNotificationPermission();
  }

  private initializeWebSocket() {
    // Connect to alert WebSocket (would need actual Ukrainian alert API)
    try {
      this.ws = new WebSocket(process.env.REACT_APP_ALERT_WEBSOCKET_URL || 'wss://api.alerts.gov.ua/ws');
      
      this.ws.onopen = () => {
        console.log('Alert system connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const alert: Alert = JSON.parse(event.data);
          this.handleAlert(alert);
        } catch (error) {
          console.error('Failed to parse alert:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Alert system disconnected');
        this.reconnectWithBackoff();
      };

      this.ws.onerror = (error) => {
        console.error('Alert system error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private reconnectWithBackoff() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
        this.initializeWebSocket();
      }, this.reconnectDelay);
    }
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private async handleAlert(alert: Alert) {
    console.log('Received alert:', alert);
    
    // Store alert locally
    this.storeAlert(alert);
    
    // Trigger audio warning
    if (alert.type === 'air_raid' && this.isAudioEnabled) {
      await this.playAlertSound(alert.severity);
    }
    
    // Show push notification
    this.showNotification(alert);
    
    // Trigger haptic feedback
    if (navigator.vibrate) {
      const pattern = alert.severity === 'critical' ? [200, 100, 200, 100, 200] : [200];
      navigator.vibrate(pattern);
    }
    
    // Notify all subscribers
    this.alertCallbacks.forEach(callback => callback(alert));
  }

  private async playAlertSound(severity: Alert['severity']) {
    if (!this.audioContext) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Different frequencies for different severities
      const frequency = severity === 'critical' ? 1000 : 800;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Set volume (override system volume for emergency)
      gainNode.gain.setValueAtTime(0.8, this.audioContext.currentTime);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 2000); // 2 second alert
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  private showNotification(alert: Alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(
        alert.type === 'air_raid' ? '🚨 AIR RAID ALERT' : '✅ ALL CLEAR',
        {
          body: `${alert.region}: ${alert.message}`,
          icon: '/logo192.png',
          tag: alert.id,
          requireInteraction: alert.severity === 'critical',
          vibrate: alert.severity === 'critical' ? [200, 100, 200] : [200]
        }
      );
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // Auto close after 10 seconds unless critical
      if (alert.severity !== 'critical') {
        setTimeout(() => notification.close(), 10000);
      }
    }
  }

  private storeAlert(alert: Alert) {
    try {
      const stored = localStorage.getItem('alerts') || '[]';
      const alerts: Alert[] = JSON.parse(stored);
      
      // Keep only last 50 alerts
      alerts.unshift(alert);
      if (alerts.length > 50) alerts.splice(50);
      
      localStorage.setItem('alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to store alert:', error);
    }
  }

  public subscribe(callback: (alert: Alert) => void) {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) this.alertCallbacks.splice(index, 1);
    };
  }

  public getStoredAlerts(): Alert[] {
    try {
      const stored = localStorage.getItem('alerts') || '[]';
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public setAudioEnabled(enabled: boolean) {
    this.isAudioEnabled = enabled;
  }

  public testAlert() {
    // For testing purposes
    const testAlert: Alert = {
      id: `test_${Date.now()}`,
      type: 'air_raid',
      region: 'Kyiv Oblast',
      severity: 'high',
      timestamp: new Date(),
      message: 'This is a test alert. Seek shelter immediately.',
      active: true,
      officialSource: true
    };
    
    this.handleAlert(testAlert);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const alertSystem = new AlertSystem();