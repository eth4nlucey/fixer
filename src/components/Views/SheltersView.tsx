import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SheltersView() {
  const { t } = useTranslation();

  const shelters = [
    {
      id: '1',
      nameKey: 'shelters.locations.maidan_metro',
      type: 'metro',
      capacity: 500,
      status: 'open',
      distance: '0.5 km',
      amenities: ['WiFi', 'First Aid', 'Power'],
      accessibility: true,
    },
    {
      id: '2', 
      nameKey: 'shelters.locations.school_7_basement',
      type: 'basement',
      capacity: 150,
      status: 'open',
      distance: '1.2 km',
      amenities: ['First Aid', 'Water'],
      accessibility: false,
    },
    {
      id: '3',
      nameKey: 'shelters.locations.globus_parking',
      type: 'parking',
      capacity: 300,
      status: 'unknown',
      distance: '2.1 km',
      amenities: ['Power', 'Space'],
      accessibility: true,
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400';
      case 'closed': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'metro': return '🚇';
      case 'basement': return '🏫';
      case 'parking': return '🅿️';
      default: return '🏠';
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">{t('shelters.title')}</h2>
          <p className="text-gray-400 text-sm">{t('shelters.description')}</p>
        </div>

        {shelters.map((shelter) => (
          <div key={shelter.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getTypeEmoji(shelter.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {t(shelter.nameKey)}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{t(`shelters.${shelter.type}`)}</span>
                    <span>{shelter.distance}</span>
                    <span className={getStatusColor(shelter.status)}>
                      {t(`shelters.status.${shelter.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <span className="text-gray-400">{t('shelters.capacity')}:</span>
                <span className="text-white ml-2">{shelter.capacity}</span>
              </div>
              <div>
                <span className="text-gray-400">{t('shelters.accessibility')}:</span>
                <span className="ml-2">{shelter.accessibility ? '♿' : '❌'}</span>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-gray-400 text-sm">{t('shelters.amenities')}:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {shelter.amenities.map((amenity) => (
                  <span key={amenity} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                {t('shelters.route_to')}
              </button>
              <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
                {t('common.details')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}