import test from "node:test";
import assert from "node:assert/strict";
import { buildRequests, createReporter, normalizeHistory, parseSelection, readConfig, reportRows, safeAnalyticsError } from "./ga4.mjs";

function report(dimensions, metrics, rows = [], metadata = { timeZone: "Asia/Kolkata" }) {
  return { dimensionHeaders: dimensions.map((name) => ({ name })), metricHeaders: metrics.map((name) => ({ name })), rows: rows.map(([dimensionValues, metricValues]) => ({ dimensionValues: dimensionValues.map((value) => ({ value })), metricValues: metricValues.map((value) => ({ value: String(value) })) })), metadata };
}
function fixtures() {
  return { reports: [
    report([], ["totalUsers", "sessions", "screenPageViews"], [[[], [100, 123, 200]]]),
    report([], ["totalUsers", "sessions"], [[[], [30, 40]]]),
    report(["eventName"], ["eventCount", "totalUsers"], [[["phone_click"], [9, 4]], [["whatsapp_click"], [11, 6]]]),
    report(["date"], ["totalUsers", "sessions"], [[["20261024"], [12, 20]]]),
    report(["city"], ["totalUsers", "sessions"], [[["Mumbai"], [30, 40]]]),
  ] };
}
const timeline = () => report(["dateHourMinute", "eventName"], ["eventCount", "totalUsers"], [[["202610241431", "phone_click"], [3, 2]]]);

test("selection validation limits quota-expensive ranges and rejects invalid filters", () => {
  assert.deepEqual(parseSelection(new URLSearchParams()), { days: 7, city: "all" });
  assert.throws(() => parseSelection(new URLSearchParams("days=100000")));
  assert.throws(() => parseSelection(new URLSearchParams("city=arbitrary")));
  assert.equal(readConfig({ GA4_PROPERTY_ID: "G-INCORRECT" }).propertyId, "");
  assert.equal(readConfig({ GA4_PROPERTY_ID: "1234" }).credentialsAvailable, false);
});

test("queries filter Mumbai in India, live-site hosts and the actual contact events only", () => {
  const requests = buildRequests({ days: 7, city: "mumbai" });
  assert.equal(requests.batch.requests.length, 5);
  assert.deepEqual(requests.batch.requests[0].dateRanges, [{ startDate: "6daysAgo", endDate: "today" }]);
  const text = JSON.stringify(requests);
  assert.match(text, /Mumbai/);
  assert.match(text, /India/);
  assert.match(text, /hostName/);
  assert.match(text, /phone_click/);
  assert.doesNotMatch(text, /product_enquiry/, "do not count a product enquiry again as a contact click");
  assert.doesNotMatch(JSON.stringify(requests.realtimeSummary), /hostName/, "Realtime does not support the hostName dimension");
  assert.equal(requests.timeline.limit, 100);
});

test("report totals keep users separate from clicks and preserve unavailable-timezone warnings", () => {
  const history = normalizeHistory(fixtures(), timeline());
  assert.equal(history.summary.totalUsers, 100);
  assert.equal(history.mumbai.totalUsers, 30);
  assert.equal(history.contacts[0].eventCount, 9);
  assert.equal(history.contacts[0].totalUsers, 4);
  assert.equal(history.contacts[2].eventCount, 0, "a successfully fetched empty email result is a real zero");
  assert.equal(history.timeline[0].dateHourMinute, "202610241431");
  assert.equal(history.timeZone, "Asia/Kolkata");
  const batch = fixtures();
  batch.reports[0].metadata = { timeZone: "UTC", subjectToThresholding: true };
  const unknown = normalizeHistory(batch, { ...timeline(), metadata: {} });
  assert.equal(unknown.warnings.length, 2);
  assert.throws(() => normalizeHistory({}, timeline()));
  assert.deepEqual(reportRows(), []);
});

test("reporter caches requests, makes real API-shaped requests and never invents successful data on error", async () => {
  let calls = 0;
  let clock = 0;
  const reporter = createReporter({ propertyId: "123" }, { now: () => clock, request: async (method, data) => {
    calls += 1;
    if (method === "batchRunReports") return fixtures();
    if (method === "runReport") return timeline();
    return data.dimensions ? report(["minutesAgo", "eventName"], ["eventCount"], [[["1", "phone_click"], [2]]]) : report([], ["activeUsers"], [[[], [4]]]);
  } });
  const result = await reporter({ days: 7, city: "all" });
  assert.equal(result.state, "connected");
  assert.equal(result.realtime.activeUsers, 4);
  await reporter({ days: 7, city: "all" });
  assert.equal(calls, 4);
  clock = 31000;
  await reporter({ days: 7, city: "all" });
  assert.equal(calls, 6, "only realtime refreshes inside the five-minute history cache");
  const failing = createReporter({ propertyId: "123" }, { request: async () => { throw { response: { status: 403 }, message: "DO NOT EXPOSE TOKEN" }; } });
  const failure = await failing({ days: 7, city: "all" });
  assert.equal(failure.history, null);
  assert.equal(failure.realtime, null);
  assert.doesNotMatch(JSON.stringify(failure), /DO NOT EXPOSE TOKEN/);
  assert.match(safeAnalyticsError({ response: { status: 403 } }), /Viewer/);
});
