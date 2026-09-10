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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-MB-1245",
        model: "Maruti Swift Dzire",
        type: "4-Wheeler (Car)",
        slot: "Level 2 · Bay B-14",
        entryTime: "10:15 AM",
        ownerName: "Rajesh Sharma",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-KA-8910",
        model: "Mahindra Scorpio-N",
        type: "4-Wheeler (SUV)",
        slot: "Level 1 · Bay A-08",
        entryTime: "11:20 AM",
        ownerName: "Amit Verma",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-01-AB-4421",
        model: "Honda City",
        type: "4-Wheeler (Sedan)",
        slot: "Level 3 · Bay C-02",
        entryTime: "09:30 AM",
        ownerName: "Pooja Dewangan",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-NC-7720",
        model: "Honda Activa 6G",
        type: "2-Wheeler (Scooter)",
        slot: "Ground · 2W-Bay 15",
        entryTime: "12:05 PM",
        ownerName: "Kunal Sahu",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-HX-3399",
        model: "Hyundai Creta",
        type: "4-Wheeler (SUV)",
        slot: "Level 2 · Bay B-05",
        entryTime: "01:10 PM",
        ownerName: "Vikas Agrawal",
        status: "Parked",
      },
    ],
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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-PA-3319",
        model: "Maruti Ertiga",
        type: "4-Wheeler (MUV)",
        slot: "Platform 1 Side · Bay G-04",
        entryTime: "07:45 AM",
        ownerName: "Mahesh Baghel",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-ZZ-9090",
        model: "Hyundai Venue",
        type: "4-Wheeler (Compact SUV)",
        slot: "Main Gate · Bay G-12",
        entryTime: "08:30 AM",
        ownerName: "Sunil Tiwari",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-07-CZ-4567",
        model: "Bajaj Pulsar 150",
        type: "2-Wheeler (Motorcycle)",
        slot: "Two-Wheeler Zone · Bay 2W-09",
        entryTime: "09:10 AM",
        ownerName: "Deepak Patel",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-MK-6111",
        model: "Tata Nexon",
        type: "4-Wheeler (SUV)",
        slot: "VIP Lane · Bay G-01",
        entryTime: "10:00 AM",
        ownerName: "Rakesh Jain",
        status: "Parked",
      },
    ],
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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-TE-5500",
        model: "Mahindra Thar 4x4",
        type: "4-Wheeler (SUV)",
        slot: "Lake Promenade · Lot S-06",
        entryTime: "04:15 PM",
        ownerName: "Arjun Shukla",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-MH-5821",
        model: "Tata Nexon EV",
        type: "4-Wheeler (Electric SUV)",
        slot: "EV Charging Bay · Lot S-18",
        entryTime: "05:00 PM",
        ownerName: "Neha Chandrakar",
        status: "Parked",
      },
      {
        vehicleNumber: "MH-12-QX-3321",
        model: "Maruti Baleno",
        type: "4-Wheeler (Hatchback)",
        slot: "Food Court Side · Lot S-22",
        entryTime: "05:30 PM",
        ownerName: "Sanjay Deshmukh",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-BV-8800",
        model: "Royal Enfield Classic 350",
        type: "2-Wheeler (Motorcycle)",
        slot: "Boulevard · Bay 2W-03",
        entryTime: "06:10 PM",
        ownerName: "Rohan Dubey",
        status: "Parked",
      },
    ],
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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-JK-1100",
        model: "Hero Splendor Plus",
        type: "2-Wheeler (Motorcycle)",
        slot: "Basement 1 · Slot UG-14",
        entryTime: "11:00 AM",
        ownerName: "Pramod Soni",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-JB-6789",
        model: "Maruti WagonR",
        type: "4-Wheeler (Hatchback)",
        slot: "Basement 1 · Slot UG-03",
        entryTime: "10:45 AM",
        ownerName: "Nitin Agrawal",
        status: "Parked",
      },
      {
        vehicleNumber: "MP-09-TC-5678",
        model: "Hyundai i20",
        type: "4-Wheeler (Hatchback)",
        slot: "Basement 2 · Slot UG-08",
        entryTime: "11:30 AM",
        ownerName: "Dinesh Malviya",
        status: "Parked",
      },
    ],
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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-GC-2024",
        model: "Tata Safari Dark Edition",
        type: "4-Wheeler (SUV)",
        slot: "Floor 1 · Bay L1-05",
        entryTime: "09:15 AM",
        ownerName: "Vivek Mishra",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-GO-0001",
        model: "Toyota Innova Crysta",
        type: "4-Wheeler (VIP/Govt)",
        slot: "Ground · VIP Bay 01",
        entryTime: "10:00 AM",
        ownerName: "Administrative Vehicle",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-BB-3344",
        model: "TVS Jupiter 125",
        type: "2-Wheeler (Scooter)",
        slot: "Floor 1 · Bay 2W-22",
        entryTime: "10:30 AM",
        ownerName: "Anjali Gupta",
        status: "Parked",
      },
    ],
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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-SM-8811",
        model: "Maruti Eeco Cargo",
        type: "Commercial (Van)",
        slot: "Loading Bay · Lot B-02",
        entryTime: "08:15 AM",
        ownerName: "Ramesh Traders",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-SK-4499",
        model: "Honda CB Shine",
        type: "2-Wheeler (Motorcycle)",
        slot: "Market Gate · Lot 2W-05",
        entryTime: "09:40 AM",
        ownerName: "Gopal Yadav",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-MM-9922",
        model: "Kia Seltos",
        type: "4-Wheeler (SUV)",
        slot: "Shoppers Bay · Lot A-11",
        entryTime: "11:15 AM",
        ownerName: "Manish Sinha",
        status: "Parked",
      },
    ],
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
    parkedVehicles: [
      {
        vehicleNumber: "CG-04-SJ-9900",
        model: "Maruti Brezza",
        type: "4-Wheeler (Compact SUV)",
        slot: "Open Surface · Spot 04",
        entryTime: "08:00 AM",
        ownerName: "Harish Kurre",
        status: "Parked",
      },
      {
        vehicleNumber: "CG-04-SA-2211",
        model: "Hero Glamour",
        type: "2-Wheeler (Motorcycle)",
        slot: "Bus Stand Bay · Spot 2W-01",
        entryTime: "09:00 AM",
        ownerName: "Saurabh Tandon",
        status: "Parked",
      },
    ],
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

