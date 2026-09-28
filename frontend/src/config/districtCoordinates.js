export const DISTRICT_COORDINATES = {
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Gandhinagar: { lat: 23.2156, lng: 72.6369 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
  Kutch: { lat: 23.7337, lng: 69.8597 },
  Bhavnagar: { lat: 21.7645, lng: 72.1519 },
  Mehsana: { lat: 23.5880, lng: 72.3693 },
};

export const DEFAULT_GUJARAT_CENTER = { lat: 22.2587, lng: 71.1924 }; // Center of Gujarat

// Haversine formula to calculate distance between two lat/lng coordinates in km
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};
