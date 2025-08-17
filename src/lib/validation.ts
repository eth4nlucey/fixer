// Comprehensive validation layer for FIXER MVP
export interface ReportValidation {
  location: ValidateGeoBounds;
  type: ValidateReportType;
  deviceId: ValidateDeviceFingerprint;
  rateLimit: CheckRateLimits;
}

// Ukraine geographic bounds for validation
const UKRAINE_BOUNDS = {
  north: 52.4,
  south: 44.2,
  east: 40.2,
  west: 22.1
};

export const validateGeoBounds = (lat: number, lng: number): boolean => {
  return (
    lat >= UKRAINE_BOUNDS.south &&
    lat <= UKRAINE_BOUNDS.north &&
    lng >= UKRAINE_BOUNDS.west &&
    lng <= UKRAINE_BOUNDS.east
  );
};

export const validateReportType = (type: string): boolean => {
  const validTypes = ['danger', 'safe', 'checkpoint', 'incident', 'resource'];
  return validTypes.includes(type);
};

export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = canvas.toDataURL();
  const deviceData = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: fingerprint.slice(-50)
  };
  
  return btoa(JSON.stringify(deviceData)).slice(0, 32);
};

// Rate limiting storage
const RATE_LIMITS = {
  reports: { max: 10, window: 3600000 }, // 10 per hour
  verifications: { max: 20, window: 3600000 } // 20 per hour
};

export const checkRateLimit = (deviceId: string, action: 'reports' | 'verifications'): boolean => {
  const now = Date.now();
  const key = `${action}_${deviceId}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    localStorage.setItem(key, JSON.stringify([now]));
    return true;
  }
  
  const timestamps: number[] = JSON.parse(stored);
  const limit = RATE_LIMITS[action];
  
  // Remove old timestamps outside the window
  const recent = timestamps.filter(ts => now - ts < limit.window);
  
  if (recent.length >= limit.max) {
    return false; // Rate limit exceeded
  }
  
  recent.push(now);
  localStorage.setItem(key, JSON.stringify(recent));
  return true;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500); // Max length
};

export const validateReportSubmission = (
  location: [number, number],
  type: string,
  deviceId: string
): { valid: boolean; error?: string } => {
  // Validate location bounds
  if (!validateGeoBounds(location[1], location[0])) {
    return { valid: false, error: 'Location must be within Ukraine' };
  }
  
  // Validate report type
  if (!validateReportType(type)) {
    return { valid: false, error: 'Invalid report type' };
  }
  
  // Check rate limits
  if (!checkRateLimit(deviceId, 'reports')) {
    return { valid: false, error: 'Rate limit exceeded. Please wait before submitting another report.' };
  }
  
  return { valid: true };
};