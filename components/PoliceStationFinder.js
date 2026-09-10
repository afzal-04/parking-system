"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import styles from "./PoliceStationFinder.module.css";
import {
  POLICE_STATIONS,
  PATROL_UNITS,
  calculateDistance,
} from "@/lib/policeStations";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function PoliceStationFinder({
  lang = "hi",
  initialCoords = { lat: 21.2460, lng: 81.6360 },
}) {
  const [userCoords, setUserCoords] = useState(initialCoords);
  const [hasUserGps, setHasUserGps] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "stations" | "patrols"
  const [selectedId, setSelectedId] = useState(null);

  // Trigger GPS Geolocation
  function handleLocateMe() {
    if (!navigator.geolocation) {
      alert(lang === "hi" ? "आपके ब्राउज़र में GPS उपलब्ध नहीं है।" : "GPS is not supported in your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasUserGps(true);
        setLocating(false);
      },
      (err) => {
        console.warn("GPS Error:", err);
        setLocating(false);
        // Fallback to Raipur center
        setUserCoords({ lat: 21.24368, lng: 81.63559 });
        setHasUserGps(true);
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  }

  // Calculate distances for police stations
  const stationsWithDistance = useMemo(() => {
    return POLICE_STATIONS.map((stn) => {
      const dist = calculateDistance(userCoords.lat, userCoords.lng, stn.lat, stn.lng);
      return {
        ...stn,
        distanceKm: dist.toFixed(2),
        distanceNum: dist,
      };
    }).sort((a, b) => a.distanceNum - b.distanceNum);
  }, [userCoords]);

  // Calculate distances for patrol units
  const patrolsWithDistance = useMemo(() => {
    return PATROL_UNITS.map((p) => {
      const dist = calculateDistance(userCoords.lat, userCoords.lng, p.lat, p.lng);
      return {
        ...p,
        distanceKm: dist.toFixed(2),
        distanceNum: dist,
      };
    }).sort((a, b) => a.distanceNum - b.distanceNum);
  }, [userCoords]);

  // Nearest station and patrol
  const nearestStation = stationsWithDistance[0];
  const nearestPatrol = patrolsWithDistance[0];

  // Combined and filtered list for Table Data
  const filteredData = useMemo(() => {
    let combined = [];

    if (typeFilter === "all" || typeFilter === "stations") {
      combined = [...combined, ...stationsWithDistance];
    }
    if (typeFilter === "all" || typeFilter === "patrols") {
      combined = [...combined, ...patrolsWithDistance];
    }

    // Sort by proximity
    combined.sort((a, b) => a.distanceNum - b.distanceNum);

    // Apply search query
    if (!searchTerm.trim()) return combined;

    const term = searchTerm.toLowerCase();
    return combined.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const nameEn = (item.nameEn || "").toLowerCase();
      const juris = (item.jurisdiction || item.sector || "").toLowerCase();
      const jurisEn = (item.jurisdictionEn || item.sectorEn || "").toLowerCase();
      const officer = (item.inCharge || item.officer || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      return (
        name.includes(term) ||
        nameEn.includes(term) ||
        juris.includes(term) ||
        jurisEn.includes(term) ||
        officer.includes(term) ||
        code.includes(term)
      );
    });
  }, [stationsWithDistance, patrolsWithDistance, typeFilter, searchTerm]);

  return (
    <section className={styles.container} id="police-station-finder">
      {/* Section Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>
            <span>🚔</span>
            {lang === "hi"
              ? "निकटतम पुलिस थाना एवं गश्ती दल दर्शिका"
              : "Find Nearby Police Station & Patrolling Units"}
          </h2>
          <p>
            {lang === "hi"
              ? "जीपीएस द्वारा अपने नजदीकी पुलिस थाने व लाइव पेट्रोलिंग पीसीआर वैन का पता लगाएँ, मैप देखें और कॉल करें।"
              : "Locate closest police stations and active PCR patrol vans with real-time GPS distance, map & contacts."}
          </p>
        </div>
        <span className={styles.badge}>
          {lang === "hi" ? "रायपुर पुलिस · 24x7 सेवा" : "RAIPUR POLICE · 24x7 ASSISTANCE"}
        </span>
      </div>

      {/* Control Buttons & Search Filters */}
      <div className={styles.controlsRow}>
        <button
          type="button"
          className={styles.gpsBtn}
          onClick={handleLocateMe}
          disabled={locating}
        >
          {locating ? (
            <>⏳ {lang === "hi" ? "स्थान खोज रहे हैं..." : "Locating GPS..."}</>
          ) : (
            <>📍 {lang === "hi" ? "मेरे निकटतम थाना व पेट्रोलिंग खोजें" : "Find Nearest Station & Patrol"}</>
          )}
        </button>

        <input
          type="text"
          className={styles.searchInput}
          placeholder={
            lang === "hi"
              ? "🔍 थाना, गश्त क्षेत्र, अधिकारी, पीसीआर कोड खोजें..."
              : "🔍 Search station, sector, officer, or PCR code..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterBtn} ${typeFilter === "all" ? styles.filterBtnActive : ""}`}
            onClick={() => setTypeFilter("all")}
          >
            {lang === "hi" ? "सभी (16)" : "All (16)"}
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${typeFilter === "stations" ? styles.filterBtnActive : ""}`}
            onClick={() => setTypeFilter("stations")}
          >
            🏢 {lang === "hi" ? "थाने (8)" : "Stations (8)"}
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${typeFilter === "patrols" ? styles.filterBtnActive : ""}`}
            onClick={() => setTypeFilter("patrols")}
          >
            🚔 {lang === "hi" ? "पेट्रोलिंग (8)" : "Patrols (8)"}
          </button>
        </div>
      </div>

      {/* Nearest Station & Nearest Patrol Highlight Cards */}
      <div className={styles.nearestGrid}>
        {nearestStation && (
          <div className={`${styles.nearestCard} ${styles.nearestStationCard}`}>
            <div className={styles.nearestCardHeader}>
              <span className={`${styles.nearestTag} ${styles.stationTag}`}>
                🎯 {lang === "hi" ? "निकटतम पुलिस थाना" : "Nearest Police Station"}
              </span>
              <span className={styles.nearestDistBadge}>
                📏 {nearestStation.distanceKm} km {lang === "hi" ? "दूरी" : "away"}
              </span>
            </div>
            <div className={styles.nearestName}>
              🏢 {lang === "hi" ? nearestStation.name : nearestStation.nameEn}
            </div>
            <div className={styles.nearestSubtitle}>
              📍 {lang === "hi" ? nearestStation.address : nearestStation.addressEn}
            </div>
            <div className={styles.nearestDetails}>
              <div>
                👤 <strong>{lang === "hi" ? nearestStation.inChargeRankHi : nearestStation.inChargeRank}:</strong> {nearestStation.inCharge}
              </div>
              <div>
                🛡️ <strong>{lang === "hi" ? "अधिकार क्षेत्र:" : "Jurisdiction:"}</strong> {lang === "hi" ? nearestStation.jurisdiction : nearestStation.jurisdictionEn}
              </div>
              <div>
                🚓 <strong>{lang === "hi" ? "संबद्ध पेट्रोलिंग:" : "Assigned Patrol:"}</strong> {nearestStation.assignedPatrol}
              </div>
            </div>
            <div className={styles.nearestActions}>
              <a href={`tel:${nearestStation.phone}`} className={styles.actionBtnSuccess}>
                📞 {lang === "hi" ? "थाना कॉल करें" : "Call Station"} ({nearestStation.phone})
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestStation.lat},${nearestStation.lng}`}
                target="_blank"
                rel="noreferrer"
                className={styles.actionBtnPrimary}
              >
                🧭 {lang === "hi" ? "नेविगेट (Google Maps)" : "Get Directions"}
              </a>
            </div>
          </div>
        )}

        {nearestPatrol && (
          <div className={`${styles.nearestCard} ${styles.nearestPatrolCard}`}>
            <div className={styles.nearestCardHeader}>
              <span className={`${styles.nearestTag} ${styles.patrolTag}`}>
                ⚡ {lang === "hi" ? "निकटतम पेट्रोलिंग पीसीआर वैन" : "Nearest Patrolling PCR Unit"}
              </span>
              <span className={styles.nearestDistBadge}>
                📏 {nearestPatrol.distanceKm} km {lang === "hi" ? "दूरी" : "away"}
              </span>
            </div>
            <div className={styles.nearestName}>
              🚔 {lang === "hi" ? nearestPatrol.name : nearestPatrol.nameEn}
            </div>
            <div className={styles.nearestSubtitle}>
              🏢 {lang === "hi" ? nearestPatrol.stationName : nearestPatrol.stationNameEn} · {nearestPatrol.vehicleType}
            </div>
            <div className={styles.nearestDetails}>
              <div>
                🛣️ <strong>{lang === "hi" ? "सक्रिय गश्त मार्ग:" : "Patrol Sector:"}</strong> {lang === "hi" ? nearestPatrol.sector : nearestPatrol.sectorEn}
              </div>
              <div>
                👮 <strong>{lang === "hi" ? nearestPatrol.officerRankHi : nearestPatrol.officerRank}:</strong> {nearestPatrol.officer}
              </div>
              <div>
                ⚡ <strong>{lang === "hi" ? "स्थिति:" : "Status:"}</strong> ● {lang === "hi" ? nearestPatrol.statusLabel.hi : nearestPatrol.statusLabel.en} ({nearestPatrol.speed})
              </div>
            </div>
            <div className={styles.nearestActions}>
              <a href={`tel:${nearestPatrol.mobile}`} className={styles.actionBtnDanger}>
                📞 {lang === "hi" ? "पेट्रोलिंग अधिकारी को कॉल करें" : "Call Patrol Officer"} ({nearestPatrol.mobile})
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${nearestPatrol.lat},${nearestPatrol.lng}`}
                target="_blank"
                rel="noreferrer"
                className={styles.actionBtnPrimary}
              >
                🧭 {lang === "hi" ? "लाइव लोकेशन नेविगेट" : "Directions"}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className={styles.mapContainer}>
        <MapView
          policeStations={stationsWithDistance}
          patrolUnits={patrolsWithDistance}
          userLocation={hasUserGps ? userCoords : null}
          height={380}
          lang={lang}
          mode="police"
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
        />
        <div className={styles.mapLegend}>
          <span style={{ color: "#1e3a8a", fontWeight: 700 }}>
            🏢 {lang === "hi" ? "पुलिस थाना (8)" : "Police Station (8)"}
          </span>
          <span style={{ color: "#dc2626", fontWeight: 700 }}>
            🚔 {lang === "hi" ? "सक्रिय पेट्रोलिंग पीसीआर वैन (8)" : "Active Patrol PCR Van (8)"}
          </span>
          {hasUserGps && (
            <span style={{ color: "#0284c7", fontWeight: 700 }}>
              📍 {lang === "hi" ? "आपकी वर्तमान जीपीएस लोकेशन" : "Your Current GPS Location"}
            </span>
          )}
          <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 11.5 }}>
            {lang === "hi"
              ? "ℹ️ मार्कर पर क्लिक करके सीधे कॉल या दिशा-निर्देश प्राप्त करें"
              : "ℹ️ Click any marker to view officer details, call, or navigate"}
          </span>
        </div>
      </div>

      {/* Table Data View */}
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: 16, color: "var(--navy-950)", display: "flex", alignItems: "center", gap: 8 }}>
          <span>📋</span>
          {lang === "hi" ? "पुलिस थाना व पेट्रोलिंग तालिका डेटा" : "Police Stations & Patrolling Units Data Table"}
        </h3>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {lang === "hi"
            ? `कुल परिणाम: ${filteredData.length} (निकटतम क्रम में व्यवस्थित)`
            : `Showing: ${filteredData.length} units (sorted by proximity)`}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{lang === "hi" ? "प्रकार व कोड" : "Type & Code"}</th>
              <th>{lang === "hi" ? "थाना / पेट्रोलिंग नाम व क्षेत्र" : "Name & Jurisdiction / Sector"}</th>
              <th>{lang === "hi" ? "प्रभारी अधिकारी व संपर्क" : "Officer In-Charge & Contact"}</th>
              <th>{lang === "hi" ? "संबद्ध थाना / वाहन" : "Linked Station / Vehicle"}</th>
              <th>{lang === "hi" ? "दूरी (km)" : "Distance (km)"}</th>
              <th>{lang === "hi" ? "स्थिति" : "Status"}</th>
              <th>{lang === "hi" ? "त्वरित कार्रवाई" : "Quick Action"}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => {
              const isStation = item.type === "station";
              const isNearest = idx === 0;

              return (
                <tr
                  key={item.id}
                  style={{
                    background: selectedId === item.id ? "#f0f9ff" : undefined,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedId(item.id)}
                >
                  {/* Type & Code */}
                  <td>
                    {isStation ? (
                      <span className={styles.typeBadgeStation}>
                        🏢 {item.code || "PS"}
                      </span>
                    ) : (
                      <span className={styles.typeBadgePatrol}>
                        🚔 {item.code || "PCR"}
                      </span>
                    )}
                  </td>

                  {/* Name & Jurisdiction / Sector */}
                  <td>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>
                      {lang === "hi" ? item.name : item.nameEn}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                      {isStation
                        ? (lang === "hi" ? `📍 ${item.address}` : `📍 ${item.addressEn}`)
                        : (lang === "hi" ? `🛣️ गश्त: ${item.sector}` : `🛣️ Sector: ${item.sectorEn}`)}
                    </div>
                  </td>

                  {/* Officer In-Charge & Contact */}
                  <td>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>
                      {isStation ? item.inCharge : item.officer}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>
                      {isStation
                        ? (lang === "hi" ? item.inChargeRankHi : item.inChargeRank)
                        : (lang === "hi" ? item.officerRankHi : item.officerRank)}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      <a
                        href={`tel:${isStation ? item.phone : item.mobile}`}
                        style={{ color: "#1e40af", fontWeight: 700, fontSize: 12 }}
                      >
                        📞 {isStation ? item.phone : item.mobile}
                      </a>
                    </div>
                  </td>

                  {/* Linked Station / Vehicle */}
                  <td>
                    {isStation ? (
                      <div style={{ fontSize: 12, color: "#475569" }}>
                        🚓 <strong>{item.assignedPatrol}</strong>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a8a" }}>
                          🏢 {lang === "hi" ? item.stationName : item.stationNameEn}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          {item.vehicleType}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Distance */}
                  <td>
                    <div className={styles.distCell}>
                      <span>{item.distanceKm} km</span>
                      {isNearest && (
                        <span className={styles.nearestBadge}>
                          🎯 {lang === "hi" ? "निकटतम" : "Nearest"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    {isStation ? (
                      <span className={styles.statusPillOpen}>
                        ● {lang === "hi" ? "24x7 खुला" : "24x7 Active"}
                      </span>
                    ) : (
                      <span className={styles.statusPillActive}>
                        ● {lang === "hi" ? "सक्रिय गश्त" : "Active Patrol"}
                      </span>
                    )}
                  </td>

                  {/* Quick Action Buttons */}
                  <td>
                    <div className={styles.actionCell}>
                      <a
                        href={`tel:${isStation ? item.phone : item.mobile}`}
                        className={isStation ? styles.actionBtnSuccess : styles.actionBtnDanger}
                        style={{ padding: "4px 8px", fontSize: 11 }}
                      >
                        📞 {lang === "hi" ? "कॉल" : "Call"}
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.actionBtnPrimary}
                        style={{ padding: "4px 8px", fontSize: 11 }}
                      >
                        🧭 {lang === "hi" ? "दिशा" : "Maps"}
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Emergency Helplines Ribbon */}
      <div className={styles.emergencyBanner}>
        <div className={styles.emergencyBannerText}>
          <h4>🚨 {lang === "hi" ? "आपातकालीन हेल्पलाइन एवं नियंत्रण कक्ष" : "24x7 Raipur Emergency & Control Room"}</h4>
          <p>
            {lang === "hi"
              ? "किसी भी गंभीर आपातकाल या दुर्घटना की स्थिति में तुरंत डायल करें।"
              : "Dial immediately for urgent accident response, crime reporting, or police dispatch."}
          </p>
        </div>
        <div className={styles.emergencyPills}>
          <a href="tel:112" className={styles.emergencyPill}>
            🚨 112 (राष्ट्रीय आपातकाल / All Emergency)
          </a>
          <a href="tel:07714287199" className={styles.emergencyPill}>
            🚓 0771-4287199 (पुलिस नियंत्रण कक्ष)
          </a>
          <a href="https://wa.me/918750871493" target="_blank" rel="noreferrer" className={styles.emergencyPill}>
            💬 8750871493 (व्हाट्सएप ट्रैफिक)
          </a>
          <a href="tel:1930" className={styles.emergencyPill}>
            🛡️ 1930 (साइबर हेल्पलाइन)
          </a>
        </div>
      </div>
    </section>
  );
}
