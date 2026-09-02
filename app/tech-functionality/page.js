"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import styles from "./tech.module.css";
import { t } from "@/lib/i18n";

export default function TechFunctionalityPage() {
  const [lang, setLang] = useState("en");

  const MODULES = [
    {
      id: "mod1",
      badgeClass: styles.mod1Badge,
      badgeText: "MODULE 1",
      title: t("mod1Title", lang),
      description: t("mod1Desc", lang),
      specs: [
        "GPS location capture & manual landmark fallback",
        "Photo upload support with image preview (up to 10MB)",
        "JSON-backed persistent complaint CRUD endpoints",
        "Interactive Leaflet GIS map with status circle markers",
      ],
    },
    {
      id: "mod2",
      badgeClass: styles.mod2Badge,
      badgeText: "MODULE 2",
      title: t("mod2Title", lang),
      description: t("mod2Desc", lang),
      specs: [
        "8 landmark junctions monitored across Raipur Commissionerate",
        "Real-time simulated traffic congestion status (Free / Moderate / Heavy)",
        "Automated heavy jam alert trigger banner with time-ago tracking",
        "One-click 'Deploy Patrol' action reflecting live status change",
      ],
    },
    {
      id: "mod3",
      badgeClass: styles.mod3Badge,
      badgeText: "MODULE 3 (PoC)",
      title: t("mod3Title", lang),
      description: t("mod3Desc", lang),
      specs: [
        "Simulated emergency vehicle (Ambulance / Fire Truck) route broadcast",
        "Junction signal preemption request workflow (Requested / Cleared)",
        "Operator dashboard to issue priority green waves for emergency corridors",
        "Clear proof-of-concept UI labeling per hackathon guidelines",
      ],
    },
    {
      id: "mod4",
      badgeClass: styles.mod4Badge,
      badgeText: "MODULE 4",
      title: t("mod4Title", lang),
      description: t("mod4Desc", lang),
      specs: [
        "7 designated parking hubs in Raipur with total capacity tracking",
        "Haversine formula algorithm to compute distance to nearest available parking",
        "Simulated live occupancy feed updating spot counts every 5 seconds",
        "Manual Police Override inputs for traffic control operators",
      ],
    },
  ];

  return (
    <div className={styles.shell}>
      <Navbar lang={lang} onLangChange={setLang} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Technical Architecture & Specifications</div>
          <h1 className={styles.heroTitle}>{t("techTitle", lang)}</h1>
          <p className={styles.heroSub}>{t("techSub", lang)}</p>
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.sectionHead}>
          <h2>{t("techOverviewTitle", lang)}</h2>
          <p>{t("techOverviewSub", lang)}</p>
        </div>

        <div className={styles.modulesGrid}>
          {MODULES.map((mod) => (
            <div key={mod.id} className={styles.moduleCard}>
              <span className={`${styles.moduleBadge} ${mod.badgeClass}`}>{mod.badgeText}</span>
              <h3>{mod.title}</h3>
              <p>{mod.description}</p>
              <div className={styles.specList}>
                {mod.specs.map((spec, i) => (
                  <div key={i} className={styles.specItem}>
                    <span>⚙️</span>
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.archCard}>
          <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
            <h2>{t("archTitle", lang)}</h2>
            <p>End-to-end data pipeline from citizen submission to police dashboard & GIS map</p>
          </div>

          <div className={styles.archDiagram}>
            <div className={styles.archStep}>
              <div className={styles.archStepNum}>1</div>
              <div className={styles.archStepTitle}>Citizen Capture</div>
              <div className={styles.archStepDesc}>GPS location, photo evidence, category, and report submission via Next.js portal</div>
            </div>
            <div className={styles.archStep}>
              <div className={styles.archStepNum}>2</div>
              <div className={styles.archStepTitle}>API & Storage</div>
              <div className={styles.archStepDesc}>Next.js Route Handlers processing validation and file-backed database storage</div>
            </div>
            <div className={styles.archStep}>
              <div className={styles.archStepNum}>3</div>
              <div className={styles.archStepTitle}>GIS Mapping Engine</div>
              <div className={styles.archStepDesc}>React-Leaflet engine rendering Raipur Commissionerate boundary polygon & status pins</div>
            </div>
            <div className={styles.archStep}>
              <div className={styles.archStepNum}>4</div>
              <div className={styles.archStepTitle}>Police Dispatch</div>
              <div className={styles.archStepDesc}>Admin dashboard live alerts, patrol deployment logging, & parking capacity overrides</div>
            </div>
          </div>
        </div>

        <div className={styles.roadMapBox}>
          <h3>🚀 {t("prodPathTitle", lang)}</h3>
          <p>{t("simToRealNote", lang)}</p>

          <div className={styles.roadMapGrid}>
            <div className={styles.roadMapItem}>
              <strong>📷 Module 1 & 4 Upgrade</strong>
              <span>Install ANPR CCTV cameras & IoT magnetic sensors in parking bays for automated spot counting.</span>
            </div>
            <div className={styles.roadMapItem}>
              <strong>🚥 Module 2 Upgrade</strong>
              <span>Connect directly to TomTom Traffic API / Google Roads API for real-time junction flow telemetry.</span>
            </div>
            <div className={styles.roadMapItem}>
              <strong>🚑 Module 3 Upgrade</strong>
              <span>Deploy GPS transponders on ambulances & relay triggers to physical traffic signal controllers.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
