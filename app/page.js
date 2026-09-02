"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar";
import { t } from "@/lib/i18n";
import { PARKING_ZONES, findNearestParking, getOccupancyStatus, calculateDistance } from "@/lib/parkingData";
import { TRAFFIC_POINTS } from "@/lib/trafficData";
import { findNearestPoliceStation } from "@/lib/policeStations";
import TrafficAdvisoryTicker from "@/components/TrafficAdvisoryTicker";
import EChallanModal from "@/components/EChallanModal";
import ELostReportModal from "@/components/ELostReportModal";
import FineRatesModal from "@/components/FineRatesModal";
import SpeedLimitModal from "@/components/SpeedLimitModal";
import TaxiComplaintModal from "@/components/TaxiComplaintModal";
import VehicleNocModal from "@/components/VehicleNocModal";

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

export default function PublicPage() {
  const [lang, setLang] = useState("en");
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ lat: 21.24368, lng: 81.63559 });
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // Module 4: Smart Parking states
  const [nearestSpot, setNearestSpot] = useState(null);
  const [parkingZones, setParkingZones] = useState(PARKING_ZONES);
  const [parkingSearch, setParkingSearch] = useState("");

  // Citizen Map tab selection ("traffic" | "parking")
  const [mapTab, setMapTab] = useState("traffic");

  // KSP & DTP Inspired Modal States
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isELostModalOpen, setIsELostModalOpen] = useState(false);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);
  const [isNocModalOpen, setIsNocModalOpen] = useState(false);

  // Module 2: Traffic states with realistic initial distribution
  const [traffic, setTraffic] = useState(() => {
    const initial = {};
    TRAFFIC_POINTS.forEach((p, idx) => {
      // Natural traffic mix: most free, some moderate, 1 heavy
      const level = idx === 0 ? "moderate" : idx === 2 ? "moderate" : idx === 3 ? "heavy" : "free";
      initial[p.id] = { level, updatedAt: Date.now() };
    });
    return initial;
  });

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

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation(
          `GPS · ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        );
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 6000 }
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

  const filteredParkingZones = useMemo(() => {
    if (!parkingSearch.trim()) return parkingZonesFormatted;
    const q = parkingSearch.toLowerCase();
    return parkingZonesFormatted.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.nameEn.toLowerCase().includes(q) ||
        z.address.toLowerCase().includes(q) ||
        z.addressEn.toLowerCase().includes(q) ||
        z.type.toLowerCase().includes(q)
    );
  }, [parkingZonesFormatted, parkingSearch]);

  const trafficPointsFormatted = useMemo(
    () =>
      TRAFFIC_POINTS.map((p) => ({
        ...p,
        level: traffic[p.id]?.level || "free",
        levelLabel: LEVEL_LABEL[traffic[p.id]?.level || "free"][lang],
      })),
    [traffic, lang]
  );

  return (
    <div className={styles.shell}>
      <Navbar lang={lang} onLangChange={setLang} onOpenServiceModal={handleOpenServiceModal} />
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

      {/* Main Grid: Clean 2-column layout */}
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
                        <strong>Emergency Dispatch Mode Active:</strong> Nearest Police Station (
                        <strong>
                          {lang === "hi"
                            ? findNearestPoliceStation(coords.lat, coords.lng).name
                            : findNearestPoliceStation(coords.lat, coords.lng).nameEn}
                        </strong>
                        ) will receive instant audio & visual siren alert.
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
                        <img src={filePreview} alt="" className={styles.previewThumb} />
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
                    <button type="button" className={styles.gpsBtn} onClick={useMyLocation}>
                      {locating ? t("locating", lang) : t("gpsButton", lang)}
                    </button>
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
                  placeholder={lang === "hi" ? "🔍 क्षेत्र या पार्किंग का नाम खोजें..." : "🔍 Search by area or parking hub..."}
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
                {mapTab === "traffic" ? t("liveTrafficMapTitle", lang) : t("parkingMapTitle", lang)}
              </h3>
              <span
                className={styles.serial}
                style={{
                  background: mapTab === "traffic" ? "#fef3c7" : "#eef7f2",
                  color: mapTab === "traffic" ? "#b45309" : "#3f7d56",
                  fontSize: 11,
                }}
              >
                {mapTab === "traffic" ? "MODULE 2 · TRAFFIC" : "MODULE 4 · PARKING"}
              </span>
            </div>

            <div className="sub" style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12 }}>
              {mapTab === "traffic" ? t("liveTrafficMapSub", lang) : t("parkingMapSub", lang)}
            </div>

            {/* Separated Map Toggle Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#f1f5f9", padding: 4, borderRadius: 10 }}>
              <button
                type="button"
                className={`${styles.catBtn} ${mapTab === "traffic" ? styles.active : ""}`}
                onClick={() => setMapTab("traffic")}
                style={{ flex: 1, padding: "8px 10px", fontSize: 13, borderRadius: 8, border: "none", fontWeight: mapTab === "traffic" ? 700 : 500 }}
              >
                {t("mapToggleTraffic", lang)}
              </button>
              <button
                type="button"
                className={`${styles.catBtn} ${mapTab === "parking" ? styles.active : ""}`}
                onClick={() => setMapTab("parking")}
                style={{ flex: 1, padding: "8px 10px", fontSize: 13, borderRadius: 8, border: "none", fontWeight: mapTab === "parking" ? 700 : 500 }}
              >
                {t("mapToggleParking", lang)}
              </button>
            </div>

            {/* Map View */}
            <MapView
              trafficPoints={trafficPointsFormatted}
              parkingPoints={parkingZonesFormatted}
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

      {/* Citizen Service Modals (Accessible via Navbar Click & Quick Chips) */}
      <EChallanModal isOpen={isChallanModalOpen} onClose={() => setIsChallanModalOpen(false)} lang={lang} />
      <ELostReportModal isOpen={isELostModalOpen} onClose={() => setIsELostModalOpen(false)} lang={lang} />
      <FineRatesModal isOpen={isFineModalOpen} onClose={() => setIsFineModalOpen(false)} lang={lang} />
      <SpeedLimitModal isOpen={isSpeedModalOpen} onClose={() => setIsSpeedModalOpen(false)} lang={lang} />
      <TaxiComplaintModal isOpen={isTaxiModalOpen} onClose={() => setIsTaxiModalOpen(false)} lang={lang} />
      <VehicleNocModal isOpen={isNocModalOpen} onClose={() => setIsNocModalOpen(false)} lang={lang} />

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerBrand}>
              <div className={styles.crestSm}>रा</div>
              <span>Raipur Police (Chhattisgarh)</span>
            </div>
            <div className={styles.footerList}>
              {t("footerTagline", lang)}<br />
              {t("footerSubmission", lang)}
            </div>
          </div>
          <div>
            <h4>{t("quickLink", lang)}</h4>
            <div className={styles.footerList}>
              {t("quickLinkList", lang).split("\n").map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
          </div>
          <div>
            <h4>{t("jurisdiction", lang)}</h4>
            <div className={styles.footerList}>
              {t("jurisdictionList", lang).split("\n").map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>{t("footerCopy", lang)}</span>
          <span>{t("footerNote", lang)}</span>
        </div>
      </footer>
    </div>
  );
}