import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface EmergencyModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
}

export const EmergencyMode: React.FC<EmergencyModeProps> = ({ isActive, onToggle }) => {
  const { t } = useTranslation();
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sosCountdown && sosCountdown > 0) {
      interval = setInterval(() => {
        setSosCountdown(prev => prev ? prev - 1 : null);
      }, 1000);
    } else if (sosCountdown === 0) {
      triggerSOS();
      setSosCountdown(null);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sosCountdown]);

  const triggerSOS = () => {
    // Send SOS signal
    console.log('SOS TRIGGERED!');
    
    // Vibrate in SOS pattern
    if (navigator.vibrate) {
      // SOS in Morse code: short-short-short-long-long-long-short-short-short
      navigator.vibrate([100, 50, 100, 50, 100, 200, 300, 50, 300, 50, 300, 200, 100, 50, 100, 50, 100]);
    }
    
    // Flash screen
    document.body.style.backgroundColor = '#FF0000';
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, 500);
    
    // Send emergency location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const emergencyData = {
          type: 'SOS',
          location: [position.coords.longitude, position.coords.latitude],
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy
        };
        
        // Store emergency data
        localStorage.setItem('emergency_sos', JSON.stringify(emergencyData));
        
        // In production, this would send to emergency services
        console.log('Emergency location sent:', emergencyData);
      });
    }
  };

  const startSOSCountdown = () => {
    setSosCountdown(3); // 3 second countdown
  };

  const cancelSOS = () => {
    setSosCountdown(null);
  };

  if (!isActive) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        aria-label={t('emergency.activate_mode')}
      >
        🚨 {t('emergency.emergency_mode')}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
      {/* Emergency Header */}
      <div className="bg-red-600 p-4 text-center">
        <h1 className="text-2xl font-bold">{t('emergency.emergency_mode')}</h1>
        <p className="text-sm">{t('emergency.mode_description')}</p>
        <button
          onClick={() => onToggle(false)}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
          aria-label={t('emergency.exit_mode')}
        >
          ✕
        </button>
      </div>

      {/* SOS Countdown */}
      {sosCountdown && (
        <div className="fixed inset-0 bg-red-900 bg-opacity-95 flex items-center justify-center z-60">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">{sosCountdown}</div>
            <p className="text-xl text-white mb-6">{t('emergency.sos_countdown')}</p>
            <button
              onClick={cancelSOS}
              className="bg-white text-red-900 px-6 py-3 rounded-lg text-lg font-bold"
            >
              {t('emergency.cancel_sos')}
            </button>
          </div>
        </div>
      )}

      {/* Emergency Actions */}
      <div className="flex-1 p-6 space-y-4">
        {/* SOS Button */}
        <button
          onClick={startSOSCountdown}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-8 rounded-lg text-3xl font-bold shadow-lg transition-all active:scale-95"
          style={{ minHeight: '80px' }}
        >
          🆘 {t('emergency.sos_button')}
        </button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button className="bg-yellow-600 hover:bg-yellow-700 text-black py-6 rounded-lg text-lg font-bold transition-all active:scale-95">
            🏥 {t('emergency.nearest_hospital')}
          </button>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg text-lg font-bold transition-all active:scale-95">
            🛡️ {t('emergency.nearest_shelter')}
          </button>
          
          <button className="bg-green-600 hover:bg-green-700 text-white py-6 rounded-lg text-lg font-bold transition-all active:scale-95">
            📞 {t('emergency.emergency_contacts')}
          </button>
          
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-lg text-lg font-bold transition-all active:scale-95">
            📍 {t('emergency.share_location')}
          </button>
        </div>

        {/* Important Information */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold mb-2">{t('emergency.important_numbers')}</h3>
          <div className="space-y-2 text-sm">
            <div>🚨 {t('emergency.police')}: 102</div>
            <div>🚑 {t('emergency.medical')}: 103</div>
            <div>🚒 {t('emergency.fire')}: 101</div>
            <div>☎️ {t('emergency.general')}: 112</div>
          </div>
        </div>

        {/* Battery Saver Toggle */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <label className="flex items-center justify-between">
            <span>{t('emergency.battery_saver')}</span>
            <input
              type="checkbox"
              className="w-6 h-6"
              onChange={(e) => {
                if (e.target.checked) {
                  document.body.style.filter = 'brightness(0.5)';
                } else {
                  document.body.style.filter = '';
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;