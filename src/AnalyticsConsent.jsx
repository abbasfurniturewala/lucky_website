import { useEffect, useState } from "react";
import { getAnalyticsStatus, initializeAnalytics, setAnalyticsConsent } from "./analytics.js";
import "./analytics-consent.css";

export default function AnalyticsConsent() {
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    initializeAnalytics();
    const update = () => setStatus(getAnalyticsStatus());
    update();
    window.addEventListener("lucky:analytics-consent", update);
    return () => window.removeEventListener("lucky:analytics-consent", update);
  }, []);
  if (!status?.available) return null;
  const visible = open || status.consent === null;
  function choose(allowed) {
    setAnalyticsConsent(allowed);
    setStatus(getAnalyticsStatus());
    setOpen(false);
  }
  return (
    <div className="analytics-preferences">
      <button className="analytics-settings" type="button" onClick={() => setOpen(!open)} aria-expanded={visible}>Analytics settings</button>
      {visible && <section className="analytics-consent" aria-label="Optional website analytics">
        <h2>Help us understand what is useful</h2>
        <p>Allow Google Analytics to measure page visits, approximate city and enquiry-button clicks using cookies? We do not send enquiry messages or contact details through these events. You can change your choice here at any time.</p>
        <a href="/privacy">Read our privacy policy</a>
        <div className="analytics-consent-actions">
          <button type="button" onClick={() => choose(false)}>No thanks</button>
          <button type="button" onClick={() => choose(true)}>Allow analytics</button>
        </div>
      </section>}
    </div>
  );
}
