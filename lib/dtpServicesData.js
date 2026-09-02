// DTP (Delhi Traffic Police) inspired service data for Speed Limits, Traffic NOC, and Taxi/Auto Complaints

export const SPEED_LIMIT_MATRIX = [
  {
    roadTypeHi: "ग्रेट ईस्टर्न (GE) रोड",
    roadTypeEn: "Great Eastern (GE) Road (NH-53)",
    carLimit: "60 km/h",
    bikeLimit: "50 km/h",
    truckLimit: "40 km/h",
    notes: "Strict camera monitoring near Telibandha & Jaistambh Chowk",
  },
  {
    roadTypeHi: "वी.आई.पी. एयरपोर्ट रोड",
    roadTypeEn: "VIP Airport Expressway",
    carLimit: "70 km/h",
    bikeLimit: "50 km/h",
    truckLimit: "40 km/h",
    notes: "Automated speed radar enforcement active",
  },
  {
    roadTypeHi: "रिंग रोड 1 & बाहरी बाईपास",
    roadTypeEn: "Ring Road 1 & Outer Bypass",
    carLimit: "65 km/h",
    bikeLimit: "50 km/h",
    truckLimit: "50 km/h",
    notes: "Heavy commercial lane discipline mandatory",
  },
  {
    roadTypeHi: "स्कूल & अस्पताल क्षेत्र",
    roadTypeEn: "School & Hospital Zones",
    carLimit: "25 km/h",
    bikeLimit: "25 km/h",
    truckLimit: "20 km/h",
    notes: "Zero tolerance silent zone & pedestrian crossing priority",
  },
  {
    roadTypeHi: "शहर के भीतरी बाज़ार (गोल बाज़ार, पंडरी)",
    roadTypeEn: "City Inner Market Streets (Gol Bazar, Pandri)",
    carLimit: "30 km/h",
    bikeLimit: "30 km/h",
    truckLimit: "No Entry",
    notes: "Pedestrian priority zone",
  },
];

export const MOCK_TRAFFIC_NOCS = [
  {
    vehicleNo: "CG 04 AB 1234",
    ownerName: "Rahul Sharma",
    chassisNo: "MBH1234567890",
    engineNo: "ENG987654",
    status: "CLEARED",
    issuedOn: "2026-08-22",
    validTill: "2026-09-22",
    pendingDues: 0,
    remarks: "No pending traffic violations or court notices registered against this vehicle.",
  },
  {
    vehicleNo: "CG 04 XY 9876",
    ownerName: "Priya Verma",
    chassisNo: "MBH9876543210",
    engineNo: "ENG123456",
    status: "CLEARED",
    issuedOn: "2026-08-18",
    validTill: "2026-09-18",
    pendingDues: 0,
    remarks: "Cleared for ownership transfer within Chhattisgarh.",
  },
];
