import React from 'react';
import { useTranslation } from 'react-i18next';

interface Shelter {
  id: string;
  location: [number, number];
  name: {
    uk: string;
    en: string;
    ru: string;
  };
  type: 'bomb_shelter' | 'metro' | 'basement' | 'parking';
  capacity: number;
  amenities: string[];
  accessibility: boolean;
  status: 'open' | 'closed' | 'unknown';
  lastUpdated: Date;
  verifiedBy: string[];
  distance?: number;
}

interface ShelterCardProps {
  shelter: Shelter;
  onSelect: (shelter: Shelter) => void;
  onRoute: (shelter: Shelter) => void;
}

export default function ShelterCard({ shelter, onSelect, onRoute }: ShelterCardProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as 'uk' | 'en' | 'ru';

  const getShelterIcon = (type: string) => {
    switch (type) {
      case 'bomb_shelter': return '🏠';
      case 'metro': return '🚇';
      case 'basement': return '🏢';
      case 'parking': return '🅿️';
      default: return '🏠';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-success';
      case 'closed': return 'text-danger';
      default: return 'text-text-secondary';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}м`;
    }
    return `${(meters / 1000).toFixed(1)}км`;
  };

  return (
    <div className="bg-surface rounded-lg p-4 shadow-lg border border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getShelterIcon(shelter.type)}</span>
          <div>
            <h3 className="font-bold text-text-primary text-base">
              {shelter.name[currentLang] || shelter.name.uk}
            </h3>
            <p className="text-sm text-text-secondary">
              {t(`shelters.${shelter.type}`)}
            </p>
          </div>
        </div>
        
        {shelter.distance && (
          <span className="text-sm text-secondary font-medium">
            {formatDistance(shelter.distance)}
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t('shelters.capacity')}:</span>
          <span className="text-text-primary">{shelter.capacity}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{t('shelters.status.status')}:</span>
          <span className={`font-medium ${getStatusColor(shelter.status)}`}>
            {t(`shelters.status.${shelter.status}`)}
          </span>
        </div>

        {shelter.accessibility && (
          <div className="flex items-center space-x-1 text-sm">
            <span>♿</span>
            <span className="text-success">{t('shelters.accessibility')}</span>
          </div>
        )}

        {shelter.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {shelter.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-background text-xs rounded text-text-secondary"
              >
                {amenity}
              </span>
            ))}
            {shelter.amenities.length > 3 && (
              <span className="px-2 py-1 bg-background text-xs rounded text-text-secondary">
                +{shelter.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onSelect(shelter)}
          className="flex-1 touch-target bg-primary text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('common.details')}
        </button>
        
        <button
          onClick={() => onRoute(shelter)}
          className="flex-1 touch-target bg-secondary text-background py-2 px-4 rounded text-sm font-medium hover:bg-yellow-600 transition-colors"
        >
          {t('shelters.route_to')}
        </button>
      </div>

      {shelter.verifiedBy.length > 0 && (
        <div className="mt-2 text-xs text-success flex items-center space-x-1">
          <span>✓</span>
          <span>{t('reports.verified')} ({shelter.verifiedBy.length})</span>
        </div>
      )}
    </div>
  );
}