// Monitoring & Analytics for FIXER MVP
interface EventData {
  [key: string]: any;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class MonitoringSystem {
  private events: EventData[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private errorCount = 0;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorTracking();
    this.initializePerformanceTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('unhandled_rejection', {
        reason: event.reason,
        promise: event.promise.toString()
      });
    });
  }

  private initializePerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.trackPerformance('first_contentful_paint', this.getFirstContentfulPaint());
        }
      }, 0);
    });
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  public trackEvent(eventName: string, data: EventData = {}) {
    const event = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...data
    };

    this.events.push(event);
    console.log('Event tracked:', eventName, data);

    // Send to analytics service (placeholder)
    this.sendToAnalytics(event);

    // Limit stored events
    if (this.events.length > 100) {
      this.events.splice(0, 50);
    }
  }

  public trackError(errorType: string, errorData: EventData) {
    this.errorCount++;
    
    const errorEvent = {
      type: 'error',
      errorType,
      errorCount: this.errorCount,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      ...errorData
    };

    console.error('Error tracked:', errorType, errorData);
    
    // Store error locally
    const storedErrors = JSON.parse(localStorage.getItem('fixer_errors') || '[]');
    storedErrors.push(errorEvent);
    if (storedErrors.length > 50) storedErrors.splice(0, 25);
    localStorage.setItem('fixer_errors', JSON.stringify(storedErrors));

    // Send to error tracking service
    this.sendToErrorTracking(errorEvent);
  }

  public trackPerformance(metricName: string, value: number) {
    const metric: PerformanceMetric = {
      name: metricName,
      value,
      timestamp: Date.now()
    };

    this.performanceMetrics.push(metric);
    console.log('Performance metric:', metricName, value + 'ms');

    // Send performance data
    this.sendPerformanceMetric(metric);

    // Limit stored metrics
    if (this.performanceMetrics.length > 50) {
      this.performanceMetrics.splice(0, 25);
    }
  }

  public measurePerformance(operationName: string) {
    const startTime = performance.now();
    
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.trackPerformance(operationName, duration);
        return duration;
      }
    };
  }

  private async sendToAnalytics(event: EventData) {
    try {
      // In production, this would send to analytics service
      // For now, we'll simulate with local storage
      const analyticsQueue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
      analyticsQueue.push(event);
      
      // Keep only last 100 events
      if (analyticsQueue.length > 100) {
        analyticsQueue.splice(0, 50);
      }
      
      localStorage.setItem('analytics_queue', JSON.stringify(analyticsQueue));
    } catch (error) {
      console.error('Failed to queue analytics event:', error);
    }
  }

  private async sendToErrorTracking(errorEvent: EventData) {
    try {
      // In production, this would send to Sentry or similar service
      console.error('Error event:', errorEvent);
      
      // For critical errors, immediately attempt to send
      if (this.errorCount > 10) {
        console.warn('High error count detected:', this.errorCount);
      }
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  private async sendPerformanceMetric(metric: PerformanceMetric) {
    try {
      // Store performance metrics locally
      const perfQueue = JSON.parse(localStorage.getItem('performance_queue') || '[]');
      perfQueue.push(metric);
      
      if (perfQueue.length > 50) {
        perfQueue.splice(0, 25);
      }
      
      localStorage.setItem('performance_queue', JSON.stringify(perfQueue));
    } catch (error) {
      console.error('Failed to queue performance metric:', error);
    }
  }

  public getAnalytics() {
    return {
      events: this.events,
      performanceMetrics: this.performanceMetrics,
      errorCount: this.errorCount,
      sessionId: this.sessionId
    };
  }

  public clearData() {
    this.events = [];
    this.performanceMetrics = [];
    this.errorCount = 0;
    localStorage.removeItem('fixer_errors');
    localStorage.removeItem('analytics_queue');
    localStorage.removeItem('performance_queue');
  }
}

// Pre-defined event tracking functions
export const analytics = new MonitoringSystem();

export const trackReportSubmitted = (type: string, location: [number, number]) => {
  analytics.trackEvent('report_submitted', { type, location });
};

export const trackShelterFound = (shelterId: string, distance: number) => {
  analytics.trackEvent('shelter_located', { shelterId, distance });
};

export const trackAlertReceived = (alertType: string, region: string) => {
  analytics.trackEvent('alert_received', { alertType, region });
};

export const trackMapLoadTime = (loadTime: number) => {
  analytics.trackPerformance('map_load_time', loadTime);
};

export const trackApiResponseTime = (endpoint: string, responseTime: number) => {
  analytics.trackPerformance(`api_response_${endpoint}`, responseTime);
};

// Performance measurement utilities
export const measureMapLoad = () => analytics.measurePerformance('map_load');
export const measureApiCall = (endpoint: string) => analytics.measurePerformance(`api_${endpoint}`);