import test from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsClient } from "../src/analytics.js";

function browser({ hostname = "luckyinteriorsfurniture.com", stored = null } = {}) {
  const scripts = [];
  const events = [];
  const storage = new Map(stored ? [["lucky:analytics-consent:v1", JSON.stringify(stored)]] : []);
  const listeners = {};
  const win = {
    location: { hostname, origin: `https://${hostname}`, href: `https://${hostname}/contact?email=private@example.test#secret` },
    CustomEvent: class { constructor(type, { detail }) { this.type = type; this.detail = detail; } },
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    document: { referrer: "https://example.test/search?private=value", cookie: "", createElement: () => ({}), head: { append: (script) => scripts.push(script) } },
    dispatchEvent: (event) => events.push(event),
    addEventListener: (type, listener) => { listeners[type] = listener; },
    dataLayer: [],
  };
  const client = createAnalyticsClient({ environment: { VITE_GA4_ENABLED: "true", VITE_GA4_MEASUREMENT_ID: "G-TEST12345" }, getWindow: () => win });
  const googleEvents = () => win.dataLayer.filter((item) => item[0] === "event").map((item) => [...item]);
  return { win, client, scripts, events, googleEvents, listeners };
}

test("no Google script or historical clicks before explicit consent", () => {
  const { client, scripts, googleEvents, win } = browser();
  client.initialize();
  client.track("page_view", { page_path: "/contact" });
  client.track("phone_click", { cta_location: "footer" });
  assert.equal(scripts.length, 0);
  assert.equal(googleEvents().length, 0);
  assert.equal(win.dataLayer.length, 2, "existing local hooks remain available");
  client.setConsent(true);
  assert.equal(scripts.length, 1);
  assert.deepEqual(googleEvents().map((item) => item[1]), ["page_view"], "pre-consent call was not replayed");
  client.setConsent(true);
  assert.equal(googleEvents().length, 1);
  assert.equal(scripts.length, 1);
});

test("reject/withdraw disables subsequent tracking and a new grant counts only the current page", () => {
  const { client, scripts, googleEvents, win } = browser();
  client.initialize();
  client.setConsent(false);
  client.track("page_view", { page_path: "/" });
  assert.equal(scripts.length, 0);
  client.setConsent(true);
  client.track("phone_click");
  assert.equal(googleEvents().length, 2);
  client.setConsent(false);
  assert.equal(win["ga-disable-G-TEST12345"], true);
  client.track("whatsapp_click");
  assert.equal(googleEvents().length, 2);
  client.setConsent(true);
  assert.equal(win["ga-disable-G-TEST12345"], false);
  assert.equal(googleEvents().length, 3);
});

test("StrictMode replay does not double-count page views; back navigation still counts", () => {
  const { client, googleEvents } = browser({ stored: { allowed: true, expires: Date.now() + 100000 } });
  client.initialize();
  client.track("page_view", { page_path: "/" });
  client.track("page_view", { page_path: "/" });
  client.track("page_view", { page_path: "/contact" });
  client.track("page_view", { page_path: "/" });
  assert.equal(googleEvents().length, 3);
});

test("Google payloads exclude queries, fragments, contact details and arbitrary fields", () => {
  const { client, googleEvents, win } = browser();
  client.initialize();
  client.setConsent(true);
  client.track("whatsapp_click", { product_path: "/products/sofa?email=secret#private", product_id: "sofa", email: "private@example.test", message: "secret", query: "secret" });
  const payload = googleEvents()[0][2];
  assert.equal(payload.page_location, "https://luckyinteriorsfurniture.com/contact");
  assert.equal(payload.page_referrer, "https://example.test/search");
  assert.equal(payload.product_path, "/products/sofa");
  assert.equal(payload.product_id, "sofa");
  assert.equal(payload.email, undefined);
  assert.equal(payload.message, undefined);
  assert.equal(payload.query, undefined);
  const config = win.dataLayer.find((item) => item[0] === "config")[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.page_location.includes("?"), false);
});

test("localhost, unconfigured builds, expired consent and SSR do not contact Google", () => {
  const local = browser({ hostname: "127.0.0.1", stored: { allowed: true, expires: Date.now() + 10000 } });
  local.client.initialize();
  local.client.track("phone_click");
  assert.equal(local.client.status().available, false);
  assert.equal(local.scripts.length, 0);
  const expired = browser({ stored: { allowed: true, expires: 1 } });
  expired.client.initialize();
  assert.equal(expired.client.status().consent, null);
  assert.equal(expired.scripts.length, 0);
  const server = createAnalyticsClient({ getWindow: () => null });
  assert.doesNotThrow(() => { server.initialize(); server.track("page_view"); server.setConsent(true); });
  assert.equal(server.status().configured, false);
});

test("a choice changed in another tab is respected", () => {
  const { client, win, listeners, googleEvents } = browser();
  client.initialize();
  client.setConsent(true);
  client.track("phone_click");
  win.localStorage.setItem("lucky:analytics-consent:v1", JSON.stringify({ allowed: false, expires: Date.now() + 100000 }));
  listeners.storage({ key: "lucky:analytics-consent:v1" });
  client.track("phone_click");
  assert.equal(client.status().consent, false);
  assert.equal(googleEvents().length, 1);
});
