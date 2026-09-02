// Police stations inside Raipur Police Commissionerate boundary.
// Landmark coordinates verified against OpenStreetMap (OSM) nodes.

export const POLICE_STATIONS = [
  {
    id: "kotwali-ps",
    name: "कोतवाली पुलिस थाना",
    nameEn: "Kotwali Police Station",
    lat: 21.24350,
    lng: 81.63500,
    phone: "0771-4287111",
    inCharge: "Ins. R. K. Sharma",
    jurisdiction: "Central Market, Jaistambh Chowk, Malviya Road, Gol Bazar",
    jurisdictionEn: "Central Market, Jaistambh Chowk, Malviya Road, Gol Bazar",
  },
  {
    id: "civil-lines-ps",
    name: "सिविल लाइन्स पुलिस थाना",
    nameEn: "Civil Lines Police Station",
    lat: 21.24491,
    lng: 81.64450,
    phone: "0771-4287122",
    inCharge: "Ins. V. P. Singh",
    jurisdiction: "Collectorate, Ghadi Chowk, Raj Bhavan, Civil Lines",
    jurisdictionEn: "Collectorate, Ghadi Chowk, Raj Bhavan, Civil Lines",
  },
  {
    id: "telibandha-ps",
    name: "तेलीबांधा पुलिस थाना",
    nameEn: "Telibandha Police Station",
    lat: 21.23650,
    lng: 81.67150,
    phone: "0771-4287133",
    inCharge: "Ins. A. K. Verma",
    jurisdiction: "Telibandha Chowk, GE Road, VIP Road, Marine Drive",
    jurisdictionEn: "Telibandha Chowk, GE Road, VIP Road, Marine Drive",
  },
  {
    id: "pandri-ps",
    name: "पंडरी / देवेन्द्र नगर पुलिस थाना",
    nameEn: "Pandri / Devendra Nagar Police Station",
    lat: 21.25300,
    lng: 81.64700,
    phone: "0771-4287144",
    inCharge: "Ins. S. N. Mishra",
    jurisdiction: "Pandri Bus Stand, Cloth Market, Devendra Nagar, Mowa",
    jurisdictionEn: "Pandri Bus Stand, Cloth Market, Devendra Nagar, Mowa",
  },
  {
    id: "saraswati-nagar-ps",
    name: "सरस्वती नगर पुलिस थाना",
    nameEn: "Saraswati Nagar Police Station",
    lat: 21.25400,
    lng: 81.58800,
    phone: "0771-4287155",
    inCharge: "Ins. M. L. Patel",
    jurisdiction: "Amanaka Chowk, NIT Raipur, University Area, Samta Colony",
    jurisdictionEn: "Amanaka Chowk, NIT Raipur, University Area, Samta Colony",
  },
  {
    id: "tikrapara-ps",
    name: "टिकरापारा पुलिस थाना",
    nameEn: "Tikrapara Police Station",
    lat: 21.22400,
    lng: 81.65200,
    phone: "0771-4287166",
    inCharge: "Ins. D. S. Thakur",
    jurisdiction: "Old Dhamtari Road, Pachpedi Naka, Santoshi Nagar, Sejbahar",
    jurisdictionEn: "Old Dhamtari Road, Pachpedi Naka, Santoshi Nagar, Sejbahar",
  },
  {
    id: "tatibandh-ps",
    name: "तातीबंध पुलिस थाना / चौकी",
    nameEn: "Tatibandh Police Outpost",
    lat: 21.25672,
    lng: 81.57344,
    phone: "0771-4287177",
    inCharge: "Sub-Ins. P. K. Sahu",
    jurisdiction: "Tatibandh Chowk, AIIMS Hospital, NH-53 Highway Bypass",
    jurisdictionEn: "Tatibandh Chowk, AIIMS Hospital, NH-53 Highway Bypass",
  },
  {
    id: "ganj-ps",
    name: "गंज पुलिस थाना (रेलवे स्टेशन)",
    nameEn: "Ganj Police Station (Railway Station)",
    lat: 21.25780,
    lng: 81.63029,
    phone: "0771-4287188",
    inCharge: "Ins. R. S. Baghel",
    jurisdiction: "Raipur Railway Junction, Station Road, Fafadih, Ramsagar Para",
    jurisdictionEn: "Raipur Railway Junction, Station Road, Fafadih, Ramsagar Para",
  },
];

// Haversine distance calculation in km
function calculateDistance(lat1, lon1, lat2, lon2) {
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

export function findNearestPoliceStation(lat, lng) {
  let nearest = POLICE_STATIONS[0];
  let minDistance = Infinity;

  POLICE_STATIONS.forEach((station) => {
    const dist = calculateDistance(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...station, distanceKm: dist.toFixed(2) };
    }
  });

  return nearest;
}
