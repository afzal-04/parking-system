"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";
import {
  PARKING_ZONES,
  findNearestParking,
  getOccupancyStatus,
  calculateDistance,
  searchParking,
} from "@/lib/parkingData";
import { TRAFFIC_POINTS } from "@/lib/trafficData";
import { findNearestPoliceStation } from "@/lib/policeStations";
import TrafficAdvisoryTicker from "@/components/TrafficAdvisoryTicker";
import EChallanModal from "@/components/EChallanModal";
import ELostReportModal from "@/components/ELostReportModal";
import FineRatesModal from "@/components/FineRatesModal";
import SpeedLimitModal from "@/components/SpeedLimitModal";
import TaxiComplaintModal from "@/components/TaxiComplaintModal";
import VehicleNocModal from "@/components/VehicleNocModal";
import SiteFooter from "@/components/SiteFooter";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const CATEGORIES = [
  { hi: "अवैध पार्किंग", en: "Illegal parking", icon: "🚗" },
  { hi: "अतिक्रमण", en: "Encroachment", icon: "🚧" },
  { hi: "नो-पार्किंग ज़ोन", en: "No-parking zone", icon: "⛔" },
  { hi: "सड़क दुर्घटना", en: "Accident / Emergency", icon: "🚨", isEmergency: true },
  { hi: "अन्य", en: "Other", icon: "📍" },
];

const LEVEL_LABEL = {
  free: { hi: "सामान्य", en: "Free flow" },
  moderate: { hi: "मध्यम", en: "Moderate" },
  heavy: { hi: "भारी जाम", en: "Heavy jam" },
};

const QUICK_LOCATIONS = [
  {
    name: { hi: "जयस्तंभ चौक", en: "Jaistambh Chowk" },
    lat: 21.2442,
    lng: 81.6338,
    address: "जयस्तंभ चौक, मालवीय रोड, गोल बाज़ार, रायपुर",
    addressEn: "Jaistambh Chowk, Malviya Road, Gol Bazar, Raipur",
  },
  {
    name: { hi: "तेलीबांधा मरीन ड्राइव", en: "Telibandha Marine Drive" },
    lat: 21.2365,
    lng: 81.6715,
    address: "मरीन ड्राइव, तेलीबांधा तालाब, जीई रोड, रायपुर",
    addressEn: "Marine Drive, Telibandha Talab, GE Road, Raipur",
  },
  {
    name: { hi: "पंडरी कपड़ा बाज़ार", en: "Pandri Market" },
    lat: 21.253,
    lng: 81.647,
    address: "पंडरी कपड़ा बाज़ार, सिटी सेंटर मॉल रोड, रायपुर",
    addressEn: "Pandri Cloth Market, City Center Mall Rd, Raipur",
  },
  {
    name: { hi: "घड़ी चौक", en: "Ghadi Chowk" },
    lat: 21.245,
    lng: 81.644,
    address: "घड़ी चौक, कलेक्टोरेट परिसर मार्ग, सिविल लाइन्स, रायपुर",
    addressEn: "Ghadi Chowk, Collectorate Road, Civil Lines, Raipur",
  },
  {
    name: { hi: "तातीबंध एम्स चौक", en: "Tatibandh AIIMS" },
    lat: 21.2567,
    lng: 81.5734,
    address: "तातीबंध चौक, एम्स अस्पताल के समीप, एनएच-53, रायपुर",
    addressEn: "Tatibandh Chowk, Near AIIMS Hospital, NH-53, Raipur",
  },
];

function CitizenPortalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab");
  const [internalTab, setInternalTab] = useState(tabFromUrl || "overview");
  const activeTab = tabFromUrl || internalTab;

  const [lang, setLang] = useState("en");
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ lat: 21.24368, lng: 81.63559 });
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // Module 4: Smart Parking states
  const [nearestSpot, setNearestSpot] = useState(null);
  const [parkingZones, setParkingZones] = useState(PARKING_ZONES);
  const [parkingSearch, setParkingSearch] = useState("");

  // Citizen Map tab selection ("traffic" | "parking")
  const [mapTab, setMapTab] = useState("traffic");

  // Modal States
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isELostModalOpen, setIsELostModalOpen] = useState(false);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);
  const [isNocModalOpen, setIsNocModalOpen] = useState(false);

  // Module 2: Traffic states
  const [traffic, setTraffic] = useState(() => {
    const initial = {};
    TRAFFIC_POINTS.forEach((p, idx) => {
      const level = idx === 0 ? "moderate" : idx === 2 ? "moderate" : idx === 3 ? "heavy" : "free";
      initial[p.id] = { level, updatedAt: Date.now() };
    });
    return initial;
  });

  function handleTabChange(newTab) {
    setInternalTab(newTab);
    router.push(`/?tab=${newTab}`, { scroll: false });
  }

  // Simulated live traffic feed for citizen portal
  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic((prev) => {
        const junction = TRAFFIC_POINTS[Math.floor(Math.random() * TRAFFIC_POINTS.length)];
        const current = prev[junction.id]?.level || "free";
        const r = Math.random();
        let next = current;
        if (current === "heavy") next = r < 0.6 ? "moderate" : "heavy";
        else if (current === "moderate") next = r < 0.2 ? "heavy" : r < 0.6 ? "free" : "moderate";
        else next = r < 0.18 ? "moderate" : "free";

        return { ...prev, [junction.id]: { level: next, updatedAt: Date.now() } };
      });
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Simulated live parking occupancy updates
  useEffect(() => {
    const interval = setInterval(() => {
      setParkingZones((prev) =>
        prev.map((zone) => {
          if (Math.random() < 0.3) {
            const delta = Math.floor(Math.random() * 5) - 2;
            const newOccupied = Math.max(0, Math.min(zone.totalSpots, zone.occupiedSpots + delta));
            return { ...zone, occupiedSpots: newOccupied };
          }
          return zone;
        })
      );
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints || []))
      .catch(() => {});

    // Check query params if arrived with service open request
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get("service");
      if (serviceParam) {
        handleOpenServiceModal(serviceParam);
      }
    }
  }, []);

  function handleOpenServiceModal(serviceKey) {
    if (serviceKey === "challan") setIsChallanModalOpen(true);
    else if (serviceKey === "elost") setIsELostModalOpen(true);
    else if (serviceKey === "fines") setIsFineModalOpen(true);
    else if (serviceKey === "speed") setIsSpeedModalOpen(true);
    else if (serviceKey === "taxi") setIsTaxiModalOpen(true);
    else if (serviceKey === "noc") setIsNocModalOpen(true);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setLocating(true);
    setGpsStatus("locating");
    setLocation(lang === "hi" ? "🛰️ जीपीएस सिग्नल व पता खोज रहे हैं..." : "🛰️ Fetching GPS fix and address...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 12);
        setCoords({ lat, lng });
        setGpsAccuracy(accuracy);

        // Reverse geocode via OpenStreetMap Nominatim for real street address
        let resolvedAddress = "";
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              signal: controller.signal,
              headers: { "Accept-Language": lang === "hi" ? "hi,en" : "en" },
            }
          );
          clearTimeout(timer);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood || addr.suburb || "";
            const area = addr.suburb || addr.city_district || addr.county || "";
            const city = addr.city || addr.town || addr.state_district || "Raipur";

            if (road && area && road !== area) {
              resolvedAddress = `${road}, ${area}, ${city}`;
            } else if (road) {
              resolvedAddress = `${road}, ${city}`;
            } else if (area) {
              resolvedAddress = `${area}, ${city}`;
            } else if (data.display_name) {
              resolvedAddress = data.display_name.split(",").slice(0, 3).join(", ").trim();
            }
          }
        } catch (e) {
          console.warn("Reverse geocode fallback:", e);
        }

        // Fallback: tag closest Raipur landmark & police station
        if (!resolvedAddress) {
          const nearest = findNearestPoliceStation(lat, lng);
          const landmark = nearest
            ? lang === "hi"
              ? nearest.jurisdiction.split(",")[0].trim()
              : nearest.jurisdictionEn.split(",")[0].trim()
            : "Raipur";
          resolvedAddress = `${landmark}, रायपुर (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        }

        setLocation(resolvedAddress);
        setGpsStatus("success");
        setLocating(false);
      },
      (err) => {
        console.warn("GPS error:", err);
        setGpsStatus("error");
        setLocating(false);
        setCoords({ lat: 21.24368, lng: 81.63559 });
        setLocation(
          lang === "hi"
            ? "जयस्तंभ चौक, गोल बाज़ार, रायपुर"
            : "Jaistambh Chowk, Gol Bazar, Raipur"
        );
        setGpsAccuracy(20);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!location || !description) return;
    setSubmitting(true);
    try {
      const nearestStation = findNearestPoliceStation(coords.lat, coords.lng);
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.hi,
          categoryEn: category.en,
          location,
          lat: coords.lat,
          lng: coords.lng,
          description,
          isEmergency: category.isEmergency || false,
          nearestStation,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComplaints((prev) => [data.complaint, ...prev]);
        setSuccess(data.complaint);
        setLocation("");
        setDescription("");
        setFileName("");
        setFilePreview(null);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleFindNearest() {
    if (!navigator.geolocation) {
      const nearest = findNearestParking(coords.lat, coords.lng, parkingZones);
      setNearestSpot(nearest);
      setMapTab("parking");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setCoords({ lat: userLat, lng: userLng });
        const nearest = findNearestParking(userLat, userLng, parkingZones);
        setNearestSpot(nearest);
        setMapTab("parking");
        setLocating(false);
      },
      () => {
        const nearest = findNearestParking(coords.lat, coords.lng, parkingZones);
        setNearestSpot(nearest);
        setMapTab("parking");
        setLocating(false);
      },
      { timeout: 6000 }
    );
  }

  const parkingZonesFormatted = useMemo(() => {
    return parkingZones
      .map((z) => {
        const dist = calculateDistance(coords.lat, coords.lng, z.lat, z.lng);
        const freeSpots = z.totalSpots - z.occupiedSpots;
        const pct = Math.round((z.occupiedSpots / z.totalSpots) * 100);
        return {
          ...z,
          distanceKm: dist.toFixed(2),
          freeSpots,
          pct,
          status: getOccupancyStatus(z.occupiedSpots, z.totalSpots),
        };
      })
      .sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));
  }, [parkingZones, coords]);

  const parkingSearchResults = useMemo(() => {
    return searchParking(parkingSearch, parkingZonesFormatted);
  }, [parkingZonesFormatted, parkingSearch]);

  const filteredParkingZones = useMemo(() => {
    return parkingSearchResults.matchedZones;
  }, [parkingSearchResults]);

  const trafficPointsFormatted = useMemo(
    () =>
      TRAFFIC_POINTS.map((p) => ({
        ...p,
        level: traffic[p.id]?.level || "free",
        levelLabel: LEVEL_LABEL[traffic[p.id]?.level || "free"][lang],
      })),
    [traffic, lang]
  );

  const CITIZEN_NAV_TABS = [
    ["overview", lang === "hi" ? "मुख्य डैशबोर्ड" : "Citizen Dashboard", "📊"],
    ["report", lang === "hi" ? "शिकायत दर्ज करें (M1)" : "Report Violation (M1)", "📝"],
    ["parking", lang === "hi" ? "स्मार्ट पार्किंग खोजें (M4)" : "Find Parking (M4)", "🅿️"],
    ["traffic", lang === "hi" ? "लाइव ट्रैफिक मानचित्र (M2)" : "Live Traffic Map (M2)", "🚥"],
  ];

  return (
    <div className={styles.shell}>
      <Navbar
        lang={lang}
        onLangChange={setLang}
        onOpenServiceModal={handleOpenServiceModal}
        activeCitizenTab={activeTab}
        onCitizenTabChange={handleTabChange}
      />
      <TrafficAdvisoryTicker lang={lang} />

      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>{t("eyebrow", lang)}</div>
          <h2 className={styles.heroTitle}>
            {t("heroTitlePre", lang)}<span>{t("heroTitleHighlight", lang)}</span>{t("heroTitlePost", lang)}
          </h2>
          <p className={styles.heroSub}>{t("heroSub", lang)}</p>

          {/* Quick Action Service Chips */}
          <div className={styles.heroServicesRow}>
            <span className={styles.heroServiceTitle}>
              {lang === "hi" ? "त्वरित नागरिक सेवाएँ:" : "Quick Services:"}
            </span>
            <button
              type="button"
              className={styles.heroServiceChip}
              onClick={() => setIsChallanModalOpen(true)}
            >
              💳 {lang === "hi" ? "ई-चालान" : "e-Challan"}
            </button>
            <button
              type="button"
              className={styles.heroServiceChip}
              onClick={() => setIsELostModalOpen(true)}
            >
              📁 {lang === "hi" ? "ई-लॉस्ट रिपोर्ट" : "e-Lost Report"}
            </button>
            <button
              type="button"
              className={styles.heroServiceChip}
              onClick={() => setIsFineModalOpen(true)}
            >
              📜 {lang === "hi" ? "जुर्माना दर तालिका" : "Fine Penalty Guide"}
            </button>
            <button
              type="button"
              className={styles.heroServiceChip}
              onClick={() => setIsSpeedModalOpen(true)}
            >
              🏎️ {lang === "hi" ? "गति सीमा नियम" : "Speed Limits"}
            </button>
            <button
              type="button"
              className={styles.heroServiceChip}
              onClick={() => setIsTaxiModalOpen(true)}
            >
              🛺 {lang === "hi" ? "ऑटो / टैक्सि शिकायत" : "Taxi Complaint"}
            </button>
            <button
              type="button"
              className={styles.heroServiceChip}
              onClick={() => setIsNocModalOpen(true)}
            >
              📄 {lang === "hi" ? "ट्रैफिक एनओसी" : "Traffic NOC"}
            </button>
          </div>
        </div>
      </section>

      <div className={styles.laneStrip}><div className="lane-divider" /></div>

      {/* Module Navigation Tabs (Identical UX to Admin page tabs) */}
      <div style={{ maxWidth: 1180, margin: "24px auto 0", padding: "0 24px" }}>
        <div className={styles.filterRow}>
          {CITIZEN_NAV_TABS.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              className={`${styles.filterBtn} ${activeTab === key ? styles.active : ""}`}
              onClick={() => handleTabChange(key)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CITIZEN DASHBOARD (OVERVIEW) — COMPLAINT FORM, PARKING, MAPS, POLICE */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <main className={styles.main}>
          {/* Left Column: Complaint Form & Find Parking Near You */}
          <div>
            {/* Section 1: Complaint Form */}
            {success ? (
              <div className={styles.card}>
                <div className={styles.form}>
                  <div className={styles.successBox}>
                    <div>
                      <strong>{t("successTitle", lang)} {success.id}</strong>
                      {t("successBody", lang)}
                    </div>
                  </div>
                  <button
                    className={styles.submitBtn}
                    style={{ background: "var(--navy-900)", color: "white" }}
                    onClick={() => setSuccess(null)}
                  >
                    {t("submitAnother", lang)}
                  </button>
                </div>
              </div>
            ) : (
              <form className={styles.card} onSubmit={handleSubmit}>
                <div className={styles.cardHead}>
                  <div>
                    <h2>{t("formTitle", lang)}</h2>
                    <div className="sub" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                      {t("formSub", lang)}
                    </div>
                  </div>
                  <span className={styles.serial}>FORM #PKG-2026</span>
                </div>

                <div className={styles.form}>
                  <div className={styles.field}>
                    <label>
                      {t("categoryLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("categoryHint", lang)}
                      </span>
                    </label>
                    <div className={styles.categoryGrid}>
                      {CATEGORIES.map((c) => (
                        <button
                          type="button"
                          key={c.en}
                          className={`${styles.catBtn} ${category.en === c.en ? styles.active : ""}`}
                          onClick={() => setCategory(c)}
                        >
                          {c.icon} {lang === "hi" ? c.hi : c.en}
                        </button>
                      ))}
                    </div>
                    {category.isEmergency && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 14px",
                          background: "#fee2e2",
                          border: "1px solid #ef4444",
                          borderRadius: "var(--radius)",
                          color: "#991b1b",
                          fontSize: 12.5,
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span>🚨</span>
                        <div>
                          <strong>{lang === "hi" ? "आपातकालीन त्वरित मोड सक्रिय:" : "Emergency Response Mode Active:"}</strong>{" "}
                          {lang === "hi"
                            ? "आपातकालीन नियंत्रण कक्ष को तुरंत सायरन व लोकेशन अलर्ट भेजा जाएगा।"
                            : "Instant high-priority alert & location beacon dispatched to emergency response control."}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label>
                      {t("photoLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("photoHint", lang)}
                      </span>
                    </label>
                    <label className={`${styles.dropzone} ${fileName ? styles.hasFile : ""}`}>
                      {filePreview ? (
                        <span className={styles.previewRow}>
                          <img src={filePreview} alt="" className={styles.previewThumb} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, marginRight: 8 }} />
                          <span>✓ {fileName} {t("photoAdded", lang)}</span>
                        </span>
                      ) : (
                        t("dropzone", lang)
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setFileName(file?.name || "");
                          setFilePreview(file ? URL.createObjectURL(file) : null);
                        }}
                      />
                    </label>
                  </div>

                  <div className={styles.field}>
                    <label>
                      {t("locationLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("locationHint", lang)}
                      </span>
                    </label>
                    <div className={styles.locRow}>
                      <input
                        placeholder={t("locationPlaceholder", lang)}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.gpsBtn}
                        onClick={useMyLocation}
                        disabled={locating}
                        title={lang === "hi" ? "जीपीएस से सटीक स्थान प्राप्त करें" : "Fetch precise location via GPS"}
                      >
                        {locating ? (lang === "hi" ? "🛰️ खोज रहे हैं..." : "🛰️ Locating...") : t("gpsButton", lang)}
                      </button>
                    </div>

                    {/* GPS Status */}
                    {gpsStatus === "locating" && (
                      <div className={styles.gpsBannerLocating}>
                        <span className="live-dot" />
                        <span>
                          {lang === "hi"
                            ? "🛰️ उपग्रह से जीपीएस सिग्नल व सटीक सड़क का पता प्राप्त किया जा रहा है..."
                            : "🛰️ Acquiring high-precision GPS satellites & resolving street address..."}
                        </span>
                      </div>
                    )}

                    {gpsStatus === "success" && (
                      <div className={styles.gpsBannerSuccess}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                          <span style={{ fontWeight: 700, color: "#15803d", display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <span>🛰️</span> {lang === "hi" ? "जीपीएस लॉक:" : "GPS Locked:"}{" "}
                            <code>{coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E</code>
                            {gpsAccuracy && <span style={{ fontSize: 11, fontWeight: 600, color: "#166534" }}>(±{gpsAccuracy}m)</span>}
                          </span>
                          <span style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>
                            ✓ {lang === "hi" ? "सत्यापित लोकेशन" : "Verified GPS Fix"}
                          </span>
                        </div>
                      </div>
                    )}

                    {gpsStatus === "error" && (
                      <div className={styles.gpsBannerError}>
                        <span>⚠️</span>
                        <div>
                          {lang === "hi"
                            ? "ब्राउज़र से जीपीएस सिग्नल प्राप्त नहीं हुआ। आप नीचे दिए गए रायपुर के क्षेत्रों में से चुन सकते हैं या मैन्युअल पता लिख सकते हैं।"
                            : "GPS permission not granted or signal timed out. You can pick a key Raipur area below or enter address manually."}
                        </div>
                      </div>
                    )}

                    {/* Quick Hub Chips */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 5, fontWeight: 600 }}>
                        {lang === "hi" ? "⚡ रायपुर के प्रमुख क्षेत्र (1-क्लिक चयन):" : "⚡ Key Raipur Hubs (1-Click Select):"}
                      </div>
                      <div className={styles.quickLocGrid}>
                        {QUICK_LOCATIONS.map((q) => (
                          <button
                            key={q.name.en}
                            type="button"
                            className={styles.quickLocBtn}
                            onClick={() => {
                              setCoords({ lat: q.lat, lng: q.lng });
                              setLocation(lang === "hi" ? q.address : q.addressEn);
                              setGpsStatus("success");
                              setGpsAccuracy(6);
                            }}
                          >
                            📍 {lang === "hi" ? q.name.hi : q.name.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>
                      {t("descriptionLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("descriptionHint", lang)}
                      </span>
                    </label>
                    <textarea
                      className={styles.textarea}
                      placeholder={t("descriptionPlaceholder", lang)}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button className={styles.submitBtn} type="submit" disabled={submitting}>
                    {submitting ? t("submitting", lang) : t("submitButton", lang)}
                  </button>
                </div>
              </form>
            )}

            {/* Section 2: Dedicated Find Parking Near You */}
            <div className={styles.card} style={{ marginTop: 24 }}>
              <div className={styles.cardHead}>
                <div>
                  <h2>🎯 {lang === "hi" ? "निकटतम पार्किंग खोजें" : "Find Parking Near You"}</h2>
                  <div className="sub" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                    {lang === "hi"
                      ? "रायपुर शहर के निर्धारित पार्किंग स्थल, लाइव खाली स्थान व दूरी"
                      : "Designated parking hubs, live spot capacity & real-time distance"}
                  </div>
                </div>
                <span className={styles.serial} style={{ background: "#eef7f2", color: "#3f7d56" }}>
                  MODULE 4 · PARKING
                </span>
              </div>

              <div className={styles.form}>
                {/* 1-Click GPS Locator & Search Bar */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    style={{
                      background: "var(--navy-900)",
                      color: "white",
                      padding: "10px 16px",
                      fontSize: 13.5,
                      flex: "1 1 200px",
                    }}
                    onClick={handleFindNearest}
                    disabled={locating}
                  >
                    {locating
                      ? (lang === "hi" ? "⏳ लोकेशन जाँची जा रही है..." : "⏳ Locating your GPS...")
                      : (lang === "hi" ? "📍 मेरे पास की पार्किंग खोजें" : "📍 Find Nearest Parking")}
                  </button>

                  <input
                    type="text"
                    placeholder={lang === "hi" ? "🔍 वाहन संख्या (उदा. CG-04-MB-1245), क्षेत्र या पार्किंग स्थल..." : "🔍 Search by vehicle number (e.g. CG-04-MB-1245), area, or hub..."}
                    value={parkingSearch}
                    onChange={(e) => setParkingSearch(e.target.value)}
                    style={{
                      flex: "1 1 180px",
                      padding: "10px 12px",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Matched Vehicle Card */}
                {parkingSearchResults.matchedVehicles.length > 0 && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      border: "2px solid #3b82f6",
                      padding: "14px 16px",
                      borderRadius: "var(--radius)",
                      marginBottom: 10,
                    }}
                  >
                    {parkingSearchResults.matchedVehicles.map((v, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontWeight: 800,
                                background: "#1e3a8a",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontSize: 13,
                                letterSpacing: 0.5,
                              }}
                            >
                              🚗 {v.vehicleNumber}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>
                              {lang === "hi" ? "वाहन पार्क है:" : "Standing at:"} {lang === "hi" ? v.zoneName : v.zoneNameEn}
                            </span>
                          </div>
                          <span style={{ fontSize: 11.5, background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                            📍 {v.slot}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#334155" }}>
                          🚘 {v.model} ({v.type}) · {lang === "hi" ? "प्रवेश:" : "Entry:"} <strong>{v.entryTime}</strong> | 📍 {lang === "hi" ? v.zoneAddress : v.zoneAddressEn}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nearest Spot Highlight Banner */}
                {nearestSpot && (
                  <div
                    className={styles.successBox}
                    style={{
                      background: "#f0fdf4",
                      borderColor: "#22c55e",
                      padding: "14px 16px",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <strong style={{ color: "#15803d", fontSize: 14 }}>
                          🎯 {lang === "hi" ? "निकटतम पार्किंग:" : "Nearest Parking:"} {lang === "hi" ? nearestSpot.name : nearestSpot.nameEn}
                        </strong>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${nearestSpot.lat},${nearestSpot.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#15803d",
                            background: "#dcfce7",
                            padding: "4px 10px",
                            borderRadius: 6,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          🧭 {lang === "hi" ? "दिशा-निर्देश (Maps)" : "Directions (Maps)"}
                        </a>
                      </div>
                      <div style={{ fontSize: 12.5, color: "#166534", marginTop: 4 }}>
                        📍 {lang === "hi" ? nearestSpot.address : nearestSpot.addressEn} · <strong>{nearestSpot.distanceKm} km away</strong> |{" "}
                        <span style={{ fontWeight: 700 }}>
                          {nearestSpot.totalSpots - nearestSpot.occupiedSpots} / {nearestSpot.totalSpots} {lang === "hi" ? "स्थान खाली" : "spots free"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nearby Parking Hubs List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {filteredParkingZones.map((zone) => {
                    const freeSpots = zone.totalSpots - zone.occupiedSpots;
                    const pct = Math.round((zone.occupiedSpots / zone.totalSpots) * 100);
                    const statusLabel =
                      zone.status === "available"
                        ? t("statusAvailable", lang)
                        : zone.status === "filling"
                        ? t("statusFilling", lang)
                        : t("statusFull", lang);
                    const statusColor =
                      zone.status === "available" ? "#3f7d56" : zone.status === "filling" ? "#c98f3f" : "#b3402f";

                    return (
                      <div
                        key={zone.id}
                        style={{
                          padding: "12px 14px",
                          background: "white",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--radius)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--navy-900)" }}>
                              {lang === "hi" ? zone.name : zone.nameEn}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
                              📍 {lang === "hi" ? zone.address : zone.addressEn} ·{" "}
                              <span style={{ color: "var(--navy-800)", fontWeight: 600 }}>{zone.distanceKm} km away</span> · {zone.type}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
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
                              ● {statusLabel}
                            </span>
                            <div style={{ fontSize: 12, color: "var(--navy-900)", marginTop: 3, fontWeight: 700 }}>
                              {freeSpots} / {zone.totalSpots} {lang === "hi" ? "खाली" : "free"}
                            </div>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: statusColor,
                                borderRadius: 3,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, minWidth: 45, textAlign: "right" }}>
                            {pct}% full
                          </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${zone.lat},${zone.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 11.5,
                              fontWeight: 600,
                              color: "var(--navy-800)",
                              background: "#f1f5f9",
                              padding: "3px 8px",
                              borderRadius: 6,
                              textDecoration: "none",
                              marginLeft: 4,
                            }}
                          >
                            🧭 {lang === "hi" ? "नेविगेट" : "Navigate"}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Live Traffic & Smart Parking Maps */}
          <div>
            <div className={styles.sideCard}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <h3 style={{ margin: 0 }}>
                  {mapTab === "traffic"
                    ? t("liveTrafficMapTitle", lang)
                    : t("parkingMapTitle", lang)}
                </h3>
                <span
                  className={styles.serial}
                  style={{
                    background: mapTab === "traffic" ? "#fef3c7" : "#eef7f2",
                    color: mapTab === "traffic" ? "#b45309" : "#3f7d56",
                    fontSize: 11,
                  }}
                >
                  {mapTab === "traffic"
                    ? "MODULE 2 · TRAFFIC"
                    : "MODULE 4 · PARKING"}
                </span>
              </div>

              <div className="sub" style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12 }}>
                {mapTab === "traffic"
                  ? t("liveTrafficMapSub", lang)
                  : t("parkingMapSub", lang)}
              </div>

              {/* Separated Map Toggle Tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
                <button
                  type="button"
                  className={`${styles.catBtn} ${mapTab === "traffic" ? styles.active : ""}`}
                  onClick={() => setMapTab("traffic")}
                  style={{ flex: 1, padding: "8px 6px", fontSize: 12, borderRadius: 8, border: "none", fontWeight: mapTab === "traffic" ? 700 : 500 }}
                >
                  {t("mapToggleTraffic", lang)}
                </button>
                <button
                  type="button"
                  className={`${styles.catBtn} ${mapTab === "parking" ? styles.active : ""}`}
                  onClick={() => setMapTab("parking")}
                  style={{ flex: 1, padding: "8px 6px", fontSize: 12, borderRadius: 8, border: "none", fontWeight: mapTab === "parking" ? 700 : 500 }}
                >
                  {t("mapToggleParking", lang)}
                </button>
              </div>

              {/* Map View */}
              <MapView
                trafficPoints={trafficPointsFormatted}
                parkingPoints={parkingZonesFormatted}
                policeStations={[]}
                patrolUnits={[]}
                userLocation={coords}
                height={340}
                lang={lang}
                mode={mapTab}
              />

              {/* Map Legend */}
              {mapTab === "traffic" ? (
                <div className={styles.mapCaption} style={{ flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>● {t("legendFree", lang)}</span>
                  <span style={{ color: "#f59e0b", fontWeight: 600 }}>● {t("legendModerate", lang)}</span>
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>● {t("legendHeavy", lang)}</span>
                </div>
              ) : (
                <div className={styles.mapCaption} style={{ flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>🅿️ {t("statusAvailable", lang)}</span>
                  <span style={{ color: "#d97706", fontWeight: 600 }}>🅿️ {t("statusFilling", lang)}</span>
                  <span style={{ color: "#dc2626", fontWeight: 600 }}>🅿️ {t("statusFull", lang)}</span>
                </div>
              )}

              {/* Detailed list below map */}
              {mapTab === "traffic" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {lang === "hi" ? "प्रमुख जंक्शन ट्रैफिक स्थिति" : "Key Junction Congestion Levels"}
                  </div>
                  {trafficPointsFormatted.slice(0, 6).map((p) => {
                    const statusColor =
                      p.level === "free" ? "#16a34a" : p.level === "moderate" ? "#f59e0b" : "#dc2626";
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "white",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--navy-900)" }}>
                            {lang === "hi" ? p.name : p.nameEn}
                          </div>
                        </div>
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
                          ● {p.levelLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {lang === "hi" ? "रायपुर स्मार्ट पार्किंग हब स्थिति" : "Raipur Parking Hub Availability"}
                  </div>
                  {parkingZonesFormatted.slice(0, 5).map((zone) => {
                    const freeSpots = zone.totalSpots - zone.occupiedSpots;
                    const pct = Math.round((zone.occupiedSpots / zone.totalSpots) * 100);
                    const statusLabel =
                      zone.status === "available"
                        ? t("statusAvailable", lang)
                        : zone.status === "filling"
                        ? t("statusFilling", lang)
                        : t("statusFull", lang);
                    const statusColor =
                      zone.status === "available" ? "#3f7d56" : zone.status === "filling" ? "#c98f3f" : "#b3402f";

                    return (
                      <div
                        key={zone.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: "white",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--radius)",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--navy-900)" }}>
                            {lang === "hi" ? zone.name : zone.nameEn}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 1 }}>
                            {lang === "hi" ? zone.address : zone.addressEn}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: statusColor,
                              background: `${statusColor}18`,
                              padding: "2px 7px",
                              borderRadius: 10,
                            }}
                          >
                            ● {statusLabel}
                          </span>
                          <div style={{ fontSize: 11, color: "var(--navy-900)", marginTop: 2, fontWeight: 600 }}>
                            {freeSpots} / {zone.totalSpots} free
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Emergency & Police 24x7 Helpline Card */}
            <div className={styles.sideCard} style={{ background: "#0f172a", color: "white", border: "none" }}>
              <h3 style={{ color: "#f59e0b", fontSize: 15 }}>🚨 Emergency & WhatsApp Helpdesk</h3>
              <div className="sub" style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
                Raipur Police 24x7 Direct Citizen Assistance
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a
                  href="https://wa.me/918750871493"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 12px",
                    background: "#065f46",
                    borderRadius: 8,
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>💬 WhatsApp Traffic Photo Line</div>
                    <div style={{ fontSize: 10.5, color: "#a7f3d0" }}>Photo & Video Reporting</div>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: "#34d399" }}>8750871493</span>
                </a>
                <a
                  href="tel:112"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 12px",
                    background: "#1e293b",
                    borderRadius: 8,
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>🚨 Emergency Police & Rescue</div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8" }}>National Response System</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#ef4444" }}>112</span>
                </a>
                <a
                  href="tel:1930"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 12px",
                    background: "#1e293b",
                    borderRadius: 8,
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>💻 Cyber Crime Helpline</div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8" }}>Financial Fraud Desk</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#3b82f6" }}>1930</span>
                </a>
                <a
                  href="tel:1091"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "9px 12px",
                    background: "#1e293b",
                    borderRadius: 8,
                    color: "white",
                    textDecoration: "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>👩 Women & Child Safety</div>
                    <div style={{ fontSize: 10.5, color: "#94a3b8" }}>24x7 Women Support</div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#ec4899" }}>1091</span>
                </a>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DEDICATED REPORT VIOLATION (M1) */}
      {/* ========================================================================= */}
      {activeTab === "report" && (
        <main className={styles.main}>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, color: "var(--navy-900)", margin: 0 }}>
                📝 {lang === "hi" ? "अवैध पार्किंग व यातायात उल्लंघन शिकायत (M1)" : "Report Illegal Parking & Traffic Violation (M1)"}
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>
                {lang === "hi"
                  ? "सड़क पर अवैध पार्किंग, अतिक्रमण या नो-पार्किंग में खड़े वाहनों की शिकायत फोटो व जीपीएस के साथ सीधे रायपुर ट्रैफिक पुलिस को भेजें।"
                  : "Submit real-time illegal parking or traffic obstruction reports with live GPS location & photo evidence directly to Raipur Traffic Police."}
              </p>
            </div>
          </div>

          <div>
            {success ? (
              <div className={styles.card}>
                <div className={styles.form}>
                  <div className={styles.successBox}>
                    <div>
                      <strong>{t("successTitle", lang)} {success.id}</strong>
                      {t("successBody", lang)}
                    </div>
                  </div>
                  <button
                    className={styles.submitBtn}
                    style={{ background: "var(--navy-900)", color: "white" }}
                    onClick={() => setSuccess(null)}
                  >
                    {t("submitAnother", lang)}
                  </button>
                </div>
              </div>
            ) : (
              <form className={styles.card} onSubmit={handleSubmit}>
                <div className={styles.cardHead}>
                  <div>
                    <h2>{t("formTitle", lang)}</h2>
                    <div className="sub" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                      {t("formSub", lang)}
                    </div>
                  </div>
                  <span className={styles.serial}>FORM #PKG-2026</span>
                </div>

                <div className={styles.form}>
                  <div className={styles.field}>
                    <label>
                      {t("categoryLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("categoryHint", lang)}
                      </span>
                    </label>
                    <div className={styles.categoryGrid}>
                      {CATEGORIES.map((c) => (
                        <button
                          type="button"
                          key={c.en}
                          className={`${styles.catBtn} ${category.en === c.en ? styles.active : ""}`}
                          onClick={() => setCategory(c)}
                        >
                          {c.icon} {lang === "hi" ? c.hi : c.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>
                      {t("photoLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("photoHint", lang)}
                      </span>
                    </label>
                    <label className={`${styles.dropzone} ${fileName ? styles.hasFile : ""}`}>
                      {filePreview ? (
                        <span className={styles.previewRow}>
                          <img src={filePreview} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, marginRight: 8 }} />
                          <span>✓ {fileName} {t("photoAdded", lang)}</span>
                        </span>
                      ) : (
                        t("dropzone", lang)
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setFileName(file?.name || "");
                          setFilePreview(file ? URL.createObjectURL(file) : null);
                        }}
                      />
                    </label>
                  </div>

                  <div className={styles.field}>
                    <label>
                      {t("locationLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("locationHint", lang)}
                      </span>
                    </label>
                    <div className={styles.locRow}>
                      <input
                        placeholder={t("locationPlaceholder", lang)}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.gpsBtn}
                        onClick={useMyLocation}
                        disabled={locating}
                      >
                        {locating ? (lang === "hi" ? "🛰️ खोज रहे हैं..." : "🛰️ Locating...") : t("gpsButton", lang)}
                      </button>
                    </div>

                    {gpsStatus === "success" && (
                      <div className={styles.gpsBannerSuccess}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, color: "#15803d" }}>
                            🛰️ {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                          </span>
                          <span style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>
                            ✓ {lang === "hi" ? "सत्यापित GPS" : "Verified GPS Fix"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 5, fontWeight: 600 }}>
                        {lang === "hi" ? "⚡ प्रमुख क्षेत्र चयन:" : "⚡ Quick Hubs:"}
                      </div>
                      <div className={styles.quickLocGrid}>
                        {QUICK_LOCATIONS.map((q) => (
                          <button
                            key={q.name.en}
                            type="button"
                            className={styles.quickLocBtn}
                            onClick={() => {
                              setCoords({ lat: q.lat, lng: q.lng });
                              setLocation(lang === "hi" ? q.address : q.addressEn);
                              setGpsStatus("success");
                            }}
                          >
                            📍 {lang === "hi" ? q.name.hi : q.name.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>
                      {t("descriptionLabel", lang)}{" "}
                      <span className="hint" style={{ fontWeight: 400, color: "var(--ink-soft)" }}>
                        {t("descriptionHint", lang)}
                      </span>
                    </label>
                    <textarea
                      className={styles.textarea}
                      placeholder={t("descriptionPlaceholder", lang)}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button className={styles.submitBtn} type="submit" disabled={submitting}>
                    {submitting ? t("submitting", lang) : t("submitButton", lang)}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div>
            <div className={styles.sideCard}>
              <h3>📍 {lang === "hi" ? "स्थान व लाइव ट्रैफिक मैप" : "Location & Traffic Map"}</h3>
              <div className="sub">
                {lang === "hi"
                  ? "आपकी रिपोर्ट के साथ सटीक GPS लोकेशन रायपुर ट्रैफिक पुलिस कंट्रोल को भेजी जाएगी।"
                  : "Your precise GPS fix is securely transmitted with your report to Raipur Traffic Control."}
              </div>
              <MapView
                trafficPoints={trafficPointsFormatted}
                parkingPoints={parkingZonesFormatted}
                policeStations={[]}
                patrolUnits={[]}
                userLocation={coords}
                height={320}
                lang={lang}
                mode="traffic"
              />
            </div>

            <div className={styles.sideCard} style={{ background: "#f8fafc" }}>
              <h3 style={{ fontSize: 14 }}>ℹ️ {lang === "hi" ? "सख्त कार्यवाही नियम" : "Reporting Guidelines"}</h3>
              <ul style={{ fontSize: 12.5, color: "#475569", paddingLeft: 18, margin: "8px 0 0", lineHeight: 1.6 }}>
                <li>{lang === "hi" ? "वाहन का नंबर प्लेट स्पष्ट दिखाई देना चाहिए।" : "Vehicle registration plate must be clearly visible in photo."}</li>
                <li>{lang === "hi" ? "नो-पार्किंग साइनेज या सड़क बाधा स्पष्ट होनी चाहिए।" : "No-parking signboard or road blockage should be framed."}</li>
                <li>{lang === "hi" ? "गलत या भ्रामक रिपोर्ट दर्ज करना दंडनीय अपराध है।" : "Filing misleading or fake reports is punishable under law."}</li>
              </ul>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: DEDICATED SMART PARKING FINDER (M4) */}
      {/* ========================================================================= */}
      {activeTab === "parking" && (
        <main className={styles.main}>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, color: "var(--navy-900)", margin: 0 }}>
                🅿️ {lang === "hi" ? "स्मार्ट पार्किंग हब व वाहन सर्च सिस्टम (M4)" : "Smart Parking Hubs & Universal Vehicle Search (M4)"}
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>
                {lang === "hi"
                  ? "रायपुर के सभी अधिकृत पार्किंग स्थलों में खाली स्थान खोजें, या वाहन नंबर डालकर देखें कि वह किस पार्किंग और स्लॉट में खड़ा है।"
                  : "Find real-time available parking spots across Raipur hubs, or search vehicle registration number to find exact parking location & slot."}
              </p>
            </div>
          </div>

          <div>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2>🔍 {lang === "hi" ? "वाहन व पार्किंग स्थल सर्च" : "Universal Vehicle & Area Search"}</h2>
                  <div className="sub" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                    {lang === "hi"
                      ? "वाहन नंबर (उदा. CG-04-MB-1245), क्षेत्र या मॉल का नाम दर्ज करें"
                      : "Search by vehicle number (e.g. CG-04-MB-1245), area or hub name"}
                  </div>
                </div>
                <span className={styles.serial} style={{ background: "#eef7f2", color: "#3f7d56" }}>
                  {filteredParkingZones.length} {lang === "hi" ? "पार्किंग हब" : "Hubs"}
                </span>
              </div>

              <div className={styles.form}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    style={{
                      background: "var(--navy-900)",
                      color: "white",
                      padding: "10px 16px",
                      fontSize: 13.5,
                      flex: "1 1 200px",
                    }}
                    onClick={handleFindNearest}
                    disabled={locating}
                  >
                    {locating
                      ? (lang === "hi" ? "⏳ लोकेशन जाँची जा रही है..." : "⏳ Locating your GPS...")
                      : (lang === "hi" ? "📍 मेरे पास की पार्किंग खोजें" : "📍 Find Nearest Parking")}
                  </button>

                  <input
                    type="text"
                    placeholder={lang === "hi" ? "🔍 वाहन संख्या (उदा. CG-04-MB-1245), क्षेत्र या पार्किंग स्थल..." : "🔍 Search by vehicle number (e.g. CG-04-MB-1245), area, or hub..."}
                    value={parkingSearch}
                    onChange={(e) => setParkingSearch(e.target.value)}
                    style={{
                      flex: "1 1 220px",
                      padding: "10px 14px",
                      border: "1.5px solid var(--navy-800)",
                      borderRadius: "var(--radius)",
                      fontSize: 13.5,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Matched Vehicle Card */}
                {parkingSearchResults.matchedVehicles.length > 0 && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                      border: "2px solid #3b82f6",
                      padding: "16px 18px",
                      borderRadius: "var(--radius)",
                      marginBottom: 10,
                    }}
                  >
                    {parkingSearchResults.matchedVehicles.map((v, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontWeight: 800,
                                background: "#1e3a8a",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: 6,
                                fontSize: 14,
                                letterSpacing: 0.5,
                              }}
                            >
                              🚗 {v.vehicleNumber}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>
                              {lang === "hi" ? "वाहन यहाँ पार्क है:" : "Standing at:"} {lang === "hi" ? v.zoneName : v.zoneNameEn}
                            </span>
                          </div>
                          <span style={{ fontSize: 12, background: "#dbeafe", color: "#1d4ed8", padding: "3px 10px", borderRadius: 12, fontWeight: 700 }}>
                            📍 {v.slot}
                          </span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "#334155", marginTop: 2 }}>
                          🚘 {v.model} ({v.type}) · {lang === "hi" ? "प्रवेश समय:" : "Entry:"} <strong>{v.entryTime}</strong> | 📍 {lang === "hi" ? v.zoneAddress : v.zoneAddressEn}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Parking Hubs List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
                  {filteredParkingZones.map((zone) => {
                    const freeSpots = zone.totalSpots - zone.occupiedSpots;
                    const pct = Math.round((zone.occupiedSpots / zone.totalSpots) * 100);
                    const statusLabel =
                      zone.status === "available"
                        ? t("statusAvailable", lang)
                        : zone.status === "filling"
                        ? t("statusFilling", lang)
                        : t("statusFull", lang);
                    const statusColor =
                      zone.status === "available" ? "#3f7d56" : zone.status === "filling" ? "#c98f3f" : "#b3402f";

                    return (
                      <div
                        key={zone.id}
                        style={{
                          padding: "14px 16px",
                          background: "white",
                          border: "1px solid var(--line)",
                          borderRadius: "var(--radius)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--navy-900)" }}>
                              {lang === "hi" ? zone.name : zone.nameEn}
                            </div>
                            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>
                              📍 {lang === "hi" ? zone.address : zone.addressEn} ·{" "}
                              <span style={{ color: "var(--navy-800)", fontWeight: 600 }}>{zone.distanceKm} km away</span> · {zone.type}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: statusColor,
                                background: `${statusColor}18`,
                                padding: "4px 10px",
                                borderRadius: 12,
                              }}
                            >
                              ● {statusLabel}
                            </span>
                            <div style={{ fontSize: 13, color: "var(--navy-900)", marginTop: 4, fontWeight: 700 }}>
                              {freeSpots} / {zone.totalSpots} {lang === "hi" ? "खाली स्थान" : "spots free"}
                            </div>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: statusColor,
                                borderRadius: 4,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 700, minWidth: 50, textAlign: "right" }}>
                            {pct}% full
                          </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${zone.lat},${zone.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "white",
                              background: "var(--navy-900)",
                              padding: "4px 12px",
                              borderRadius: 6,
                              textDecoration: "none",
                              marginLeft: 6,
                            }}
                          >
                            🧭 {lang === "hi" ? "नेविगेट" : "Navigate"}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className={styles.sideCard}>
              <h3>🅿️ {lang === "hi" ? "रायपुर स्मार्ट पार्किंग लाइव मानचित्र" : "Raipur Smart Parking Map"}</h3>
              <div className="sub">
                {lang === "hi"
                  ? "प्रत्येक पार्किंग स्थल की लाइव क्षमता व वास्तविक स्थिति"
                  : "Live capacity & real-time occupancy across all parking hubs"}
              </div>
              <MapView
                trafficPoints={trafficPointsFormatted}
                parkingPoints={parkingZonesFormatted}
                policeStations={[]}
                patrolUnits={[]}
                userLocation={coords}
                height={450}
                lang={lang}
                mode="parking"
              />
              <div className={styles.mapCaption} style={{ flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>🅿️ {t("statusAvailable", lang)}</span>
                <span style={{ color: "#d97706", fontWeight: 600 }}>🅿️ {t("statusFilling", lang)}</span>
                <span style={{ color: "#dc2626", fontWeight: 600 }}>🅿️ {t("statusFull", lang)}</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: DEDICATED LIVE TRAFFIC MAP & JUNCTION SYSTEM (M2) */}
      {/* ========================================================================= */}
      {activeTab === "traffic" && (
        <main className={styles.main}>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, color: "var(--navy-900)", margin: 0 }}>
                🚥 {lang === "hi" ? "रायपुर लाइव ट्रैफिक नियंत्रण व जंक्शन स्थिति (M2)" : "Raipur Live Traffic Control & Junction Status (M2)"}
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>
                {lang === "hi"
                  ? "शहर के सभी प्रमुख चौराहों एवं कॉरिडोर की लाइव ट्रैफिक गति, जाम की स्थिति एवं ट्रैफिक डायवर्जन सूचना।"
                  : "Real-time congestion levels, vehicle speeds & traffic status across all major Raipur junctions and corridors."}
              </p>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2>🗺️ {lang === "hi" ? "लाइव ट्रैफिक नियंत्रण मानचित्र" : "Live Traffic Control Map"}</h2>
                  <div className="sub" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                    {lang === "hi" ? "रायपुर ट्रैफिक पुलिस लाइव सेंसर व सीसीटीवी समन्वय" : "Raipur Police live IoT sensors & CCTV feeds"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>LIVE FEED ACTIVE</span>
                </div>
              </div>

              <div style={{ padding: 16 }}>
                <MapView
                  trafficPoints={trafficPointsFormatted}
                  parkingPoints={parkingZonesFormatted}
                  policeStations={[]}
                  patrolUnits={[]}
                  userLocation={coords}
                  height={420}
                  lang={lang}
                  mode="traffic"
                />

                <div className={styles.mapCaption} style={{ flexWrap: "wrap", gap: 16, marginTop: 14 }}>
                  <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 13 }}>● {t("legendFree", lang)} (&gt;35 km/h)</span>
                  <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>● {t("legendModerate", lang)} (15-35 km/h)</span>
                  <span style={{ color: "#dc2626", fontWeight: 700, fontSize: 13 }}>● {t("legendHeavy", lang)} (&lt;15 km/h)</span>
                </div>
              </div>
            </div>

            {/* Junction Congestion Table */}
            <div className={styles.card} style={{ marginTop: 24 }}>
              <div className={styles.cardHead}>
                <div>
                  <h2>📊 {lang === "hi" ? "रायपुर प्रमुख जंक्शन स्थिति तालिका" : "Key Raipur Junction Congestion Table"}</h2>
                  <div className="sub" style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                    {lang === "hi" ? "प्रत्येक जंक्शन की गति, जाम स्तर एवं लाइव स्थिति" : "Speed, congestion level & real-time monitoring"}
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 20px", overflowX: "auto" }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{lang === "hi" ? "जंक्शन / चौराहा" : "Junction / Intersection"}</th>
                      <th>{lang === "hi" ? "जाम स्थिति" : "Congestion"}</th>
                      <th>{lang === "hi" ? "औसत गति" : "Avg Speed"}</th>
                      <th>{lang === "hi" ? "कॉरिडोर" : "Corridor"}</th>
                      <th>{lang === "hi" ? "अंतिम अपडेट" : "Last Updated"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficPointsFormatted.map((p) => {
                      const statusColor =
                        p.level === "free" ? "#16a34a" : p.level === "moderate" ? "#f59e0b" : "#dc2626";
                      const speed = p.level === "free" ? "42 km/h" : p.level === "moderate" ? "22 km/h" : "8 km/h";

                      return (
                        <tr key={p.id}>
                          <td>
                            <strong style={{ color: "var(--navy-900)", fontSize: 13.5 }}>
                              {lang === "hi" ? p.name : p.nameEn}
                            </strong>
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: statusColor,
                                background: `${statusColor}18`,
                                padding: "3px 10px",
                                borderRadius: 12,
                              }}
                            >
                              ● {p.levelLabel}
                            </span>
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{speed}</td>
                          <td style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                            {p.id === "jaistambh"
                              ? "GE Road / Gol Bazar"
                              : p.id === "telibandha"
                              ? "VIP Road / Marine Drive"
                              : p.id === "tatibandh"
                              ? "NH-53 AIIMS Corridor"
                              : "City Center Corridor"}
                          </td>
                          <td style={{ fontSize: 11.5, color: "#64748b" }}>Live</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Citizen Service Modals (Accessible via Navbar Click & Quick Chips) */}
      <EChallanModal isOpen={isChallanModalOpen} onClose={() => setIsChallanModalOpen(false)} lang={lang} />
      <ELostReportModal isOpen={isELostModalOpen} onClose={() => setIsELostModalOpen(false)} lang={lang} />
      <FineRatesModal isOpen={isFineModalOpen} onClose={() => setIsFineModalOpen(false)} lang={lang} />
      <SpeedLimitModal isOpen={isSpeedModalOpen} onClose={() => setIsSpeedModalOpen(false)} lang={lang} />
      <TaxiComplaintModal isOpen={isTaxiModalOpen} onClose={() => setIsTaxiModalOpen(false)} lang={lang} />
      <VehicleNocModal isOpen={isNocModalOpen} onClose={() => setIsNocModalOpen(false)} lang={lang} />

      <SiteFooter lang={lang} />
    </div>
  );
}

export default function PublicPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Citizen Portal...</div>}>
      <CitizenPortalContent />
    </Suspense>
  );
}