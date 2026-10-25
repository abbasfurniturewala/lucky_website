import { GoogleAuth } from "google-auth-library";

export const CONTACT_EVENTS = ["phone_click", "whatsapp_click", "email_click"];
const HOSTS = ["luckyinteriorsfurniture.com", "www.luckyinteriorsfurniture.com"];
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export function readConfig(env = process.env) {
  return {
    propertyId: /^\d+$/.test(env.GA4_PROPERTY_ID || "") ? env.GA4_PROPERTY_ID : "",
    credentialsAvailable: Boolean(env.GOOGLE_APPLICATION_CREDENTIALS || env.GA4_USE_ADC === "true"),
    measurementConfigured: /^G-[A-Z0-9]+$/.test(env.VITE_GA4_MEASUREMENT_ID || ""),
    trackingEnabled: env.VITE_GA4_ENABLED === "true",
  };
}

export function parseSelection(searchParams) {
  const days = Number(searchParams.get("days") || 7);
  const city = searchParams.get("city") || "all";
  if (![1, 7, 30, 90].includes(days) || !["all", "mumbai"].includes(city)) {
    throw new Error("Choose 1, 7, 30 or 90 days, and all cities or Mumbai.");
  }
  return { days, city };
}

function exact(fieldName, value) {
  return { filter: { fieldName, stringFilter: { matchType: "EXACT", value, caseSensitive: false } } };
}

function filters({ city = "all", contacts = false, realtime = false } = {}) {
  const expressions = [];
  if (!realtime) {
    expressions.push({ filter: { fieldName: "hostName", inListFilter: { values: HOSTS } } });
  }
  if (city === "mumbai") expressions.push(exact("country", "India"), exact("city", "Mumbai"));
  if (contacts) expressions.push({ filter: { fieldName: "eventName", inListFilter: { values: CONTACT_EVENTS } } });
  return expressions.length ? { dimensionFilter: { andGroup: { expressions } } } : {};
}

