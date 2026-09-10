"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./admin.module.css";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import AddPoliceStationModal from "@/components/AddPoliceStationModal";
import AddPatrolUnitModal from "@/components/AddPatrolUnitModal";
import ParkedVehiclesModal from "@/components/ParkedVehiclesModal";
import { TRAFFIC_POINTS } from "@/lib/trafficData";
import { PARKING_ZONES, getOccupancyStatus, searchParking } from "@/lib/parkingData";
import {
  PATROL_AREAS,
  POLICE_STATIONS,
  PATROL_UNITS,
  findNearestPoliceStation,
  findNearestPatrolUnit,
} from "@/lib/policeStations";
import { t } from "@/lib/i18n";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const RECOMMENDATIONS = [
  {
    icon: "🚧",
    title: { hi: "गोल बाज़ार — सर्विस लेन मार्किंग", en: "Gol Bazar — Service Lane Marking" },
    detail: {
      hi: "सर्विस लेन पर पीली पट्टी व साइनेज लगाना, सुबह/शाम पीक ऑवर में एक कांस्टेबल तैनात करना।",
      en: "Paint yellow lane markings and add signage on the service lane; station one constable during morning/evening peak hours.",
    },
    cost: { hi: "≈ ₹8,000 · कम लागत", en: "≈ ₹8,000 · Low cost" },
  },
  {
    icon: "🅿️",
    title: { hi: "पंडरी बस स्टैंड — निर्धारित पार्किंग बे", en: "Pandri Bus Stand — Designated Parking Bay" },
    detail: {
      hi: "मौजूदा खाली जगह को ऑफ-स्ट्रीट पार्किंग बे के रूप में चिन्हित कर बोर्ड लगाना।",
      en: "Mark the existing open space as an off-street parking bay with clear signboards.",
    },
    cost: { hi: "≈ ₹15,000 · कम लागत", en: "≈ ₹15,000 · Low cost" },
  },
  {
    icon: "🏫",
    title: { hi: "सेजबहार स्कूल ज़ोन — समय-आधारित नियम", en: "Sejbahar School Zone — Time-based Rule" },
    detail: {
      hi: "छुट्टी के 30 मिनट के लिए 'No Parking - School Hours' बोर्ड व अस्थायी बैरिकेड।",
      en: "Put up a 'No Parking - School Hours' board and temporary barricade for the 30-minute dismissal window.",
    },
    cost: { hi: "≈ ₹5,000 · कम लागत", en: "≈ ₹5,000 · Low cost" },
  },
];

const LEVEL_LABEL = {
  free: { hi: "सामान्य", en: "Free flow" },
  moderate: { hi: "मध्यम", en: "Moderate" },
  heavy: { hi: "भारी जाम", en: "Heavy jam" },
};

