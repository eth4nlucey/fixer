import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ResourcesView() {
  const { t } = useTranslation();

  const resources = [
    {
      id: '1',
      type: 'hospital',
      nameKey: 'resources.locations.kyiv_hospital_5',
      distance: '0.8 km',
      status: 'open',
      available: true,
      hours: '24/7',
      phone: '+380445551234',
      specialties: ['Emergency', 'Surgery', 'Trauma'],
    },
    {
      id: '2',
      type: 'pharmacy',
      nameKey: 'resources.locations.apteka_24',
      distance: '0.3 km',
      status: 'open',
      available: true,
      hours: '24/7',
      phone: '+380445551235',
      specialties: ['Prescription', 'First Aid', 'Medical Supplies'],
    },
    {
      id: '3',
      type: 'power',
      nameKey: 'resources.locations.metro_charging',
      distance: '0.5 km',
      status: 'open',
      available: true,
      hours: '06:00-24:00',
      phone: null,
      specialties: ['Phone Charging', 'Power Bank', 'USB Ports'],
    },
    {
      id: '4',
      type: 'water',
      nameKey: 'resources.locations.water_distribution',
      distance: '1.1 km',
      status: 'open',
      available: true,
      hours: '08:00-18:00',
      phone: '+380445551237',
      specialties: ['Drinking Water', 'Bottles', 'Containers'],
    },
    {
      id: '5',
      type: 'humanitarian_aid',
      nameKey: 'resources.locations.red_cross_center',
      distance: '2.3 km',
      status: 'open',
      available: true,
      hours: '09:00-17:00',
      phone: '+380445551238',
      specialties: ['Food', 'Clothing', 'Medicine', 'Supplies'],
    },
  ];

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'pharmacy': return '💊';
      case 'power': return '🔋';
      case 'water': return '💧';
      case 'humanitarian_aid': return '📦';
      default: return '🏢';
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'border-red-500';
      case 'pharmacy': return 'border-green-500';
      case 'power': return 'border-yellow-500';
      case 'water': return 'border-blue-500';
      case 'humanitarian_aid': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400';
      case 'closed': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('resources.title')}</h2>
          <p className="text-gray-400 text-sm">{t('resources.description')}</p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['hospital', 'pharmacy', 'power', 'water', 'humanitarian_aid'].map((type) => (
            <button
              key={type}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <span>{getResourceIcon(type)}</span>
              <span>{t(`resources.${type}`)}</span>
            </button>
          ))}
        </div>

        {/* Resources List */}
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className={`bg-gray-800 rounded-lg p-4 border ${getResourceColor(resource.type)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getResourceIcon(resource.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{t(resource.nameKey)}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{t(`resources.${resource.type}`)}</span>
                      <span>{resource.distance}</span>
                      <span className={getStatusColor(resource.status)}>
                        {t(`shelters.status.${resource.status}`)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-400">{t('resources.hours')}:</span>
                  <span className="text-white ml-2">{resource.hours}</span>
                </div>
                {resource.phone && (
                  <div>
                    <span className="text-gray-400">{t('resources.phone')}:</span>
                    <a href={`tel:${resource.phone}`} className="text-blue-400 ml-2 underline">
                      {resource.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <span className="text-gray-400 text-sm">{t('resources.services')}:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {resource.specialties.map((specialty) => (
                    <span key={specialty} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                  {t('resources.get_directions')}
                </button>
                {resource.phone && (
                  <button 
                    onClick={() => window.open(`tel:${resource.phone}`)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  >
                    {t('resources.call')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}