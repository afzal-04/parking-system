// Designated parking zones in Raipur Police Commissionerate area.
// Exact coordinates verified against OpenStreetMap (OSM) nodes.

export const PARKING_ZONES = [
  {
    id: "pandri-multilevel",
    name: "पंडरी मल्टीलेवल पार्किंग",
    nameEn: "Pandri Multi-Level Parking",
    lat: 21.25236,
    lng: 81.64628,
    totalSpots: 250,
    occupiedSpots: 165,
    type: "Multi-Level",
    address: "Pandri Bus Stand & Market, Raipur",
    addressEn: "Pandri Bus Stand & Market, Raipur",
  },
  {
    id: "railway-station-pkg",
    name: "रेलवे स्टेशन परिसर पार्किंग",
    nameEn: "Railway Station Complex Parking",
    lat: 21.25780,
    lng: 81.63029,
    totalSpots: 180,
    occupiedSpots: 152,
    type: "Off-Street",
    address: "Station Road, Raipur Junction",
    addressEn: "Station Road, Raipur Junction",
  },
  {
    id: "telibandha-chaupati",
    name: "तेलीबांधा मरीन ड्राइव पार्किंग बे",
    nameEn: "Telibandha Marine Drive Parking Bay",
    lat: 21.23650,
    lng: 81.67106,
    totalSpots: 120,
    occupiedSpots: 48,
    type: "Surface",
    address: "Telibandha Chowk & Marine Drive",
    addressEn: "Telibandha Chowk & Marine Drive",
  },
  {
    id: "jaystambh-underground",
    name: "जयस्तंभ चौक मार्केट पार्किंग",
    nameEn: "Jaistambh Chowk Market Parking",
    lat: 21.24368,
    lng: 81.63559,
    totalSpots: 90,
    occupiedSpots: 84,
    type: "Off-Street",
    address: "Malviya Road Junction, Jaistambh Chowk",
    addressEn: "Malviya Road Junction, Jaistambh Chowk",
  },
  {
    id: "ghadi-chowk-pkg",
    name: "घड़ी चौक मल्टीलेवल पार्किंग",
    nameEn: "Ghadi Chowk Multi-Level Parking",
    lat: 21.24491,
    lng: 81.64313,
    totalSpots: 150,
    occupiedSpots: 95,
    type: "Multi-Level",
    address: "Near Collectorate & Raj Bhavan, Ghadi Chowk",
    addressEn: "Near Collectorate & Raj Bhavan, Ghadi Chowk",
  },
  {
    id: "shastri-market-pkg",
    name: "शास्त्री मार्केट ऑफ-स्ट्रीट पार्किंग",
    nameEn: "Shastri Market Off-Street Parking",
    lat: 21.24250,
    lng: 81.63450,
    totalSpots: 100,
    occupiedSpots: 32,
    type: "Off-Street",
    address: "Shastri Market, Gol Bazar Area",
    addressEn: "Shastri Market, Gol Bazar Area",
  },
  {
    id: "sejbahar-hub",
    name: "सेजबहार बस स्टैंड पार्किंग",
    nameEn: "Sejbahar Bus Stand Parking",
    lat: 21.16650,
    lng: 81.67850,
    totalSpots: 80,
    occupiedSpots: 20,
    type: "Surface",
    address: "Old Dhamtari Road, Sejbahar",
    addressEn: "Old Dhamtari Road, Sejbahar",
  },
];

export function getOccupancyStatus(occupied, total) {
  const pct = (occupied / total) * 100;
  if (pct >= 90) return "full";
  if (pct >= 65) return "filling";
  return "available";
}

// Calculate distance between two coordinates in kilometers using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestParking(lat, lng, zones = PARKING_ZONES) {
  if (!zones || zones.length === 0) return null;
  let nearest = null;
  let minDistance = Infinity;

  zones.forEach((zone) => {
    const dist = calculateDistance(lat, lng, zone.lat, zone.lng);
    const status = getOccupancyStatus(zone.occupiedSpots, zone.totalSpots);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...zone, distanceKm: dist.toFixed(2), status };
    }
  });

  return nearest;
}