function nextLevel(current) {
  const r = Math.random();
  if (current === "heavy") return r < 0.5 ? "moderate" : "heavy";
  if (current === "moderate") {
    if (r < 0.15) return "heavy";
    if (r < 0.55) return "free";
    return "moderate";
  }
  return r < 0.12 ? "moderate" : "free";
}

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "overview";

  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState(initialTab); // "overview", "complaints", "traffic", "parking", "stations", "patrol"
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dispatchedStationIds, setDispatchedStationIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals state
  const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false);
  const [isAddPatrolModalOpen, setIsAddPatrolModalOpen] = useState(false);
  const [parkingSearchQuery, setParkingSearchQuery] = useState("");
  const [selectedParkingZoneForModal, setSelectedParkingZoneForModal] = useState(null);

  // Registered Police Stations and Patrol Units
  const [stations, setStations] = useState(POLICE_STATIONS);
  const [patrolUnits, setPatrolUnits] = useState(PATROL_UNITS);

  // Area-wise & Patrol Fleet States
  const [selectedAreaId, setSelectedAreaId] = useState("all");
  const [selectedVehicleType, setSelectedVehicleType] = useState("all"); // "all", "pcr_van", "bike_squad", "interceptor", "erv"
  const [selectedPatrolId, setSelectedPatrolId] = useState(null);
  const [mapCenter, setMapCenter] = useState([21.2460, 81.6360]);
  const [mapZoom, setMapZoom] = useState(12);

  const [traffic, setTraffic] = useState(() =>
    Object.fromEntries(TRAFFIC_POINTS.map((p) => [p.id, { level: "free", updatedAt: Date.now() }]))
  );
  const [alerts, setAlerts] = useState([]);

  // Sync tab from URL if query param changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  function handleTabChange(newTab) {
    setActiveTab(newTab);
    router.push(`/admin?tab=${newTab}`, { scroll: false });
  }

  // Fetch initial data from APIs
  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints || []))
      .finally(() => setLoading(false));

    fetch("/api/police-stations")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.stations?.length > 0) setStations(d.stations);
      })
      .catch(() => {});

    fetch("/api/patrol-units")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.patrolUnits?.length > 0) setPatrolUnits(d.patrolUnits);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Voice alert synthesizer helper
  function speakVoiceAlert(text) {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis error:", e);
    }
  }

  // Parking zones state with simulated live feed
  const [parkingZones, setParkingZones] = useState(PARKING_ZONES);

  // Simulated live patrol unit movement across sector waypoints
  useEffect(() => {
    const interval = setInterval(() => {
      setPatrolUnits((prevUnits) =>
        prevUnits.map((unit) => {
          if (!unit.waypoints || unit.waypoints.length === 0) return unit;
          const wp = unit.waypoints[Math.floor(Math.random() * unit.waypoints.length)];
          const latJitter = (Math.random() - 0.5) * 0.0015;
          const lngJitter = (Math.random() - 0.5) * 0.0015;
          const currentSpeedNum = parseInt(unit.speed) || 20;
          const speedDelta = Math.floor(Math.random() * 7) - 3;
          const newSpeed = unit.status === "standby" ? "0 km/h" : `${Math.max(12, Math.min(45, currentSpeedNum + speedDelta))} km/h`;

          return {
            ...unit,
            lat: Number((wp[0] + latJitter).toFixed(5)),
            lng: Number((wp[1] + lngJitter).toFixed(5)),
            speed: newSpeed,
            lastPing: Date.now(),
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulated traffic feed (Module 2)
  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic((prev) => {
        const junction = TRAFFIC_POINTS[Math.floor(Math.random() * TRAFFIC_POINTS.length)];
        const current = prev[junction.id]?.level || "free";
        const level = nextLevel(current);

        if (level === "heavy" && current !== "heavy") {
          setAlerts((a) => [
            {
              id: `${junction.id}-${Date.now()}`,
              junctionId: junction.id,
              name: junction.name,
              nameEn: junction.nameEn,
              time: Date.now(),
              dispatched: false,
            },
            ...a,
          ].slice(0, 5));
        }

        return { ...prev, [junction.id]: { level, updatedAt: Date.now() } };
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Simulated live parking occupancy feed (Module 4)
  useEffect(() => {
    const interval = setInterval(() => {
      setParkingZones((prev) =>
        prev.map((zone) => {
          if (Math.random() < 0.3) {
            const delta = Math.floor(Math.random() * 8) - 3;
            const newOccupied = Math.max(0, Math.min(zone.totalSpots, zone.occupiedSpots + delta));
            return { ...zone, occupiedSpots: newOccupied };
          }
          return zone;
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Toast message auto dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  function handleManualOccupancyChange(zoneId, newOccupied) {
    setParkingZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, occupiedSpots: Math.max(0, Math.min(z.totalSpots, newOccupied)) } : z))
    );
  }

  function handleDeploy(alertId, junctionId) {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dispatched: true } : a)));
    setTraffic((prev) => ({ ...prev, [junctionId]: { level: "moderate", updatedAt: Date.now() } }));
  }

  // Handle Area Dropdown Change
  function handleAreaChange(areaId) {
    setSelectedAreaId(areaId);
    setSelectedPatrolId(null);
    const areaObj = PATROL_AREAS.find((a) => a.id === areaId);
    if (areaObj) {
      setMapCenter(areaObj.center);
      setMapZoom(areaObj.zoom);
    }
  }

  // Handle locating a patrol vehicle on map
  function handleLocateVehicle(patrol) {
    setSelectedPatrolId(patrol.id);
    setSelectedId(patrol.id);
    setMapCenter([patrol.lat, patrol.lng]);
    setMapZoom(15);
    setToastMessage(`📍 Focused on ${patrol.code} (${patrol.callSign}) at ${patrol.sectorEn}`);
  }

  // Handle locating a police station on map
  function handleLocateStation(stn) {
    setSelectedId(stn.id);
    setSelectedPatrolId(stn.id);
    setMapCenter([stn.lat, stn.lng]);
    setMapZoom(15);
    setToastMessage(`📍 Focused on ${stn.nameEn} (${stn.code})`);
  }

  // Handle dispatching alert to patrol vehicle
  function handleDispatchPatrol(patrolId) {
    setPatrolUnits((prev) =>
      prev.map((u) => (u.id === patrolId ? { ...u, status: "responding", statusLabel: { hi: "अलर्ट रिस्पॉन्स (Responding)", en: "Emergency Responding" } } : u))
    );
    const p = patrolUnits.find((u) => u.id === patrolId);
    const msg = `🚨 Dispatch alert transmitted to ${p?.code} (${p?.officer})`;
    setToastMessage(msg);
    speakVoiceAlert(msg);
  }

  // Callback when a new station is added
  function handleStationAdded(newStation) {
    setStations((prev) => [newStation, ...prev.filter((s) => s.id !== newStation.id)]);
    setMapCenter([newStation.lat, newStation.lng]);
    setMapZoom(15);
    setToastMessage(`✓ ${newStation.nameEn} (${newStation.code}) registered successfully!`);
    speakVoiceAlert(`New police station ${newStation.nameEn} registered in system.`);
  }

  // Callback when a new patrol unit is added
  function handlePatrolAdded(newUnit) {
    setPatrolUnits((prev) => [newUnit, ...prev.filter((u) => u.id !== newUnit.id)]);
    setSelectedPatrolId(newUnit.id);
    setMapCenter([newUnit.lat, newUnit.lng]);
    setMapZoom(15);
    setToastMessage(`✓ ${newUnit.code} (${newUnit.callSign}) onboarded to patrol fleet!`);
    speakVoiceAlert(`New patrol unit ${newUnit.code} activated in system.`);
  }

  // Deletion handlers
  async function handleDeleteStation(id) {
    if (window.confirm(lang === "hi" ? "क्या आप इस थाने को हटाना चाहते हैं?" : "Are you sure you want to remove this station?")) {
      setStations((prev) => prev.filter((s) => s.id !== id));
      await fetch(`/api/police-stations?id=${id}`, { method: "DELETE" }).catch(() => {});
      setToastMessage("Station removed.");
    }
  }

  async function handleDeletePatrol(id) {
    if (window.confirm(lang === "hi" ? "क्या आप इस गश्त वाहन को हटाना चाहते हैं?" : "Are you sure you want to remove this patrol unit?")) {
      setPatrolUnits((prev) => prev.filter((u) => u.id !== id));
      await fetch(`/api/patrol-units?id=${id}`, { method: "DELETE" }).catch(() => {});
      setToastMessage("Patrol unit removed.");
    }
  }

  const currentArea = useMemo(
    () => PATROL_AREAS.find((a) => a.id === selectedAreaId) || PATROL_AREAS[0],
    [selectedAreaId]
  );

  // Filtered patrol units by area and vehicle type
  const filteredPatrolUnits = useMemo(() => {
    return patrolUnits.filter((unit) => {
      const matchArea = selectedAreaId === "all" || unit.areaId === selectedAreaId;
      const matchType = selectedVehicleType === "all" || unit.vehicleCategory === selectedVehicleType;
      return matchArea && matchType;
    });
  }, [patrolUnits, selectedAreaId, selectedVehicleType]);

  // Filtered police stations by area
  const filteredPoliceStations = useMemo(() => {
    if (selectedAreaId === "all") return stations;
    return stations.filter((s) => s.areaId === selectedAreaId);
  }, [stations, selectedAreaId]);

  const trafficPoints = useMemo(
    () =>
      TRAFFIC_POINTS.map((p) => ({
        ...p,
        level: traffic[p.id]?.level || "free",
        levelLabel: LEVEL_LABEL[traffic[p.id]?.level || "free"][lang],
      })),
    [traffic, lang]
  );

  const activeAlerts = alerts.filter((a) => !a.dispatched);

  const parkingStats = useMemo(() => {
    const totalCapacity = parkingZones.reduce((acc, z) => acc + z.totalSpots, 0);
    const totalOccupied = parkingZones.reduce((acc, z) => acc + z.occupiedSpots, 0);
    const pct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    const totalFree = totalCapacity - totalOccupied;
    return { totalCapacity, totalOccupied, totalFree, pct };
  }, [parkingZones]);

  const parkingPointsFormatted = useMemo(
    () =>
      parkingZones.map((z) => ({
        ...z,
        status: getOccupancyStatus(z.occupiedSpots, z.totalSpots),
      })),
    [parkingZones]
  );

  const parkingSearchResults = useMemo(() => {
    return searchParking(parkingSearchQuery, parkingZones);
  }, [parkingSearchQuery, parkingZones]);

  const filteredParkingPointsFormatted = useMemo(
    () =>
      parkingSearchResults.matchedZones.map((z) => ({
        ...z,
        status: getOccupancyStatus(z.occupiedSpots, z.totalSpots),
      })),
    [parkingSearchResults.matchedZones]
  );

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const inProgress = complaints.filter((c) => c.status === "in_progress").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    return { total, pending, inProgress, resolved };
  }, [complaints]);

  const zones = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      map[c.location] = (map[c.location] || 0) + 1;
    });
    const arr = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const max = arr.length ? arr[0][1] : 1;
    return arr.slice(0, 5).map(([location, count]) => ({ location, count, pct: (count / max) * 100 }));
  }, [complaints]);

  const filtered = useMemo(() => {
    if (filter === "all") return complaints;
    return complaints.filter((c) => c.status === filter);
  }, [complaints, filter]);

  async function handleStatusChange(id, status) {
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    await fetch(`/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function timeAgo(ts) {
    const s = Math.floor((now - ts) / 1000);
    if (s < 60) return t("timeJustNow", lang);
    return `${Math.floor(s / 60)} ${t("minutesAgo", lang)}`;
  }

  const MODULE_NAV_TABS = [
    ["overview", t("tabOverviewAdmin", lang), "📊"],
    ["complaints", t("tabComplaintsReport", lang), "📝"],
    ["traffic", t("tabTrafficControl", lang), "🚥"],
    ["parking", t("tabSmartParking", lang), "🅿️"],
    ["stations", t("tabStationsDir", lang), "🏢"],
    ["patrol", t("tabPatrol", lang), "🚔"],
  ];

  const FILTERS = [
    ["all", t("filterAll", lang)],
    ["pending", t("filterPending", lang)],
    ["in_progress", t("filterProgress", lang)],
    ["resolved", t("filterResolved", lang)],
  ];

  const STATUS_OPTIONS = [
    ["pending", t("filterPending", lang)],
    ["in_progress", t("filterProgress", lang)],
    ["resolved", t("filterResolved", lang)],
  ];

  const emergencyComplaints = useMemo(() => {
    return complaints.filter(
      (c) =>
        (c.isEmergency || c.category === "सड़क दुर्घटना" || c.categoryEn === "Accident / Emergency") &&
        c.status === "pending" &&
        !dispatchedStationIds.includes(c.id)
    );
  }, [complaints, dispatchedStationIds]);

  useEffect(() => {
    if (emergencyComplaints.length > 0 && soundEnabled) {
      const topEmergency = emergencyComplaints[0];
      const station = topEmergency.nearestStation || findNearestPoliceStation(topEmergency.lat, topEmergency.lng, stations);
      speakVoiceAlert(
        `Emergency Alert! Road accident reported near ${topEmergency.location}. Nearest station ${station.nameEn} notified for instant dispatch.`
      );
    }
  }, [emergencyComplaints.length, soundEnabled, stations]);

  function handleDispatchStationTeam(complaintId) {
    const complaint = complaints.find((c) => c.id === complaintId);
    if (!complaint) return;

    // Targeted alert to nearby police station only
    const nearestStn = complaint.nearestStation || findNearestPoliceStation(complaint.lat, complaint.lng, stations);
    const nearestPatrol = findNearestPatrolUnit(complaint.lat, complaint.lng, patrolUnits);

    const stationName = nearestStn ? (lang === "hi" ? nearestStn.name : nearestStn.nameEn) : "Kotwali Police Station";
    const patrolCallSign = nearestPatrol ? `${nearestPatrol.code} (${nearestPatrol.callSign})` : "PCR-01 (Kotwali Tiger)";

    // Update patrol unit status to responding & alert transmission
    if (nearestPatrol) {
      setPatrolUnits((prev) =>
        prev.map((u) =>
          u.id === nearestPatrol.id
            ? {
                ...u,
                status: "responding",
                statusLabel: { hi: "अलर्ट रिस्पॉन्स (Responding)", en: "Emergency Responding" },
                currentTask: `🚨 Responding to Accident at ${complaint.location}`,
              }
            : u
        )
      );
    }

    // Dismiss notification banner immediately
    setDispatchedStationIds((prev) => [...prev, complaintId]);

    // Restore and update complaint in table
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: "in_progress",
              assignedStation: stationName,
              assignedPatrol: patrolCallSign,
              dispatchedAt: Date.now(),
            }
          : c
      )
    );

    // Save status update to database/API
    fetch(`/api/complaints/${complaintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "in_progress",
        assignedStation: stationName,
        assignedPatrol: patrolCallSign,
      }),
    }).catch(() => {});

    // Toast notification confirmation
    const msg =
      lang === "hi"
        ? `🚨 आपातकालीन टीम तैनात: गश्त पुलिस ${patrolCallSign} एवं ${stationName} को ${complaint.location} के लिए रवाना किया गया! अलर्ट सूचना हटाई गई और डेटा तालिका में सुरक्षित है।`
        : `🚨 Emergency Dispatched: Alert transmitted to patrolling police ${patrolCallSign} via ${stationName}! Notification dismissed & updated in complaints table.`;

    setToastMessage(msg);
    speakVoiceAlert(`Emergency team dispatched. Alert transmitted to patrolling police.`);
  }

  const activePatrolCount = filteredPatrolUnits.filter((u) => u.status === "on_patrol" || u.status === "responding").length;

  return (
    <div className={styles.shell}>
      <Navbar
        lang={lang}
        onLangChange={setLang}
        activeAdminTab={activeTab}
        onAdminTabChange={handleTabChange}
      />

      {/* Modals */}
      <AddPoliceStationModal
        isOpen={isAddStationModalOpen}
        onClose={() => setIsAddStationModalOpen(false)}
        onStationAdded={handleStationAdded}
        lang={lang}
      />

      <AddPatrolUnitModal
        isOpen={isAddPatrolModalOpen}
        onClose={() => setIsAddPatrolModalOpen(false)}
        onPatrolAdded={handlePatrolAdded}
        stations={stations}
        lang={lang}
      />

      <ParkedVehiclesModal
        isOpen={!!selectedParkingZoneForModal}
        onClose={() => setSelectedParkingZoneForModal(null)}
        zone={selectedParkingZoneForModal}
        lang={lang}
      />

      <main className={styles.main}>
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className={styles.toastNotification}>
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* High Priority Emergency Accident Banner */}
        {emergencyComplaints.map((c) => {
          const station = c.nearestStation || findNearestPoliceStation(c.lat, c.lng, stations);
          const patrol = findNearestPatrolUnit(c.lat, c.lng, patrolUnits);
          const isDispatched = dispatchedStationIds.includes(c.id) || c.status === "in_progress";

          return (
            <div className={styles.emergencyAlertBanner} key={`emergency-${c.id}`}>
              <span style={{ fontSize: 26 }}>🚨</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: "#fee2e2",
                      color: "#991b1b",
                      border: "1px solid #fca5a5",
                      padding: "2px 8px",
                      borderRadius: 10,
                      letterSpacing: 0.5,
                    }}
                  >
                    🎯 {lang === "hi" ? "लक्षित अलर्ट: केवल एडमिन व निकटतम थाना" : "TARGETED ALERT: ADMIN & NEARBY POLICE ONLY"}
                  </span>
                  <span style={{ fontSize: 11.5, color: "#7f1d1d", fontWeight: 700 }}>
                    ({lang === "hi" ? station.name : station.nameEn})
                  </span>
                </div>

                <div className={styles.emergencyTitle}>
                  {t("emergencyAlertTitle", lang)} — {c.location}
                </div>

                <div className={styles.emergencyDesc}>
                  <strong>{c.category} ({c.id}):</strong> {c.description}
                  <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 6, fontSize: 12 }}>
                    <div>
                      <strong>🏢 {t("nearestStationLabel", lang)}:</strong>{" "}
                      <span style={{ fontWeight: 700, color: "#991b1b" }}>
                        {lang === "hi" ? station.name : station.nameEn}
                      </span>{" "}
                      ({station.distanceKm || "1.2"} km) · 📞 {station.phone}
                    </div>
                    {patrol && (
                      <div>
                        <strong>🚔 {t("nearestPatrolLabel", lang)}:</strong>{" "}
                        <span style={{ fontWeight: 700, color: "#1e3a8a" }}>
                          {patrol.code} ({patrol.callSign})
                        </span>{" "}
                        · 👤 {patrol.driverName} ({patrol.speed})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.soundBtn}
                onClick={() => setSoundEnabled((prev) => !prev)}
              >
                {soundEnabled ? t("soundAlertToggle", lang) : t("soundMuted", lang)}
              </button>

              <button
                type="button"
                className={styles.deployBtn}
                disabled={isDispatched}
                onClick={() => handleDispatchStationTeam(c.id)}
                style={{
                  background: "#b91c1c",
                  color: "white",
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 800,
                  boxShadow: "0 4px 10px rgba(185, 28, 28, 0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isDispatched ? t("dispatchedSuccess", lang) : t("dispatchStationTeam", lang)}
              </button>
            </div>
          );
        })}

        {activeAlerts.map((a) => (
          <div className={styles.alertBanner} key={a.id}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--signal-red)" }} />
            <div>
              <strong>{t("alertHeavyTitle", lang)} {lang === "hi" ? a.name : a.nameEn}</strong>
              <br />
              <span>{timeAgo(a.time)} · {t("alertHeavyBody", lang)}</span>
            </div>
            <button className={styles.deployBtn} onClick={() => handleDeploy(a.id, a.junctionId)}>
              {t("deployButton", lang)}
            </button>
          </div>
        ))}

        {/* Module Navigation Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div className={styles.filterRow} style={{ marginBottom: 0 }}>
            {MODULE_NAV_TABS.map(([key, label, icon]) => (
              <button
                key={key}
                className={`${styles.filterBtn} ${activeTab === key ? styles.active : ""}`}
                onClick={() => handleTabChange(key)}
                style={{ padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: MAIN PAGE OF ADMIN (DEFAULT) — ONLY LIVE TRAFFIC MAP & COMPLAINT LOG */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div>
            {/* Top KPI Stat Row */}
            <div className={styles.statRow}>
              <div className={styles.statCard}>
                <div className="lbl" style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {t("statTotalComplaints", lang)}
                </div>
                <div className="val" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--navy-900)", marginTop: 6 }}>
                  {loading ? "…" : stats.total}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
                  Citizen Reports
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.pending}`}>
                <div className="lbl" style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {t("statPendingAdmin", lang)}
                </div>
                <div className="val" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--signal-red)", marginTop: 6 }}>
                  {loading ? "…" : stats.pending}
                </div>
                <div style={{ fontSize: 11, color: "var(--signal-red)", marginTop: 4 }}>
                  Action Pending
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.progress}`}>
                <div className="lbl" style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {t("statInProgress", lang)}
                </div>
                <div className="val" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--amber-deep)", marginTop: 6 }}>
                  {loading ? "…" : stats.inProgress}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
                  Under Investigation
                </div>
              </div>
              <div className={`${styles.statCard} ${styles.resolved}`}>
                <div className="lbl" style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
                  {t("statResolvedAdmin", lang)}
                </div>
                <div className="val" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--signal-green)", marginTop: 6 }}>
                  {loading ? "…" : stats.resolved}
                </div>
                <div style={{ fontSize: 11, color: "var(--signal-green)", marginTop: 4 }}>
                  Successfully Resolved
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                {/* LIVE TRAFFIC & COMPLAINTS COMBINED MAP */}
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.liveHead}>
                      <h3>{t("liveTrafficMapTitle", lang)} &amp; {t("complaintListTitle", lang)}</h3>
                      <span className={styles.liveTag}>● LIVE STREAM</span>
                    </div>
                    <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {complaints.length} complaints · {TRAFFIC_POINTS.length} {t("junctionsLabel", lang)}
                    </span>
                  </div>

                  <MapView
                    complaints={complaints}
                    trafficPoints={trafficPoints}
                    parkingPoints={[]}
                    policeStations={[]}
                    patrolUnits={[]}
                    height={380}
                    onSelect={setSelectedId}
                    selectedId={selectedId}
                    lang={lang}
                    mode="all"
                  />

                  <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 11.5, color: "var(--ink-soft)", flexWrap: "wrap", alignItems: "center" }}>
                    <span>{t("legendComplaint", lang)}</span>
                    <span style={{ color: "var(--signal-green)" }}>{t("legendFree", lang)}</span>
                    <span style={{ color: "var(--amber-deep)" }}>{t("legendModerate", lang)}</span>
                    <span style={{ color: "var(--signal-red)" }}>{t("legendHeavy", lang)}</span>
                  </div>
                </div>

                {/* COMPLAINT LOG TABLE */}
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <h3>{t("complaintListTitle", lang)}</h3>
                    <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>Citizen reports stream</span>
                  </div>
                  <div className={styles.filterRow}>
                    {FILTERS.map(([key, label]) => (
                      <button
                        key={key}
                        className={`${styles.filterBtn} ${filter === key ? styles.active : ""}`}
                        onClick={() => setFilter(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t("colId", lang)}</th>
                        <th>{t("colLocation", lang)}</th>
                        <th>{t("colType", lang)}</th>
                        <th>{t("colTime", lang)}</th>
                        <th>{t("colStatus", lang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedId(c.id)}
                          style={{ cursor: "pointer", background: selectedId === c.id ? "var(--paper)" : "transparent" }}
                        >
                          <td className={styles.rowId}>
                            <div>{c.id}</div>
                            {(c.isEmergency || c.category === "सड़क दुर्घटना" || c.categoryEn === "Accident / Emergency") && (
                              <span style={{ fontSize: 9.5, background: "#fee2e2", color: "#b91c1c", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                🚨 EMERGENCY
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>{c.location}</strong>
                            {c.assignedPatrol && (
                              <div style={{ fontSize: 11, color: "#15803d", fontWeight: 700, marginTop: 2 }}>
                                🚔 Dispatched: {c.assignedPatrol} ({c.assignedStation || "Police PS"})
                              </div>
                            )}
                          </td>
                          <td>{c.category}</td>
                          <td style={{ color: "var(--ink-soft)" }}>
                            {new Date(c.reportedAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short" })}
                          </td>
                          <td>
                            <select
                              className={styles.statusSelect}
                              value={c.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {!loading && filtered.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--ink-soft)", padding: "20px 0" }}>{t("noComplaints", lang)}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                {/* Live Traffic Junction Summary */}
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.liveHead}>
                      <h3>{t("liveTrafficTitle", lang)}</h3>
                      <span className={styles.liveTag}>● LIVE</span>
                    </div>
                    <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{TRAFFIC_POINTS.length} {t("junctionsLabel", lang)}</span>
                  </div>
                  {trafficPoints.map((p) => (
                    <div className={styles.trafficRow} key={p.id}>
                      <div className={`${styles.trafficDot} ${styles[`dot-${p.level}`]}`} />
                      <div>
                        <div className={styles.trafficName}>{lang === "hi" ? p.name : p.nameEn}</div>
                        <div className={styles.trafficMeta}>{lang === "hi" ? p.nameEn : p.name} · {timeAgo(traffic[p.id]?.updatedAt || now)}</div>
                      </div>
                      <span className={`${styles.trafficLevel} ${styles[`level-${p.level}`]}`}>
                        {LEVEL_LABEL[p.level][lang]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <h3>{t("topZonesTitle", lang)}</h3>
                    <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{t("topZonesSub", lang)}</span>
                  </div>
                  {zones.map((z, i) => (
                    <div className={styles.zoneRow} key={z.location}>
                      <div className={styles.zoneRank}>{i + 1}</div>
                      <div style={{ flex: 1 }}>{z.location}</div>
                      <div className={styles.zoneBar}><div className={styles.zoneBarFill} style={{ width: `${z.pct}%` }} /></div>
                      <div className={styles.zoneCount}>{z.count}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <h3>{t("recoTitle", lang)}</h3>
                    <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{t("recoSub", lang)}</span>
                  </div>
                  <div className={styles.recoList}>
                    {RECOMMENDATIONS.map((r) => (
                      <div className={styles.recoItem} key={r.title.en}>
                        <div className={styles.recoIcon}>{r.icon}</div>
                        <div className={styles.recoText} style={{ flex: 1 }}>
                          <strong>{r.title[lang]}</strong>
                          <span>{r.detail[lang]}</span>
                        </div>
                        <div className={styles.recoCost}>{r.cost[lang]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DEDICATED CITIZEN COMPLAINT REPORTS PAGE & MAP */}
        {/* ========================================================================= */}
        {activeTab === "complaints" && (
          <div>
            <div className={styles.grid}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>📝 {t("tabComplaintsReport", lang)}</h3>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {filtered.length} of {complaints.length} reports
                  </span>
                </div>
                <div className={styles.filterRow} style={{ marginBottom: 12 }}>
                  {FILTERS.map(([key, label]) => (
                    <button
                      key={key}
                      className={`${styles.filterBtn} ${filter === key ? styles.active : ""}`}
                      onClick={() => setFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t("colId", lang)}</th>
                        <th>{t("colLocation", lang)}</th>
                        <th>{t("colType", lang)}</th>
                        <th>{t("colTime", lang)}</th>
                        <th>{t("colStatus", lang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => {
                            setSelectedId(c.id);
                            setMapCenter([c.lat, c.lng]);
                            setMapZoom(15);
                          }}
                          style={{ cursor: "pointer", background: selectedId === c.id ? "var(--paper)" : "transparent" }}
                        >
                          <td className={styles.rowId}>
                            <div>{c.id}</div>
                            {(c.isEmergency || c.category === "सड़क दुर्घटना" || c.categoryEn === "Accident / Emergency") && (
                              <span style={{ fontSize: 9.5, background: "#fee2e2", color: "#b91c1c", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
                                🚨 EMERGENCY
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>{c.location}</strong>
                            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{c.description?.slice(0, 45)}...</div>
                            {c.assignedPatrol && (
                              <div style={{ fontSize: 11, color: "#15803d", fontWeight: 700, marginTop: 2 }}>
                                🚔 Dispatched: {c.assignedPatrol} ({c.assignedStation || "Police PS"})
                              </div>
                            )}
                          </td>
                          <td>{c.category}</td>
                          <td style={{ color: "var(--ink-soft)" }}>
                            {new Date(c.reportedAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short" })}
                          </td>
                          <td>
                            <select
                              className={styles.statusSelect}
                              value={c.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            >
                              {STATUS_OPTIONS.map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>📍 {lang === "hi" ? "शिकायत स्थान मानचित्र" : "Complaints Map View"}</h3>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {filtered.length} locations
                  </span>
                </div>
                <MapView
                  complaints={filtered}
                  trafficPoints={[]}
                  parkingPoints={[]}
                  policeStations={[]}
                  patrolUnits={[]}
                  center={mapCenter}
                  zoom={mapZoom}
                  height={520}
                  onSelect={setSelectedId}
                  selectedId={selectedId}
                  lang={lang}
                  mode="complaints"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: DEDICATED LIVE TRAFFIC MAP & CONTROL PAGE */}
        {/* ========================================================================= */}
        {activeTab === "traffic" && (
          <div>
            <div className={styles.grid}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <div className={styles.liveHead}>
                    <h3>🚥 {t("tabTrafficControl", lang)}</h3>
                    <span className={styles.liveTag}>● REAL-TIME RADAR</span>
                  </div>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {TRAFFIC_POINTS.length} major corridors &amp; junctions
                  </span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Junction / Corridor</th>
                        <th>Status</th>
                        <th>Est. Speed</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trafficPoints.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => {
                            setMapCenter([p.lat, p.lng]);
                            setMapZoom(15);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className={`${styles.trafficDot} ${styles[`dot-${p.level}`]}`} />
                              <div>
                                <strong>{lang === "hi" ? p.name : p.nameEn}</strong>
                                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{lang === "hi" ? p.nameEn : p.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.trafficLevel} ${styles[`level-${p.level}`]}`}>
                              {LEVEL_LABEL[p.level][lang]}
                            </span>
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                            {p.level === "free" ? "42 km/h" : p.level === "moderate" ? "22 km/h" : "8 km/h"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.actionBtnSmall}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeploy(`manual-${p.id}`, p.id);
                                setToastMessage(`Patrol deployed to ${p.nameEn}`);
                              }}
                            >
                              🚓 Clear Jam
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>🛣️ {lang === "hi" ? "रायपुर लाइव ट्रैफिक फ्लो मैप" : "Raipur Live Traffic Flow Map"}</h3>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>High-contrast road corridors</span>
                </div>
                <MapView
                  complaints={[]}
                  trafficPoints={trafficPoints}
                  parkingPoints={[]}
                  policeStations={[]}
                  patrolUnits={[]}
                  center={mapCenter}
                  zoom={mapZoom}
                  height={540}
                  onSelect={setSelectedId}
                  selectedId={selectedId}
                  lang={lang}
                  mode="traffic"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: DEDICATED SMART PARKING SYSTEM PAGE */}
        {/* ========================================================================= */}
        {activeTab === "parking" && (
          <div>
            <div className={styles.grid}>
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <div className={styles.liveHead}>
                    <h3>🅿️ {t("tabSmartParking", lang)}</h3>
                    <span className={styles.liveTag} style={{ background: "#eef7f2", color: "#3f7d56" }}>
                      ● LIVE SENSORS & ANPR
                    </span>
                  </div>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {parkingStats.totalOccupied} / {parkingStats.totalCapacity} spots filled ({parkingStats.pct}%) ·{" "}
                    <strong style={{ color: "var(--signal-green)" }}>{parkingStats.totalFree} spots free</strong>
                  </span>
                </div>

                {/* Overall Occupancy Bar */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, color: "var(--navy-900)", marginBottom: 6 }}>
                    <span>{t("overallOccupancy", lang)} ({parkingStats.pct}% filled)</span>
                    <span style={{ color: "var(--ink-soft)" }}>{parkingZones.length} Active Hubs</span>
                  </div>
                  <div className={styles.zoneBar} style={{ height: 10 }}>
                    <div
                      className={styles.zoneBarFill}
                      style={{
                        width: `${parkingStats.pct}%`,
                        background: parkingStats.pct > 85 ? "var(--signal-red)" : parkingStats.pct > 65 ? "var(--amber-deep)" : "var(--signal-green)",
                      }}
                    />
                  </div>
                </div>

                {/* Universal Search Box (Vehicle Number & Area) */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid var(--line-strong, #cbd5e1)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: "var(--navy-900)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>🔍</span> {lang === "hi" ? "वाहन नंबर या क्षेत्र द्वारा खोजें" : "Universal Parking & Vehicle Search"}
                    </label>
                    {parkingSearchQuery && (
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>
                        {parkingSearchResults.matchedVehicles.length > 0
                          ? `🎯 ${parkingSearchResults.matchedVehicles.length} vehicle(s) found`
                          : `📍 ${filteredParkingPointsFormatted.length} hub(s) found`}
                      </span>
                    )}
                  </div>

                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        color: "#64748b",
                        fontSize: 14,
                        pointerEvents: "none",
                      }}
                    >
                      🔎
                    </span>
                    <input
                      type="text"
                      placeholder={
                        lang === "hi"
                          ? "वाहन नंबर (उदा. CG-04-MB-1245), क्षेत्र (उदा. Pandri), या पार्किंग स्थल खोजें..."
                          : "Search by vehicle number (e.g. CG-04-MB-1245), area (e.g. Pandri, Marine Drive), or hub name..."
                      }
                      value={parkingSearchQuery}
                      onChange={(e) => setParkingSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 38px 10px 38px",
                        fontSize: 13,
                        border: "1.5px solid var(--navy-900, #0f172a)",
                        borderRadius: 8,
                        outline: "none",
                        background: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    />
                    {parkingSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setParkingSearchQuery("")}
                        style={{
                          position: "absolute",
                          right: 10,
                          background: "#e2e8f0",
                          border: "none",
                          borderRadius: "50%",
                          width: 22,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#475569",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Quick Filters / Search Suggestion Chips */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>Quick Search:</span>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid var(--line-strong)",
                        background: !parkingSearchQuery ? "var(--navy-900)" : "white",
                        color: !parkingSearchQuery ? "white" : "var(--ink-soft)",
                        cursor: "pointer",
                      }}
                    >
                      All Hubs
                    </button>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("Pandri")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid var(--line-strong)",
                        background: parkingSearchQuery.toLowerCase() === "pandri" ? "var(--navy-900)" : "white",
                        color: parkingSearchQuery.toLowerCase() === "pandri" ? "white" : "var(--ink-soft)",
                        cursor: "pointer",
                      }}
                    >
                      📍 Pandri Area
                    </button>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("Marine Drive")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid var(--line-strong)",
                        background: parkingSearchQuery.toLowerCase() === "marine drive" ? "var(--navy-900)" : "white",
                        color: parkingSearchQuery.toLowerCase() === "marine drive" ? "white" : "var(--ink-soft)",
                        cursor: "pointer",
                      }}
                    >
                      📍 Marine Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("Railway Station")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid var(--line-strong)",
                        background: parkingSearchQuery.toLowerCase() === "railway station" ? "var(--navy-900)" : "white",
                        color: parkingSearchQuery.toLowerCase() === "railway station" ? "white" : "var(--ink-soft)",
                        cursor: "pointer",
                      }}
                    >
                      📍 Station Road
                    </button>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("CG-04-MB-1245")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid #1e3a8a",
                        background: parkingSearchQuery === "CG-04-MB-1245" ? "#1e3a8a" : "#eff6ff",
                        color: parkingSearchQuery === "CG-04-MB-1245" ? "white" : "#1e3a8a",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🚗 CG-04-MB-1245
                    </button>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("CG-04-MH-5821")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid #1e3a8a",
                        background: parkingSearchQuery === "CG-04-MH-5821" ? "#1e3a8a" : "#eff6ff",
                        color: parkingSearchQuery === "CG-04-MH-5821" ? "white" : "#1e3a8a",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🚗 CG-04-MH-5821
                    </button>
                    <button
                      type="button"
                      onClick={() => setParkingSearchQuery("MH-12-QX-3321")}
                      style={{
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 12,
                        border: "1px solid #1e3a8a",
                        background: parkingSearchQuery === "MH-12-QX-3321" ? "#1e3a8a" : "#eff6ff",
                        color: parkingSearchQuery === "MH-12-QX-3321" ? "white" : "#1e3a8a",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      🚗 MH-12-QX-3321
                    </button>
                  </div>
                </div>

                {/* Matched Vehicle Result Card (When Searching Vehicle Number) */}
                {parkingSearchResults.matchedVehicles.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                    {parkingSearchResults.matchedVehicles.map((v, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                          border: "2px solid #22c55e",
                          borderRadius: 10,
                          padding: "14px 16px",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {/* HSRP Plate UI */}
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                background: "#ffffff",
                                border: "1.5px solid #0f172a",
                                borderRadius: 4,
                                overflow: "hidden",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              }}
                            >
                              <div
                                style={{
                                  background: "#1e3a8a",
                                  color: "white",
                                  padding: "2px 4px",
                                  fontSize: 8,
                                  fontWeight: 800,
                                  letterSpacing: 0.5,
                                  lineHeight: 1,
                                }}
                              >
                                IND
                              </div>
                              <span
                                style={{
                                  padding: "3px 8px",
                                  fontFamily: "var(--font-mono, monospace)",
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: "#0f172a",
                                  letterSpacing: 0.5,
                                }}
                              >
                                {v.vehicleNumber}
                              </span>
                            </div>

                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#15803d",
                                background: "#dcfce7",
                                padding: "3px 8px",
                                borderRadius: 12,
                              }}
                            >
                              ● CURRENTLY PARKED / STANDING
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setMapCenter([v.lat, v.lng]);
                                setMapZoom(16);
                                setSelectedId(v.zoneId);
                              }}
                              style={{
                                background: "#15803d",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                padding: "5px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              🎯 {lang === "hi" ? "मैप पर देखें" : "Locate on Map"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const zone = parkingZones.find((z) => z.id === v.zoneId);
                                if (zone) setSelectedParkingZoneForModal(zone);
                              }}
                              style={{
                                background: "white",
                                color: "#15803d",
                                border: "1px solid #22c55e",
                                borderRadius: 6,
                                padding: "5px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              📋 {lang === "hi" ? "पार्किंग विवरण" : "Hub Details"}
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, fontSize: 12.5 }}>
                          <div>
                            <span style={{ color: "#475569" }}>{lang === "hi" ? "पार्किंग स्थल:" : "Standing in Hub:"}</span>{" "}
                            <strong style={{ color: "#0f172a" }}>{lang === "hi" ? v.zoneName : v.zoneNameEn}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#475569" }}>{lang === "hi" ? "निर्धारित स्लॉट/बे:" : "Assigned Bay/Slot:"}</span>{" "}
                            <strong style={{ color: "#0369a1", fontFamily: "var(--font-mono)" }}>{v.slot}</strong>
                          </div>
                          <div>
                            <span style={{ color: "#475569" }}>{lang === "hi" ? "वाहन मॉडल:" : "Vehicle Model:"}</span>{" "}
                            <strong>{v.model}</strong> ({v.type})
                          </div>
                          <div>
                            <span style={{ color: "#475569" }}>{lang === "hi" ? "प्रवेश समय:" : "Entry Time:"}</span>{" "}
                            <strong>🕒 {v.entryTime}</strong>
                          </div>
                          <div style={{ gridColumn: "1 / -1", color: "#166534", fontSize: 12 }}>
                            📍 {lang === "hi" ? v.zoneAddress : v.zoneAddressEn} ·{" "}
                            <strong>{v.totalSpots - v.occupiedSpots} spots currently available</strong> in this hub
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabular Form - Override column removed */}
                <div style={{ overflowX: "auto" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Parking Zone & Area</th>
                        <th>Type</th>
                        <th>Total Capacity</th>
                        <th>Occupied / Free</th>
                        <th>Live Status</th>
                        <th>Standing Vehicles</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParkingPointsFormatted.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "30px 10px", color: "var(--ink-soft)" }}>
                            <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
                            <strong>{lang === "hi" ? "कोई पार्किंग स्थल या वाहन नहीं मिला" : "No matching parking hub or vehicle found"}</strong>
                            <div style={{ fontSize: 12, marginTop: 4 }}>
                              {lang === "hi" ? "कृपया दूसरा क्षेत्र नाम या वाहन नंबर आज़माएँ" : "Try searching by a different area name or vehicle registration number"}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredParkingPointsFormatted.map((p) => {
                          const free = p.totalSpots - p.occupiedSpots;
                          const pct = Math.round((p.occupiedSpots / p.totalSpots) * 100);
                          const statusColor = p.status === "available" ? "var(--signal-green)" : p.status === "filling" ? "var(--amber-deep)" : "var(--signal-red)";
                          const hasMatchedVehicleInThisZone = parkingSearchResults.matchedVehicles.some((v) => v.zoneId === p.id);

                          return (
                            <tr
                              key={p.id}
                              onClick={() => {
                                setMapCenter([p.lat, p.lng]);
                                setMapZoom(15);
                                setSelectedId(p.id);
                              }}
                              style={{
                                cursor: "pointer",
                                background: hasMatchedVehicleInThisZone ? "rgba(34, 197, 94, 0.08)" : undefined,
                                borderLeft: hasMatchedVehicleInThisZone ? "3px solid #16a34a" : undefined,
                              }}
                            >
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <strong>{lang === "hi" ? p.name : p.nameEn}</strong>
                                  {hasMatchedVehicleInThisZone && (
                                    <span style={{ fontSize: 10, background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>
                                      🎯 Vehicle Here
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{lang === "hi" ? p.address : p.addressEn}</div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontSize: 11,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    fontWeight: 600,
                                  }}
                                >
                                  {p.type}
                                </span>
                              </td>
                              <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{p.totalSpots}</td>
                              <td>
                                <div style={{ fontSize: 12.5 }}>
                                  <strong>{p.occupiedSpots}</strong> occ / <span style={{ color: "var(--signal-green)", fontWeight: 700 }}>{free} free</span> ({pct}%)
                                </div>
                                <div style={{ width: 80, height: 4, background: "#e2e8f0", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                                  <div
                                    style={{
                                      width: `${pct}%`,
                                      height: "100%",
                                      background: pct > 85 ? "var(--signal-red)" : pct > 65 ? "var(--amber-deep)" : "var(--signal-green)",
                                    }}
                                  />
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: statusColor,
                                    background: `${statusColor}18`,
                                    padding: "3px 8px",
                                    borderRadius: 12,
                                  }}
                                >
                                  ● {p.status.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const fullZone = parkingZones.find((z) => z.id === p.id) || p;
                                    setSelectedParkingZoneForModal(fullZone);
                                  }}
                                  style={{
                                    background: "#f8fafc",
                                    border: "1px solid var(--line-strong)",
                                    borderRadius: 6,
                                    padding: "4px 8px",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    color: "var(--navy-900)",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  🚗 {p.parkedVehicles?.length || 0} Vehicles
                                </button>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMapCenter([p.lat, p.lng]);
                                    setMapZoom(16);
                                    setSelectedId(p.id);
                                  }}
                                  style={{
                                    background: "var(--navy-900)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "4px 9px",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  🎯 Map
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>🅿️ {lang === "hi" ? "स्मार्ट पार्किंग मानचित्र" : "Smart Parking Map"}</h3>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {filteredParkingPointsFormatted.length} live hubs displayed
                  </span>
                </div>
                <MapView
                  complaints={[]}
                  trafficPoints={[]}
                  parkingPoints={filteredParkingPointsFormatted.length > 0 ? filteredParkingPointsFormatted : parkingPointsFormatted}
                  policeStations={[]}
                  patrolUnits={[]}
                  center={mapCenter}
                  zoom={mapZoom}
                  height={540}
                  onSelect={setSelectedId}
                  selectedId={selectedId}
                  lang={lang}
                  mode="parking"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: DEDICATED REGISTERED POLICE STATIONS DIRECTORY PAGE */}
        {/* ========================================================================= */}
        {activeTab === "stations" && (
          <div>
            <div className={styles.grid}>
              <div className={styles.panel} style={{ border: "2px solid #1e3a8a" }}>
                <div className={styles.panelHead}>
                  <div className={styles.liveHead}>
                    <h3>🏢 {t("stationsDirectoryTitle", lang)}</h3>
                    <span className={styles.liveTag} style={{ background: "#eff6ff", color: "#1e3a8a" }}>
                      ● 24x7 DIRECTORY
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setIsAddStationModalOpen(true)}
                      style={{
                        background: "#1e3a8a",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 4px rgba(30, 58, 138, 0.2)",
                      }}
                    >
                      {t("addStationBtn", lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddPatrolModalOpen(true)}
                      style={{
                        background: "#b91c1c",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 14px",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: "0 2px 4px rgba(185, 28, 28, 0.2)",
                      }}
                    >
                      {t("addPatrolBtn", lang)}
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t("colStationName", lang)}</th>
                        <th>{t("colJurisdiction", lang)}</th>
                        <th>{t("colInCharge", lang)}</th>
                        <th>{t("colAssignedPatrol", lang)}</th>
                        <th>{t("colAction", lang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.map((stn) => (
                        <tr
                          key={stn.id}
                          onClick={() => handleLocateStation(stn)}
                          style={{ cursor: "pointer", background: selectedId === stn.id ? "#eff6ff" : "transparent" }}
                        >
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 18 }}>🏢</span>
                              <div>
                                <strong style={{ color: "#0f172a", fontSize: 13.5 }}>
                                  {lang === "hi" ? stn.name : stn.nameEn}
                                </strong>
                                <div style={{ fontSize: 11, color: "#1e3a8a", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                                  {stn.code || "PS"} · 24x7 Active
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#334155" }}>
                              {lang === "hi" ? stn.jurisdiction : stn.jurisdictionEn}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                              📍 {lang === "hi" ? stn.address : stn.addressEn}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: 12.5, color: "#0f172a" }}>
                              👤 <strong>{stn.inCharge}</strong>
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                              {lang === "hi" ? stn.inChargeRankHi : stn.inChargeRank} · 📞 <a href={`tel:${stn.phone}`} style={{ color: "#1e40af", fontWeight: 700 }}>{stn.phone}</a>
                            </div>
                          </td>
                          <td>
                            <span style={{ background: "#fef2f2", color: "#b91c1c", padding: "2px 8px", borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                              🚔 {stn.assignedPatrol || "PCR Patrol"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <button
                                type="button"
                                className={`${styles.actionBtnSmall} ${styles.actionBtnPrimary}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLocateStation(stn);
                                }}
                              >
                                📍 {t("locateOnMap", lang)}
                              </button>
                              <a
                                href={`tel:${stn.phone}`}
                                className={styles.actionBtnSmall}
                                onClick={(e) => e.stopPropagation()}
                              >
                                📞 Call
                              </a>
                              <button
                                type="button"
                                className={styles.actionBtnSmall}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStation(stn.id);
                                }}
                                style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>🏢 {lang === "hi" ? "पुलिस थाना नेटवर्क मानचित्र" : "Police Station Network Map"}</h3>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{stations.length} active stations</span>
                </div>
                <MapView
                  complaints={[]}
                  trafficPoints={[]}
                  parkingPoints={[]}
                  policeStations={stations}
                  patrolUnits={[]}
                  center={mapCenter}
                  zoom={mapZoom}
                  height={540}
                  onSelect={handleLocateStation}
                  selectedId={selectedId}
                  lang={lang}
                  mode="police"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: DEDICATED LIVE PATROLLING POLICE FLEET PAGE */}
        {/* ========================================================================= */}
        {activeTab === "patrol" && (
          <div>
            {/* AREA-WISE & CATEGORY TOOLBAR */}
            <div className={styles.areaControlBar}>
              <div className={styles.areaControlGroup}>
                <label htmlFor="area-select-dropdown" className={styles.areaSelectLabel}>
                  <span>📍 {t("areaSelectLabel", lang)}</span>
                </label>
                <select
                  id="area-select-dropdown"
                  className={styles.areaDropdown}
                  value={selectedAreaId}
                  onChange={(e) => handleAreaChange(e.target.value)}
                >
                  {PATROL_AREAS.map((area) => {
                    const pCount = area.id === "all" ? patrolUnits.length : patrolUnits.filter((u) => u.areaId === area.id).length;
                    return (
                      <option key={area.id} value={area.id}>
                        {lang === "hi" ? area.name : area.nameEn} ({pCount} 🚔)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.vehicleTypeGroup}>
                <button
                  type="button"
                  className={`${styles.typePill} ${selectedVehicleType === "all" ? styles.active : ""}`}
                  onClick={() => setSelectedVehicleType("all")}
                >
                  🌐 {t("allVehicles", lang)} ({filteredPatrolUnits.length})
                </button>
                <button
                  type="button"
                  className={`${styles.typePill} ${selectedVehicleType === "pcr_van" ? styles.active : ""}`}
                  onClick={() => setSelectedVehicleType("pcr_van")}
                >
                  🚔 PCR Vans
                </button>
                <button
                  type="button"
                  className={`${styles.typePill} ${selectedVehicleType === "bike_squad" ? styles.active : ""}`}
                  onClick={() => setSelectedVehicleType("bike_squad")}
                >
                  🏍️ Cheetah Bikes
                </button>
                <button
                  type="button"
                  className={`${styles.typePill} ${selectedVehicleType === "interceptor" ? styles.active : ""}`}
                  onClick={() => setSelectedVehicleType("interceptor")}
                >
                  🚓 Interceptors
                </button>
                <button
                  type="button"
                  className={`${styles.typePill} ${selectedVehicleType === "erv" ? styles.active : ""}`}
                  onClick={() => setSelectedVehicleType("erv")}
                >
                  🚨 ERVs
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddPatrolModalOpen(true)}
                  style={{
                    background: "#b91c1c",
                    color: "white",
                    border: "none",
                    borderRadius: 20,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ➕ {t("addPatrolBtn", lang)}
                </button>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.panel} style={{ border: "2px solid #b91c1c" }}>
                <div className={styles.panelHead}>
                  <div className={styles.liveHead}>
                    <h3>🚔 {t("patrolRosterTitle", lang)} — {lang === "hi" ? currentArea.name : currentArea.nameEn}</h3>
                    <span className={styles.liveTag} style={{ background: "#fef2f2", color: "#b91c1c" }}>
                      ● LIVE GPS
                    </span>
                  </div>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {filteredPatrolUnits.length} vehicles active in sector
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t("colVehicle", lang)}</th>
                        <th>{t("colSector", lang)}</th>
                        <th>{t("colOfficer", lang)}</th>
                        <th>{t("colSpeedFuel", lang)}</th>
                        <th>{t("colStatus", lang)}</th>
                        <th>{t("colAction", lang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatrolUnits.map((patrol) => {
                        const isSelected = selectedPatrolId === patrol.id;
                        const isBike = patrol.vehicleCategory === "bike_squad";
                        const isERV = patrol.vehicleCategory === "erv";
                        const isInterceptor = patrol.vehicleCategory === "interceptor";
                        const vehicleIcon = isBike ? "🏍️" : isERV ? "🚨" : isInterceptor ? "🚓" : "🚔";

                        return (
                          <tr
                            key={patrol.id}
                            onClick={() => handleLocateVehicle(patrol)}
                            style={{
                              background: isSelected ? "#eff6ff" : "transparent",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                          >
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 18 }}>{vehicleIcon}</span>
                                <div>
                                  <strong style={{ color: "#0f172a", fontSize: 13 }}>
                                    {lang === "hi" ? patrol.name : patrol.nameEn}
                                  </strong>
                                  <div style={{ fontSize: 11, color: "#1e3a8a", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                                    {patrol.vehicleNumber} · {patrol.callSign}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#334155" }}>
                                {lang === "hi" ? patrol.sector : patrol.sectorEn}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                                🏢 {lang === "hi" ? patrol.stationName : patrol.stationNameEn}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12.5, color: "#0f172a" }}>
                                👮 <strong>{patrol.officer}</strong>
                              </div>
                              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                                {lang === "hi" ? patrol.officerRankHi : patrol.officerRank} · 📞 {patrol.mobile}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                                ⚡ {patrol.speed || "22 km/h"}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                                🔋 Fuel: <strong>{patrol.fuelBattery || "85%"}</strong>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: patrol.status === "responding" ? "#c2410c" : patrol.status === "standby" ? "#475569" : "#15803d",
                                  background: patrol.status === "responding" ? "#ffedd5" : patrol.status === "standby" ? "#f1f5f9" : "#dcfce7",
                                  padding: "3px 8px",
                                  borderRadius: 12,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ● {lang === "hi" ? patrol.statusLabel?.hi || "सक्रिय" : patrol.statusLabel?.en || "Active"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <button
                                  type="button"
                                  className={`${styles.actionBtnSmall} ${styles.actionBtnPrimary}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLocateVehicle(patrol);
                                  }}
                                >
                                  📍 {t("locateOnMap", lang)}
                                </button>
                                <a
                                  href={`tel:${patrol.mobile}`}
                                  className={styles.actionBtnSmall}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  📞 Call
                                </a>
                                <button
                                  type="button"
                                  className={`${styles.actionBtnSmall} ${styles.actionBtnAlert}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDispatchPatrol(patrol.id);
                                  }}
                                >
                                  🚨 Alert
                                </button>
                                <button
                                  type="button"
                                  className={styles.actionBtnSmall}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePatrol(patrol.id);
                                  }}
                                  style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3>🚔 {lang === "hi" ? "लाइव गश्त वाहन मैप" : "Live Patrol Fleet Map"}</h3>
                  <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    {filteredPatrolUnits.length} units in {lang === "hi" ? currentArea.name : currentArea.nameEn}
                  </span>
                </div>
                <MapView
                  complaints={[]}
                  trafficPoints={[]}
                  parkingPoints={[]}
                  policeStations={filteredPoliceStations}
                  patrolUnits={filteredPatrolUnits}
                  center={mapCenter}
                  zoom={mapZoom}
                  selectedAreaPolygon={currentArea.polygon}
                  height={540}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setSelectedPatrolId(id);
                  }}
                  onDispatchPatrol={handleDispatchPatrol}
                  selectedId={selectedPatrolId || selectedId}
                  lang={lang}
                  mode="patrol"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading Admin Dashboard...</div>}>
      <AdminContent />
    </Suspense>
  );
}