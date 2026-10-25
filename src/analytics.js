const CONSENT_KEY = "lucky:analytics-consent:v1";
const CONSENT_AGE = 180 * 24 * 60 * 60 * 1000;
const EVENTS = new Set(["page_view", "phone_click", "whatsapp_click", "email_click", "product_enquiry", "map_click"]);
const PARAMETERS = ["cta_location", "page_type", "product_id", "product_path", "category", "channel"];

// Exported factory keeps consent and tag behavior testable without calling Google.
export function createAnalyticsClient({ environment = {}, getWindow = () => typeof window === "undefined" ? null : window } = {}) {
  const measurementId = environment.VITE_GA4_MEASUREMENT_ID || "";
  const configured = environment.VITE_GA4_ENABLED === "true" && /^G-[A-Z0-9]+$/.test(measurementId);
  let consent;
  let initialized = false;
  let tagStarted = false;
  let latestPage;
  let lastPagePath;

  function readConsent(win) {
    try {
      const saved = JSON.parse(win.localStorage.getItem(CONSENT_KEY));
      return typeof saved?.allowed === "boolean" && saved.expires > Date.now() ? saved.allowed : null;
    } catch { return null; }
  }

  function status() {
    const win = getWindow();
    const allowedHost = Boolean(win && (["luckyinteriorsfurniture.com", "www.luckyinteriorsfurniture.com"].includes(win.location.hostname) || environment.VITE_GA4_ALLOW_LOCAL === "true"));
    if (consent === undefined && win) consent = readConsent(win);
    return { configured, available: configured && allowedHost, consent: consent ?? null };
  }

  function announce(win) {
    win.dispatchEvent(new win.CustomEvent("lucky:analytics-consent", { detail: status() }));
  }

  function cleanUrl(value, fallback) {
    if (!value) return "";
    try { const url = new URL(value, fallback); return /^https?:$/.test(url.protocol) ? `${url.origin}${url.pathname}` : ""; }
    catch { return ""; }
  }

  function startTag(win) {
    if (tagStarted || !status().available || consent !== true) return;
    tagStarted = true;
    win[`ga-disable-${measurementId}`] = false;
    win.dataLayer = win.dataLayer || [];
    win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };
    win.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    win.gtag("js", new Date());
    win.gtag("config", measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: cleanUrl(win.location.href, win.location.origin),
      page_referrer: cleanUrl(win.document.referrer, win.location.origin),
    });
    const script = win.document.createElement("script");
    script.id = "lucky-ga4-tag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    win.document.head.append(script);
  }

  function sendToGoogle(win, eventName, parameters) {
    if (!status().available || consent !== true || !EVENTS.has(eventName)) return;
    startTag(win);
    win[`ga-disable-${measurementId}`] = false;
    const safe = {};
    for (const key of PARAMETERS) {
      if (typeof parameters[key] === "string") safe[key] = key === "product_path"
        ? new URL(cleanUrl(parameters[key], win.location.origin) || win.location.origin).pathname
        : parameters[key].slice(0, 100);
    }
    // Do not transmit URL query strings, search terms, contact details or message text.
    const page = cleanUrl(parameters.page_path || win.location.href, win.location.origin);
    const referrer = cleanUrl(win.document.referrer, win.location.origin);
    win.gtag("event", eventName, {
      ...safe,
      send_to: measurementId,
      page_location: page,
      page_referrer: referrer,
      page_title: "Lucky Interiors Furniture",
    });
  }

  function initialize() {
    const win = getWindow();
    if (!win || initialized) return;
    initialized = true;
    status();
    if (consent === true) startTag(win);
    win.addEventListener("storage", (event) => {
      if (event.key === CONSENT_KEY || event.key === null) {
        const previous = consent;
        consent = readConsent(win);
        win[`ga-disable-${measurementId}`] = consent !== true;
        if (previous !== true && consent === true) {
          startTag(win);
          if (latestPage) sendToGoogle(win, "page_view", latestPage);
        }
        announce(win);
      }
    });
  }

  function setConsent(allowed) {
    const win = getWindow();
    if (!win || !status().available) return;
    const previous = consent;
    consent = allowed === true;
    try { win.localStorage.setItem(CONSENT_KEY, JSON.stringify({ allowed: consent, expires: Date.now() + CONSENT_AGE })); } catch { /* Session-only choice when storage is unavailable. */ }
    win[`ga-disable-${measurementId}`] = !consent;
    if (consent) {
      startTag(win);
      if (tagStarted) win.gtag("consent", "update", { analytics_storage: "granted" });
      if (previous !== true && latestPage) sendToGoogle(win, "page_view", latestPage);
    } else {
      // Disable this property immediately and remove its first-party Analytics cookies.
      const names = ["_ga", `_ga_${measurementId.slice(2)}`];
      for (const name of names) {
        for (const domain of ["", win.location.hostname, "luckyinteriorsfurniture.com"]) {
          win.document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
        }
      }
    }
    announce(win);
  }

  function track(eventName, parameters = {}) {
    const win = getWindow();
    if (!win) return;
    if (eventName === "page_view") {
      const path = cleanUrl(parameters.page_path || win.location.href, win.location.origin);
      latestPage = { ...parameters, page_path: path };
      // React StrictMode replays effects in development; do not count the same route twice.
      if (path === lastPagePath) return;
      lastPagePath = path;
    }
    const event = { event: eventName, ...parameters };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(event);
    win.dispatchEvent(new win.CustomEvent("lucky:analytics", { detail: event }));
    sendToGoogle(win, eventName, parameters);
  }

  return { initialize, status, setConsent, track };
}

const analytics = createAnalyticsClient({ environment: import.meta.env || {} });
export const initializeAnalytics = () => analytics.initialize();
export const getAnalyticsStatus = () => analytics.status();
export const setAnalyticsConsent = (allowed) => analytics.setConsent(allowed);
export const trackEvent = (eventName, parameters = {}) => analytics.track(eventName, parameters);
