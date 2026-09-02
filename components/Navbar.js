"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { t } from "@/lib/i18n";

export default function Navbar({ lang = "en", onLangChange, onOpenServiceModal }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  function handleServiceClick(serviceKey) {
    setIsDropdownOpen(false);
    if (onOpenServiceModal) {
      onOpenServiceModal(serviceKey);
    } else {
      router.push(`/?service=${serviceKey}`);
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

            {/* Citizen Services Dropdown */}
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                type="button"
                className={`${styles.dropdownTrigger} ${isDropdownOpen ? styles.open : ""}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
              >
                <span>🏛️ {lang === "hi" ? "नागरिक सेवाएँ" : "Citizen Services"}</span>
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

