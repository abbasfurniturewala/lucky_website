const $ = (id) => document.getElementById(id);
const format = (value) => new Intl.NumberFormat("en-IN").format(value);
const labels = { phone_click: "Call", whatsapp_click: "WhatsApp", email_click: "Email" };
const localTime = (value) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value));
let days = 7;
let requestId = 0;
let refreshTimer;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function setMetric(id, value) { $(id).textContent = value === undefined || value === null ? "—" : format(value); }
function contact(history, eventName) { return history?.contacts.find((row) => row.eventName === eventName); }

function renderSetup(setup) {
  for (const [id, ready] of [["setup-property", setup.propertyConfigured], ["setup-auth", setup.credentialsConfigured], ["setup-tag", setup.measurementConfigured && setup.trackingEnabled]]) {
    $(id).classList.toggle("done", ready);
    $(id).querySelector(".step-state").textContent = ready ? "Configured · verify" : "Needed";
  }
}

function renderChart(history) {
  const chart = $("traffic-chart");
  chart.replaceChildren();
  chart.classList.toggle("empty-chart", !history?.daily.length);
  if (!history?.daily.length) {
    const empty = element("div");
    empty.append(element("span", "▥"), element("h3", history ? "No visits in this report yet" : "Real visitors will appear here"), element("p", history ? "New reports may still be processing." : "Connect Analytics to see your traffic trend."));
    chart.append(empty);
  } else {
    const max = Math.max(1, ...history.daily.map((row) => row.totalUsers));
    for (const row of history.daily) {
      const column = element("div", undefined, "chart-column");
      const date = `${row.date.slice(6, 8)}/${row.date.slice(4, 6)}`;
      column.title = `${date}: ${format(row.totalUsers)} users`;
      const bar = element("span", undefined, "chart-bar");
      bar.style.height = `${Math.max(1, row.totalUsers / max * 85)}%`;
      column.append(bar, element("span", history.daily.length <= 31 ? date : "", "chart-day"));
      chart.append(column);
    }
  }
  $("traffic-foot").textContent = history ? `${format(history.summary.sessions)} sessions · ${format(history.summary.screenPageViews)} page views · daily users are not additive` : "No reporting data connected";
}

function renderContacts(history) {
  const root = $("contact-breakdown");
  root.replaceChildren();
  if (!history) return root.append(element("p", "Call, WhatsApp and email click totals will appear after tracking starts.", "empty-copy"));
  const max = Math.max(1, ...history.contacts.map((row) => row.eventCount));
  for (const row of history.contacts) {
    const wrapper = element("div", undefined, "contact-row");
    const title = element("div", undefined, "contact-title");
    const count = element("span", `${format(row.eventCount)} clicks`);
    count.append(element("small", `${format(row.totalUsers)} users`));
    title.append(element("span", labels[row.eventName] || row.eventName), count);
    const track = element("div", undefined, "contact-track");
    const fill = element("div", undefined, "contact-fill");
    fill.style.width = `${row.eventCount / max * 100}%`;
    track.append(fill);
    wrapper.append(title, track);
    root.append(wrapper);
  }
}

function renderCities(history) {
  $("city-table").replaceChildren();
  if (!history?.cities.length) return $("city-table").append(element("p", history ? "No city rows in this report yet." : "No location data connected.", "empty-copy"));
  for (const row of history.cities) {
    const line = element("div", undefined, "city-row");
    line.append(element("span", row.city === "(not set)" ? "Location unknown" : row.city), element("span", `${format(row.totalUsers)} users`));
    $("city-table").append(line);
  }
}

function renderTimeline(history) {
  const root = $("timeline");
  root.replaceChildren();
  if (!history?.timeline.length) {
    const row = element("tr");
    const cell = element("td", history ? "No enquiry clicks in this report yet. Processing can take 24–48 hours." : "No recorded click results are available yet.", "empty-cell");
    cell.colSpan = 4;
    row.append(cell);
    root.append(row);
  } else {
    for (const item of history.timeline) {
      const t = item.dateHourMinute;
      const when = /^\d{12}$/.test(t) ? `${t.slice(6, 8)}/${t.slice(4, 6)}/${t.slice(0, 4)} · ${t.slice(8, 10)}:${t.slice(10, 12)}` : "Time not supplied";
      const row = element("tr");
      row.append(element("td", when), element("td", labels[item.eventName] || item.eventName), element("td", format(item.eventCount)), element("td", format(item.totalUsers)));
      root.append(row);
    }
  }
  $("time-zone").textContent = history ? `Reporting time zone: ${history.timeZone}` : "Property time zone not connected";
  $("timeline-note").textContent = `${history?.timelineLimited ? "Latest 100 time/action groups only. " : ""}Aggregated by minute, not a visitor-by-visitor log. Standard reports can take 24–48 hours to settle; realtime is shown separately above.`;
}

