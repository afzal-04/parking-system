"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { t } from "@/lib/i18n";

export default function Navbar({
  lang = "en",
  onLangChange,
  onOpenServiceModal,
  activeAdminTab = "overview",
  onAdminTabChange,
  activeCitizenTab = "overview",
  onCitizenTabChange,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isCitizenDropdownOpen, setIsCitizenDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);
  const citizenDropdownRef = useRef(null);

  const isAdminPage = pathname.startsWith("/admin");
  const isCitizenPage = pathname === "/";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
      if (citizenDropdownRef.current && !citizenDropdownRef.current.contains(event.target)) {
        setIsCitizenDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const CITIZEN_NAV_MODULES = [
    {
      key: "overview",
      icon: "📊",
      label: lang === "hi" ? "मुख्य पोर्टल (डैशबोर्ड)" : "Citizen Dashboard (Overview)",
      desc: lang === "hi" ? "शिकायत, पार्किंग व ट्रैफिक लाइव मैप" : "Complaints, parking & traffic overview",
    },
    {
      key: "report",
      icon: "📝",
      label: lang === "hi" ? "शिकायत दर्ज करें (M1)" : "Report Violation (M1)",
      desc: lang === "hi" ? "फोटो व GPS के साथ अवैध पार्किंग रिपोर्ट" : "Citizen photo + GPS violation report",
    },
    {
      key: "parking",
      icon: "🅿️",
      label: lang === "hi" ? "स्मार्ट पार्किंग खोजें (M4)" : "Find Parking Near You (M4)",
      desc: lang === "hi" ? "लाइव खाली स्थान, वाहन सर्च व मैप" : "Live spot capacity, vehicle & area search",
    },
    {
      key: "traffic",
      icon: "🚥",
      label: lang === "hi" ? "लाइव ट्रैफिक मानचित्र (M2)" : "Live Traffic Map (M2)",
      desc: lang === "hi" ? "रायपुर जंक्शन ट्रैफिक जाम स्थिति" : "Live junction congestion status",
    },
    {
      key: "police",
      icon: "🏢",
      label: lang === "hi" ? "थाना व गश्त निर्देशिका (M5)" : "Police Stations & Patrol (M5)",
      desc: lang === "hi" ? "24x7 थाना संपर्क व नजदीकी पीसीआर" : "Closest stations, PCRs & SHOs",
    },
  ];

  const CITIZEN_SERVICES = [
    {
      key: "challan",
      icon: "💳",
      label: lang === "hi" ? "इ-चालान सर्च व भुगतान" : "e-Challan Search & Pay",
      desc: lang === "hi" ? "वाहन नंबर से चालान व जुर्माना भरें" : "Check pending fines & pay via UPI",
    },
    {
      key: "elost",
      icon: "📁",
      label: lang === "hi" ? "डिजिटल इ-लॉस्ट रिपोर्ट" : "e-Lost Article Report",
      desc: lang === "hi" ? "खोए डीएल/आरसी/फोन की रिपोर्ट दर्ज करें" : "Instant digital receipt for lost items",
    },
    {
      key: "fines",
      icon: "📜",
      label: lang === "hi" ? "जुर्माना दर तालिका (MVA)" : "Traffic Fine Rates (MVA)",
      desc: lang === "hi" ? "मोटर वाहन अधिनियम 2026 पेनल्टी चार्ट" : "Statutory fine amounts & section guide",
    },
    {
      key: "speed",
      icon: "🏎️",
      label: lang === "hi" ? "शहर गति सीमा नियम" : "City Speed Limit Matrix",
      desc: lang === "hi" ? "सड़कवार कार/बाइक/ट्रक स्पीड लिमिट" : "Official road speed limits & safety rules",
    },
    {
      key: "taxi",
      icon: "🛺",
      label: lang === "hi" ? "ऑटो / टैक्सि शिकायत" : "TSR / Taxi Refusal Complaint",
      desc: lang === "hi" ? "अधिक किराया या मनाही पर पुलिस शिकायत" : "Report cab/auto driver refusal or excess fare",
    },
    {
      key: "noc",
      icon: "📄",
      label: lang === "hi" ? "ट्रैफिक एनओसी (NOC)" : "Traffic NOC Clearance",
      desc: lang === "hi" ? "वाहन ट्रांसफर हेतु शून्य चालान एनओसी" : "Verify zero-challan clearance certificate",
    },
  ];

  const ADMIN_MODULES = [
    {
      key: "overview",
      icon: "📊",
      label: lang === "hi" ? "मुख्य डैशबोर्ड (ट्रैफिक व शिकायतें)" : "Main Dashboard (Traffic & Complaints)",
      desc: lang === "hi" ? "लाइव ट्रैफिक मैप व शिकायत लॉग" : "Live Traffic Map & Complaint Log",
    },
    {
      key: "complaints",
      icon: "📝",
      label: lang === "hi" ? "शिकायत रिपोर्ट व मैप (M1)" : "Complaint Reports & Map (M1)",
      desc: lang === "hi" ? "नागरिक शिकायतों की तालिका व स्थान मैप" : "Complaints table & location map",
    },
    {
      key: "traffic",
      icon: "🚥",
      label: lang === "hi" ? "लाइव ट्रैफिक कंट्रोल (M2)" : "Live Traffic Control & Map (M2)",
      desc: lang === "hi" ? "जंक्शन व सड़क कॉरिडोर लाइव स्थिति" : "Junctions, corridors & speed table",
    },
    {
      key: "parking",
      icon: "🅿️",
      label: lang === "hi" ? "स्मार्ट पार्किंग सिस्टम (M4)" : "Smart Parking System (M4)",
      desc: lang === "hi" ? "पार्किंग हब क्षमता व लाइव मैप" : "Parking hubs capacity & live map",
    },
    {
      key: "stations",
      icon: "🏢",
      label: lang === "hi" ? "पंजीकृत पुलिस थाने" : "Registered Police Stations",
      desc: lang === "hi" ? "थाना निर्देशिका, SHO संपर्क व मैप" : "Station directory, SHO & map",
    },
    {
      key: "patrol",
      icon: "🚔",
      label: lang === "hi" ? "लाइव पेट्रोलिंग पुलिस गश्त (M5)" : "Live Patrol Police Fleet (M5)",
      desc: lang === "hi" ? "क्षेत्रवार गश्त वाहन ट्रैकर व अलर्ट" : "Area-wise patrol fleet & dispatch",
    },
  ];

  function handleCitizenModuleClick(moduleKey) {
    setIsDropdownOpen(false);
    if (onCitizenTabChange) {
      onCitizenTabChange(moduleKey);
    } else {
      router.push(`/?tab=${moduleKey}`);
    }
  }

  function handleServiceClick(serviceKey) {
    setIsDropdownOpen(false);
    if (onOpenServiceModal) {
      onOpenServiceModal(serviceKey);
    } else {
      router.push(`/?service=${serviceKey}`);
    }
  }

  function handleAdminModuleClick(moduleKey) {
    setIsAdminDropdownOpen(false);
    if (onAdminTabChange) {
      onAdminTabChange(moduleKey);
    } else {
      router.push(`/admin?tab=${moduleKey}`);
    }
  }

  const NAV_ITEMS = [
    {
      path: "/",
      label: t("navCitizenPortal", lang),
      icon: "🏠",
    },
    {
      path: "/admin",
      label: t("navPoliceAdmin", lang),
      icon: "🛡️",
    },
    {
      path: "/tech-functionality",
      label: t("navTechFunc", lang),
      icon: "⚡",
    },
  ];

  return (
    <>
      <div className={styles.utilityBar}>
        <div className={styles.utilityRow}>
          <span className={styles.skip}>Raipur Police Commissionerate · Traffic Hackathon 2026</span>
          <span>A A A</span>
          <select
            className={styles.langSelect}
            value={lang === "hi" ? "HIN" : "ENG"}
            onChange={(e) => onLangChange && onLangChange(e.target.value === "HIN" ? "hi" : "en")}
          >
            <option value="ENG">ENG</option>
            <option value="HIN">हिं</option>
          </select>
        </div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerRow}>
          <Link href="/" className={styles.brand}>
            <div className={styles.crest}>रा</div>
            <div className={styles.brandText}>
              <h1>{t("brandTitle", lang)}</h1>
              <p>Raipur Police Commissionerate · Traffic Wing</p>
            </div>
          </Link>

          <nav className={styles.navLinks}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Citizen Modules Navigation Dropdown */}
            <div className={styles.dropdown} ref={citizenDropdownRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${isCitizenDropdownOpen ? styles.open : ""}`}
                onClick={() => setIsCitizenDropdownOpen((prev) => !prev)}
                style={{
                  background: isCitizenPage ? "rgba(238, 242, 255, 0.95)" : "transparent",
                  color: isCitizenPage ? "#1e3a8a" : "inherit",
                  fontWeight: 700,
                  borderColor: isCitizenPage ? "#93c5fd" : "var(--line)",
                }}
              >
                <span>🏛️ {lang === "hi" ? "नागरिक मॉड्यूल" : "Citizen Modules"}</span>
                <span className={styles.chevron}>▼</span>
              </button>

              {isCitizenDropdownOpen && (
                <div className={styles.dropdownMenu} style={{ minWidth: 320 }}>
                  <div className={styles.dropdownHeader}>
                    {lang === "hi" ? "नागरिक पोर्टल मॉड्यूल व मानचित्र" : "Citizen Modules & Live Views"}
                  </div>
                  {CITIZEN_NAV_MODULES.map((mod) => (
                    <button
                      key={mod.key}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => handleCitizenModuleClick(mod.key)}
                      style={{
                        background: activeCitizenTab === mod.key && isCitizenPage ? "#eff6ff" : "transparent",
                      }}
                    >
                      <span className={styles.dropdownItemIcon}>{mod.icon}</span>
                      <div>
                        <div style={{ fontWeight: activeCitizenTab === mod.key ? 700 : 600, color: activeCitizenTab === mod.key ? "#1e3a8a" : "inherit" }}>
                          {mod.label}
                        </div>
                        <div className={styles.dropdownItemDesc}>{mod.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Modules Navigation Dropdown */}
            <div className={styles.dropdown} ref={adminDropdownRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${isAdminDropdownOpen ? styles.open : ""}`}
                onClick={() => setIsAdminDropdownOpen((prev) => !prev)}
                style={{
                  background: isAdminPage ? "rgba(238, 242, 255, 0.95)" : "transparent",
                  color: isAdminPage ? "#1e3a8a" : "inherit",
                  fontWeight: 700,
                  borderColor: isAdminPage ? "#93c5fd" : "var(--line)",
                }}
              >
                <span>🛡️ {lang === "hi" ? "पुलिस प्रशासन मॉड्यूल" : "Admin Modules"}</span>
                <span className={styles.chevron}>▼</span>
              </button>

              {isAdminDropdownOpen && (
                <div className={styles.dropdownMenu} style={{ minWidth: 320 }}>
                  <div className={styles.dropdownHeader}>
                    {lang === "hi" ? "विशिष्ट मॉड्यूल पेज व मानचित्र" : "Dedicated Module Pages & Maps"}
                  </div>
                  {ADMIN_MODULES.map((mod) => (
                    <button
                      key={mod.key}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => handleAdminModuleClick(mod.key)}
                      style={{
                        background: activeAdminTab === mod.key && isAdminPage ? "#eff6ff" : "transparent",
                      }}
                    >
                      <span className={styles.dropdownItemIcon}>{mod.icon}</span>
                      <div>
                        <div style={{ fontWeight: activeAdminTab === mod.key ? 700 : 600, color: activeAdminTab === mod.key ? "#1e3a8a" : "inherit" }}>
                          {mod.label}
                        </div>
                        <div className={styles.dropdownItemDesc}>{mod.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Citizen Services Dropdown */}
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${isDropdownOpen ? styles.open : ""}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
              >
                <span>💳 {lang === "hi" ? "नागरिक सेवाएँ" : "Citizen Services"}</span>
                <span className={styles.chevron}>▼</span>
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    {lang === "hi" ? "डिजिटल पुलिस सेवाएँ" : "Digital Police Desks"}
                  </div>
                  {CITIZEN_SERVICES.map((service) => (
                    <button
                      key={service.key}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => handleServiceClick(service.key)}
                    >
                      <span className={styles.dropdownItemIcon}>{service.icon}</span>
                      <div>
                        <div>{service.label}</div>
                        <div className={styles.dropdownItemDesc}>{service.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