export function buildRequests({ days, city }) {
  const dateRanges = [{ startDate: `${days - 1}daysAgo`, endDate: "today" }];
  const report = (dimensions, metrics, extra = {}) => ({
    dateRanges,
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    ...filters({ city }),
    ...extra,
  });
  return {
    batch: { requests: [
      report([], ["totalUsers", "sessions", "screenPageViews"]),
      report([], ["totalUsers", "sessions"], filters({ city: "mumbai" })),
      report(["eventName"], ["eventCount", "totalUsers"], filters({ city, contacts: true })),
      report(["date"], ["totalUsers", "sessions"], { orderBys: [{ dimension: { dimensionName: "date" } }] }),
      report(["city"], ["totalUsers", "sessions"], {
        ...filters(), limit: 10, orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      }),
    ] },
    timeline: report(["dateHourMinute", "eventName"], ["eventCount", "totalUsers"], {
      ...filters({ city, contacts: true }), limit: 100,
      orderBys: [{ dimension: { dimensionName: "dateHourMinute" }, desc: true }],
    }),
    realtimeSummary: {
      metrics: [{ name: "activeUsers" }], ...filters({ city, realtime: true }),
    },
    realtimeEvents: {
      dimensions: [{ name: "minutesAgo" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      ...filters({ city, contacts: true, realtime: true }), limit: 100,
      orderBys: [{ dimension: { dimensionName: "minutesAgo", orderType: "NUMERIC" } }],
    },
  };
}

export function reportRows(report = {}) {
  return (report.rows || []).map((row) => Object.fromEntries([
    ...(report.dimensionHeaders || []).map(({ name }, i) => [name, row.dimensionValues?.[i]?.value || "(not set)"]),
    ...(report.metricHeaders || []).map(({ name }, i) => [name, Number(row.metricValues?.[i]?.value || 0)]),
  ]));
}

export function normalizeHistory(batch, timeline) {
  if (batch.reports?.length !== 5) throw new Error("Incomplete GA4 report response");
  const [summary, mumbai, events, daily, cities] = batch.reports;
  const eventRows = reportRows(events);
  const reports = [...batch.reports, timeline];
  const warnings = [];
  if (reports.some((r) => r.metadata?.subjectToThresholding)) warnings.push("Google may withhold small groups for privacy; some totals or cities can be incomplete.");
  if (reports.some((r) => r.metadata?.dataLossFromOtherRow)) warnings.push("Some high-cardinality rows have been grouped by Google.");
  if (reports.some((r) => r.metadata?.samplingMetadatas?.length)) warnings.push("Google reports sampled data for this selection.");
  const timeZone = timeline.metadata?.timeZone || summary.metadata?.timeZone || "Unknown — check the GA4 property";
  if (!["Asia/Kolkata", "Asia/Calcutta"].includes(timeZone)) warnings.push("Set the GA4 property's reporting time zone to India for IST dates. Times below currently use the property's reported zone.");
  return {
    summary: reportRows(summary)[0] || { totalUsers: 0, sessions: 0, screenPageViews: 0 },
    mumbai: reportRows(mumbai)[0] || { totalUsers: 0, sessions: 0 },
    contacts: CONTACT_EVENTS.map((eventName) => eventRows.find((row) => row.eventName === eventName) || { eventName, eventCount: 0, totalUsers: 0 }),
    daily: reportRows(daily), cities: reportRows(cities), timeline: reportRows(timeline),
    timelineLimited: Number(timeline.rowCount || 0) > 100,
    timeZone, warnings,
    fetchedAt: new Date().toISOString(),
  };
}

export function safeAnalyticsError(error) {
  const code = Number(error?.response?.status || error?.code);
  if (code === 401) return "Google authentication expired or was rejected. Reconnect read-only credentials, then restart this dashboard.";
  if (code === 403) return "Access denied. Enable the Google Analytics Data API and grant this credential Viewer access to the correct GA4 property.";
  if (code === 429) return "Google's reporting quota was reached. Wait a few minutes before refreshing.";
  if (code === 400) return "Google rejected the report request. Check the property ID and report configuration.";
  if (code === 404) return "The GA4 property was not found or this account cannot access it.";
  return "Google Analytics could not be reached. Check credentials and the network connection; no results have been substituted.";
}

export function createReporter(config, { request, now = Date.now } = {}) {
  const auth = request ? null : new GoogleAuth({ scopes: [SCOPE] });
  const call = request || (async (method, data) => {
    const client = await auth.getClient();
    const response = await client.request({
      url: `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:${method}`,
      method: "POST", data, timeout: 20000,
    });
    return response.data;
  });
  const cache = new Map();
  async function cached(key, ttl, operation) {
    const existing = cache.get(key);
    if (existing && existing.expires > now()) return existing.promise;
    const entry = { expires: now() + ttl, promise: null };
    entry.promise = operation().catch((error) => {
      entry.expires = now() + 10000;
      throw new Error(safeAnalyticsError(error));
    });
    cache.set(key, entry);
    return entry.promise;
  }
  return async (selection) => {
    const requests = buildRequests(selection);
    const key = `${selection.days}:${selection.city}`;
    const [history, realtime] = await Promise.allSettled([
      cached(`history:${key}`, 300000, async () => {
        const [batch, timeline] = await Promise.all([
          call("batchRunReports", requests.batch), call("runReport", requests.timeline),
        ]);
        return normalizeHistory(batch, timeline);
      }),
      cached(`realtime:${selection.city}`, 30000, async () => {
        const [summary, events] = await Promise.all([
          call("runRealtimeReport", requests.realtimeSummary), call("runRealtimeReport", requests.realtimeEvents),
        ]);
        return { activeUsers: reportRows(summary)[0]?.activeUsers || 0, events: reportRows(events), fetchedAt: new Date().toISOString() };
      }),
    ]);
    return {
      state: history.status === "fulfilled" && realtime.status === "fulfilled" ? "connected" : "partial_or_error",
      selection,
      history: history.status === "fulfilled" ? history.value : null,
      realtime: realtime.status === "fulfilled" ? realtime.value : null,
      errors: [...new Set([history, realtime].filter((result) => result.status === "rejected").map((result) => result.reason.message))],
    };
  };
}