// Clean vehicle plate string for flexible matching (removes spaces, hyphens, lowercase)
export function normalizePlate(str = "") {
  return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

/**
 * Universal Parking Search helper
 * Matches:
 * 1. Vehicle Registration Numbers (exact or partial, e.g., "CG04MB1245", "1245", "MB 1245")
 * 2. Area / Address / Location (e.g., "Pandri", "Station", "Marine Drive", "Gol Bazar")
 * 3. Parking Zone Name (Hindi & English)
 * 4. Zone Type (Multi-Level, Surface, Off-Street)
 * 5. Occupancy Status (Available, Filling, Full)
 */
export function searchParking(query = "", zones = PARKING_ZONES) {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
      matchedVehicles: [],
      matchedZones: zones,
      isVehicleSearch: false,
    };
  }

  const qLower = trimmed.toLowerCase();
  const qNorm = normalizePlate(trimmed);

  // 1. Check for vehicle matches across all zones
  const matchedVehicles = [];
  zones.forEach((zone) => {
    if (Array.isArray(zone.parkedVehicles)) {
      zone.parkedVehicles.forEach((vehicle) => {
        const vPlateNorm = normalizePlate(vehicle.vehicleNumber);
        const vModel = (vehicle.model || "").toLowerCase();
        const vOwner = (vehicle.ownerName || "").toLowerCase();
        const vSlot = (vehicle.slot || "").toLowerCase();

        const plateMatches =
          (qNorm.length >= 2 && vPlateNorm.includes(qNorm)) ||
          vehicle.vehicleNumber.toLowerCase().includes(qLower);

        const otherMatches =
          vModel.includes(qLower) ||
          vOwner.includes(qLower) ||
          vSlot.includes(qLower);

        if (plateMatches || otherMatches) {
          matchedVehicles.push({
            ...vehicle,
            zoneId: zone.id,
            zoneName: zone.name,
            zoneNameEn: zone.nameEn,
            zoneAddress: zone.address,
            zoneAddressEn: zone.addressEn,
            zoneType: zone.type,
            lat: zone.lat,
            lng: zone.lng,
            totalSpots: zone.totalSpots,
            occupiedSpots: zone.occupiedSpots,
          });
        }
      });
    }
  });

  // 2. Check for Area / Hub Name / Address / Type matches
  const matchedZones = zones.filter((zone) => {
    // If vehicle is standing in this zone, keep the zone in view
    const hasMatchedVehicle = matchedVehicles.some((v) => v.zoneId === zone.id);
    if (hasMatchedVehicle) return true;

    const nameMatch =
      zone.name.toLowerCase().includes(qLower) ||
      zone.nameEn.toLowerCase().includes(qLower);
    const addrMatch =
      (zone.address && zone.address.toLowerCase().includes(qLower)) ||
      (zone.addressEn && zone.addressEn.toLowerCase().includes(qLower));
    const typeMatch = zone.type && zone.type.toLowerCase().includes(qLower);
    const status = getOccupancyStatus(zone.occupiedSpots, zone.totalSpots);
    const statusMatch = status.toLowerCase().includes(qLower);

    return nameMatch || addrMatch || typeMatch || statusMatch;
  });

  const isVehicleSearch = matchedVehicles.length > 0;

  return {
    query: trimmed,
    matchedVehicles,
    matchedZones,
    isVehicleSearch,
  };
}
