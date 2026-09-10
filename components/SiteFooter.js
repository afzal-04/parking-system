import styles from "./SiteFooter.module.css";
import { t } from "@/lib/i18n";

export default function SiteFooter({ lang = "en" }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <div className={styles.footerBrand}>
            <div className={styles.crestSm}>रा</div>
            <span>Raipur Police (Chhattisgarh)</span>
          </div>
          <div className={styles.footerList}>
            {t("footerTagline", lang)}
            <br />
            {t("footerSubmission", lang)}
          </div>
        </div>
        <div>
          <h4>{t("quickLink", lang)}</h4>
          <div className={styles.footerList}>
            {t("quickLinkList", lang)
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
          </div>
        </div>
        <div>
          <h4>{t("jurisdiction", lang)}</h4>
          <div className={styles.footerList}>
            {t("jurisdictionList", lang)
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <span>{t("footerCopy", lang)}</span>
        <span>{t("footerNote", lang)}</span>
      </div>
    </footer>
  );
}
