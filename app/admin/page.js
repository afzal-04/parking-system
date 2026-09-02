"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "./admin.module.css";
import Navbar from "@/components/Navbar";
import { TRAFFIC_POINTS } from "@/lib/trafficData";
import { PARKING_ZONES, getOccupancyStatus } from "@/lib/parkingData";
import { findNearestPoliceStation } from "@/lib/policeStations";
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

export default function AdminPage() {
  const [lang, setLang] = useState("en");
  const [activeTab, setActiveTab] = useState("all"); // "all", "complaints", "traffic", "parking"
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dispatchedStationIds, setDispatchedStationIds] = useState([]);

  const [traffic, setTraffic] = useState(() =>
    Object.fromEntries(TRAFFIC_POINTS.map((p) => [p.id, { level: "free", updatedAt: Date.now() }]))
  );
  const [alerts, setAlerts] = useState([]);

  // Voice alert synthesizer helper
  function speakVoiceAlert(text) {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel(); // cancel ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis error:", e);
    }
  }

  // Module 4: Parking zones state with simulated live feed
  const [parkingZones, setParkingZones] = useState(PARKING_ZONES);

  useEffect(() => {
    fetch("/api/complaints")
      .then((r) => r.json())
      .then((d) => setComplaints(d.complaints || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
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
          // Randomly adjust occupancy by -3 to +4 spots for 30% of zones
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

  function handleManualOccupancyChange(zoneId, newOccupied) {
    setParkingZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, occupiedSpots: Math.max(0, Math.min(z.totalSpots, newOccupied)) } : z))
    );
  }

  function handleDeploy(alertId, junctionId) {
    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dispatched: true } : a)));
    setTraffic((prev) => ({ ...prev, [junctionId]: { level: "moderate", updatedAt: Date.now() } }));
  }

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

  const MODULE_TABS = [
    ["all", t("filterAll", lang)],
    ["complaints", t("tabComplaints", lang)],
    ["traffic", t("tabTraffic", lang)],
    ["parking", t("tabParking", lang)],
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
        c.status !== "resolved"
    );
  }, [complaints]);

  useEffect(() => {
    if (emergencyComplaints.length > 0 && soundEnabled) {
      const topEmergency = emergencyComplaints[0];
      const station = topEmergency.nearestStation || findNearestPoliceStation(topEmergency.lat, topEmergency.lng);
      speakVoiceAlert(
        `Emergency Alert! Road accident reported near ${topEmergency.location}. Nearest station ${station.nameEn} notified for instant dispatch.`
      );
    }
  }, [emergencyComplaints.length, soundEnabled]);

  function handleDispatchStationTeam(complaintId) {
    setDispatchedStationIds((prev) => [...prev, complaintId]);
    handleStatusChange(complaintId, "in_progress");
  }

  return (
    <div className={styles.shell}>
      <Navbar lang={lang} onLangChange={setLang} />

      <main className={styles.main}>
        {/* High Priority Emergency Accident Banner */}
        {emergencyComplaints.map((c) => {
          const station = c.nearestStation || findNearestPoliceStation(c.lat, c.lng);
          const isDispatched = dispatchedStationIds.includes(c.id) || c.status === "in_progress";

          return (
            <div className={styles.emergencyAlertBanner} key={`emergency-${c.id}`}>
              <span style={{ fontSize: 24 }}>🚨</span>
              <div style={{ flex: 1 }}>
                <div className={styles.emergencyTitle}>
                  {t("emergencyAlertTitle", lang)} — {c.location}
                </div>
                <div className={styles.emergencyDesc}>
                  <strong>{c.category} ({c.id}):</strong> {c.description}
                  <br />
                  <strong>📍 {t("nearestStationLabel", lang)}:</strong>{" "}
                  <span style={{ fontWeight: 700, color: "#991b1b" }}>
                    {lang === "hi" ? station.name : station.nameEn}
                  </span>{" "}
                  ({station.distanceKm} km away) · 📞 Phone: <strong>{station.phone}</strong> · In-Charge: {station.inCharge}
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
              >
                {isDispatched ? t("dispatchedSuccess", lang) : t("dispatchStationTeam", lang)}
              </button>
            </div>
          );
        })}

        {activeAlerts.map((a) => (
          <div className={styles.alertBanner} key={a.id}>
            <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"var(--signal-red)"}} />
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
        <div className={styles.filterRow} style={{ marginBottom: 20 }}>
          {MODULE_TABS.map(([key, label]) => (
            <button
              key={key}
              className={`${styles.filterBtn} ${activeTab === key ? styles.active : ""}`}
              onClick={() => setActiveTab(key)}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.statRow}>
          <div className={styles.statCard}>
            <div className="lbl" style={{fontSize:12,color:"var(--ink-soft)",fontWeight:600}}>{t("statTotalComplaints", lang)}</div>
            <div className="val" style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:700,color:"var(--navy-900)",marginTop:6}}>{loading ? "…" : stats.total}</div>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className="lbl" style={{fontSize:12,color:"var(--ink-soft)",fontWeight:600}}>{t("statPendingAdmin", lang)}</div>
            <div className="val" style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:700,color:"var(--signal-red)",marginTop:6}}>{loading ? "…" : stats.pending}</div>
          </div>
          <div className={`${styles.statCard} ${styles.progress}`}>
            <div className="lbl" style={{fontSize:12,color:"var(--ink-soft)",fontWeight:600}}>{t("statInProgress", lang)}</div>
            <div className="val" style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:700,color:"var(--amber-deep)",marginTop:6}}>{loading ? "…" : stats.inProgress}</div>
          </div>
          <div className={`${styles.statCard} ${styles.resolved}`}>
            <div className="lbl" style={{fontSize:12,color:"var(--ink-soft)",fontWeight:600}}>{t("overallOccupancy", lang)}</div>
            <div className="val" style={{fontFamily:"var(--font-display)",fontSize:32,fontWeight:700,color: parkingStats.pct > 80 ? "var(--signal-red)" : "var(--signal-green)",marginTop:6}}>
              {parkingStats.pct}%
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
              {parkingStats.totalFree} / {parkingStats.totalCapacity} spots free
            </div>
          </div>
        </div>

        {/* Module 4 Dedicated Section if selected or All view */}
        {(activeTab === "all" || activeTab === "parking") && (
          <div className={styles.panel} style={{ border: "2px solid #3f7d56", marginBottom: 24 }}>
            <div className={styles.panelHead}>
              <div className={styles.liveHead}>
                <h3>🅿️ {t("tabParking", lang)}</h3>
                <span className={styles.liveTag} style={{ background: "#eef7f2", color: "#3f7d56" }}>
                  {t("simulatedFeedBadge", lang)}
                </span>
              </div>
              <span className="sub" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {parkingZones.length} {t("parkingZonesCount", lang)} · {parkingStats.totalOccupied} / {parkingStats.totalCapacity} Occupied ({parkingStats.pct}%)
              </span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--navy-900)", marginBottom: 6 }}>
                {t("overallOccupancy", lang)} ({parkingStats.pct}% filled)
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

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Zone Name</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Occupied / Free</th>
                  <th>Status</th>
                  <th>{t("manualOverride", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {parkingPointsFormatted.map((p) => {
                  const free = p.totalSpots - p.occupiedSpots;
                  const pct = Math.round((p.occupiedSpots / p.totalSpots) * 100);
                  const statusColor = p.status === "available" ? "var(--signal-green)" : p.status === "filling" ? "var(--amber-deep)" : "var(--signal-red)";

                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{lang === "hi" ? p.name : p.nameEn}</strong>
                        <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{lang === "hi" ? p.address : p.addressEn}</div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--ink-soft)" }}>{p.type}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{p.totalSpots}</td>
                      <td>
                        <strong>{p.occupiedSpots}</strong> occupied / <span style={{ color: "var(--signal-green)", fontWeight: 600 }}>{free} free</span> ({pct}%)
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
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="number"
                            min="0"
                            max={p.totalSpots}
                            value={p.occupiedSpots}
                            onChange={(e) => handleManualOccupancyChange(p.id, parseInt(e.target.value) || 0)}
                            style={{
                              width: 65,
                              padding: "3px 6px",
                              fontSize: 12,
                              border: "1px solid var(--line-strong)",
                              borderRadius: 4,
                            }}
                          />
                          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>/ {p.totalSpots}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.grid}>
          <div>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>{t("liveMapTitle", lang)}</h3>
                <span className="sub" style={{fontSize:12,color:"var(--ink-soft)"}}>{complaints.length} complaints · {TRAFFIC_POINTS.length} {t("junctionsLabel", lang)}</span>
              </div>
              <MapView
                complaints={complaints}
                trafficPoints={trafficPoints}
                parkingPoints={parkingPointsFormatted}
                height={340}
                onSelect={setSelectedId}
                selectedId={selectedId}
                lang={lang}
              />
              <div style={{display:"flex",gap:14,marginTop:10,fontSize:11.5,color:"var(--ink-soft)",flexWrap:"wrap"}}>
                <span>{t("legendComplaint", lang)}</span>
                <span style={{color:"var(--signal-green)"}}>{t("legendFree", lang)}</span>
                <span style={{color:"var(--amber-deep)"}}>{t("legendModerate", lang)}</span>
                <span style={{color:"var(--signal-red)"}}>{t("legendHeavy", lang)}</span>
                <span>🅿️ {t("tabParking", lang)}</span>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <h3>{t("complaintListTitle", lang)}</h3>
                <span className="sub" style={{fontSize:12,color:"var(--ink-soft)"}}>Complaint log</span>
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
                      <td className={styles.rowId}>{c.id}</td>
                      <td>{c.location}</td>
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
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <div className={styles.liveHead}>
                  <h3>{t("liveTrafficTitle", lang)}</h3>
                  <span className={styles.liveTag}>● LIVE</span>
                </div>
                <span className="sub" style={{fontSize:12,color:"var(--ink-soft)"}}>{TRAFFIC_POINTS.length} {t("junctionsLabel", lang)}</span>
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
                <span className="sub" style={{fontSize:12,color:"var(--ink-soft)"}}>{t("topZonesSub", lang)}</span>
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
                <span className="sub" style={{fontSize:12,color:"var(--ink-soft)"}}>{t("recoSub", lang)}</span>
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
      </main>
    </div>
  );
}