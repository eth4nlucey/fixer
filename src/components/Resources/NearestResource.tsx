import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface NearestResourceProps {
  userLocation: [number, number] | null;
  resourceType?: 'hospital' | 'shelter' | 'water' | 'food' | 'internet' | 'fuel';
}

export default function NearestResource({ userLocation, resourceType }: NearestResourceProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearestResources = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('find_nearest_resources', {
        user_lat: userLocation[0],
        user_lng: userLocation[1],
        resource_type_filter: resourceType || null,
        max_distance_meters: 50000,
        limit_count: 5,
      });

      if (data) {
        setResources(data);
      }
      
      setLoading(false);
    };

    fetchNearestResources();
  }, [userLocation, resourceType]);

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'shelter': return '🏠';
      case 'water': return '💧';
      case 'food': return '🍞';
      case 'internet': return '📶';
      case 'fuel': return '⛽';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!userLocation) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500">Location not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">
        Nearest {resourceType ? resourceType.charAt(0).toUpperCase() + resourceType.slice(1) + 's' : 'Resources'}
      </h3>
      
      {resources.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-500">No resources found nearby</p>
        </div>
      ) : (
        resources.map((resource) => (
          <div key={resource.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xl">{getResourceIcon(resource.type)}</span>
                  <span className="font-medium text-gray-800">{resource.name}</span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {formatDistance(resource.distance_meters)} away
                </div>
                
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  resource.status === 'operational' ? 'bg-green-100 text-green-800' :
                  resource.status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {resource.status}
                </div>
              </div>
              
              <button className="text-blue-500 text-sm font-medium">
                Directions
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}