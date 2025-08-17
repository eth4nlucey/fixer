import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ReportsView() {
  const { t } = useTranslation();

  const reports = [
    {
      id: '1',
      type: 'danger',
      locationKey: 'reports.locations.shevchenkivskyi',
      descriptionKey: 'reports.messages.gunfire_maidan',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      distance: '0.8 km',
      verified: true,
      verifiedBy: 3,
    },
    {
      id: '2',
      type: 'safe',
      locationKey: 'reports.locations.podilskyi',
      descriptionKey: 'reports.messages.area_cleared',
      timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      distance: '1.2 km',
      verified: true,
      verifiedBy: 5,
    },
    {
      id: '3',
      type: 'checkpoint',
      locationKey: 'reports.locations.pechersk',
      descriptionKey: 'reports.messages.checkpoint_active',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      distance: '2.1 km',
      verified: false,
      verifiedBy: 1,
    },
    {
      id: '4',
      type: 'safe',
      locationKey: 'reports.locations.obolon',
      descriptionKey: 'reports.messages.shelter_safe',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      distance: '3.5 km',
      verified: true,
      verifiedBy: 7,
    },
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'danger': return '🚨';
      case 'safe': return '✅';
      case 'checkpoint': return '🛡️';
      default: return '📍';
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'danger': return 'border-red-500 bg-red-900/20';
      case 'safe': return 'border-green-500 bg-green-900/20';
      case 'checkpoint': return 'border-yellow-500 bg-yellow-900/20';
      default: return 'border-gray-500 bg-gray-800';
    }
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
          <h2 className="text-xl font-bold mb-2">{t('reports.title')}</h2>
          <p className="text-gray-400 text-sm">{t('reports.description')}</p>
        </div>

        {/* Report Type Filter */}
        <div className="flex space-x-2 mb-6">
          <button className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium transition-colors">
            🚨 {t('reports.danger')}
          </button>
          <button className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium transition-colors">
            ✅ {t('reports.safe')}
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-sm font-medium transition-colors">
            🛡️ {t('reports.checkpoint')}
          </button>
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className={`rounded-lg p-4 border ${getReportColor(report.type)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getReportIcon(report.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold capitalize">{t(`reports.${report.type}`)}</h3>
                      {report.verified && (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          ✓ {t('reports.verified')}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-300 text-sm mb-2">
                      {t(report.locationKey)} • {report.distance} • {getTimeAgo(report.timestamp)}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{t(report.descriptionKey)}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>👥 {report.verifiedBy} {t('reports.confirmations')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                  {t('reports.view_on_map')}
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                  {report.verified ? t('reports.report_issue') : t('reports.verify')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Report Button */}
        <div className="mt-8 bg-gray-800 rounded-lg p-4">
          <h3 className="font-bold mb-3">{t('reports.quick_report')}</h3>
          <p className="text-gray-400 text-sm mb-4">
            {t('reports.help_community')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-red-600 hover:bg-red-700 p-3 rounded text-sm font-medium transition-colors">
              🚨 {t('reports.danger')}
            </button>
            <button className="bg-green-600 hover:bg-green-700 p-3 rounded text-sm font-medium transition-colors">
              ✅ {t('reports.safe')}
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded text-xs font-medium transition-colors leading-none flex flex-col items-center justify-center">
              <span className="text-sm mb-0.5">🛡️</span>
              <span className="text-2xs leading-none text-center scale-90 px-1">{t('shelters.bomb_shelter')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}