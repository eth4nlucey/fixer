export const getMarkerColor = (type: string) => {
  switch (type) {
    case 'danger':
      return '#EF4444'; // red-500
    case 'safe':
      return '#10B981'; // green-500
    case 'checkpoint':
      return '#F59E0B'; // yellow-500
    case 'incident':
      return '#F97316'; // orange-500
    case 'resource':
      return '#3B82F6'; // blue-500
    default:
      return '#6B7280'; // gray-500
  }
};

export const getMarkerIcon = (type: string) => {
  switch (type) {
    case 'danger':
      return '⚠️';
    case 'safe':
      return '✅';
    case 'checkpoint':
      return '🛃';
    case 'incident':
      return '🚨';
    case 'resource':
      return '🏥';
    default:
      return '📍';
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};