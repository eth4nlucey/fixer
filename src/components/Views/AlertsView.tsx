import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AlertsView() {
  const { t } = useTranslation();

  const alerts = [
    {
      id: '1',
      type: 'air_raid',
      regionKey: 'alerts.regions.kyiv',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      active: true,
      descriptionKey: 'alerts.messages.air_raid_kyiv',
    },
    {
      id: '2',
      type: 'all_clear',
      regionKey: 'alerts.regions.lviv',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      active: false,
      descriptionKey: 'alerts.messages.all_clear_lviv',
    },
    {
      id: '3',
      type: 'air_raid',
      regionKey: 'alerts.regions.kharkiv',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      active: false,
      descriptionKey: 'alerts.messages.air_raid_kharkiv_ended',
    },
  ];

  const getAlertIcon = (type: string, active: boolean) => {
    if (type === 'air_raid') {
      return active ? '🚨' : '⚠️';
    }
    return '✅';
  };

  const getAlertColor = (type: string, active: boolean) => {
    if (type === 'air_raid') {
      return active ? 'border-red-500 bg-red-900/20' : 'border-gray-600 bg-gray-800';
    }
    return 'border-green-500 bg-green-900/20';
  };

  const getTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60));
    if (minutes < 1) return t('alerts.just_now');
    if (minutes < 60) return `${minutes} ${t('alerts.minutes_ago')}`;
    const hours = Math.floor(minutes / 60);
    return `${hours} ${t('alerts.hours_ago')}`;
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('alerts.title')}</h2>
          <p className="text-gray-400 text-sm">{t('alerts.description')}</p>
        </div>

        {/* Active Alert Banner */}
        {alerts.some(alert => alert.active) && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl animate-pulse">🚨</div>
              <div>
                <div className="font-bold text-red-300">{t('alerts.active_alert')}</div>
                <div className="text-red-200 text-sm">
                  {t(alerts.find(alert => alert.active)?.descriptionKey || '')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`rounded-lg p-4 border ${getAlertColor(alert.type, alert.active)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getAlertIcon(alert.type, alert.active)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">
                        {alert.type === 'air_raid' ? t('alerts.air_raid') : t('alerts.all_clear')}
                      </h3>
                      {alert.active && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                          {t('common.active')}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm mb-2">
                      {t(alert.regionKey)} • {getTimeAgo(alert.timestamp)}
                    </div>
                    <p className="text-gray-400 text-sm">{t(alert.descriptionKey)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-3">{t('emergency.emergency_contacts')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{t('emergency.emergency_services')}</span>
              <a href="tel:112" className="text-blue-400 font-mono">112</a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('emergency.police')}</span>
              <a href="tel:102" className="text-blue-400 font-mono">102</a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('emergency.fire_department')}</span>
              <a href="tel:101" className="text-blue-400 font-mono">101</a>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t('emergency.medical_emergency')}</span>
              <a href="tel:103" className="text-blue-400 font-mono">103</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}