function renderRealtime(realtime) {
  setMetric("active", realtime?.activeUsers);
  $("live-dot").classList.toggle("active", Boolean(realtime));
  const root = $("realtime-events");
  root.replaceChildren();
  root.className = realtime?.events.length ? "activity-list" : "activity-empty";
  if (!realtime) root.textContent = "Waiting for a live connection.";
  else if (!realtime.events.length) root.textContent = "No enquiry clicks in the last 30 minutes.";
  else for (const item of realtime.events.slice(0, 5)) {
    const line = element("div", undefined, "activity-row");
    line.append(element("strong", `${labels[item.eventName] || item.eventName} · ${format(item.eventCount)} clicks`), element("span", Number(item.minutesAgo) === 0 ? "This minute" : `${item.minutesAgo} min ago`));
    root.append(line);
  }
  $("realtime-updated").textContent = realtime ? `Fetched ${localTime(realtime.fetchedAt)} IST · auto-checks every 30 seconds. Realtime covers the whole GA4 property.` : "Auto-checks every 30 seconds while this page is open.";
}

function render(data) {
  const history = data.history;
  const calls = contact(history, "phone_click");
  const whatsapp = contact(history, "whatsapp_click");
  renderSetup(data.setup);
  setMetric("visitors", history?.summary.totalUsers);
  setMetric("mumbai", history?.mumbai.totalUsers);
  setMetric("calls", calls?.eventCount);
  setMetric("whatsapp", whatsapp?.eventCount);
  $("visitors-detail").textContent = `Estimated GA4 users · ${data.selection.city === "mumbai" ? "Mumbai only" : "all cities"}`;
  $("calls-users").textContent = calls ? `${format(calls.totalUsers)} unique clicking users` : "Unique clicking users: not available";
  $("whatsapp-users").textContent = whatsapp ? `${format(whatsapp.totalUsers)} unique clicking users` : "Unique clicking users: not available";
  const connected = data.state === "connected";
  $("connection-badge").textContent = connected ? "Connected to GA4" : data.state === "setup_required" ? "Not connected yet" : "Connection needs attention";
  $("connection-badge").classList.toggle("connected", connected);
  $("notice").hidden = connected && !history?.warnings.length;
  $("notice-title").textContent = data.state === "setup_required" ? "One connection away from real results" : "A note about your reports";
  $("notice-text").textContent = data.state === "setup_required" ? "Google Analytics is not connected. Complete the setup below to see Mumbai visitors and enquiry clicks. These dashes mean unavailable—not zero traffic. Past clicks cannot be recovered if tracking was not installed." : history?.warnings.join(" ") || "Some reports could not be fetched. Unavailable data is shown as a dash, not a zero.";
  $("errors").hidden = !data.errors.length;
  $("errors").textContent = data.errors.join(" ");
  $("updated").textContent = history ? `Reports fetched ${localTime(history.fetchedAt)} IST · cached up to 5 min` : "No reporting data available";
  renderChart(history);
  renderContacts(history);
  renderCities(history);
  renderTimeline(history);
  renderRealtime(data.realtime);
}

async function refresh() {
  clearTimeout(refreshTimer);
  const id = ++requestId;
  $("refresh").disabled = true;
  try {
    const response = await fetch(`/api/dashboard?days=${days}&city=${encodeURIComponent($("city").value)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Reports could not be fetched.");
    if (id === requestId) render(data);
  } catch (error) {
    if (id !== requestId) return;
    // Clear old results rather than presenting a failed refresh as current data.
    render({ state: "partial_or_error", setup: {}, selection: { days, city: $("city").value }, history: null, realtime: null, errors: [error.message] });
    $("connection-badge").textContent = "Dashboard connection lost";
  } finally {
    if (id === requestId) {
      $("refresh").disabled = false;
      refreshTimer = setTimeout(refresh, 30000);
    }
  }
}

document.querySelectorAll("[data-days]").forEach((button) => button.addEventListener("click", () => {
  days = Number(button.dataset.days);
  document.querySelectorAll("[data-days]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  refresh();
}));
$("city").addEventListener("change", refresh);
$("refresh").addEventListener("click", refresh);
refresh();
