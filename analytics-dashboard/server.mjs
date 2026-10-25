import http from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createReporter, parseSelection, readConfig } from "./ga4.mjs";

const publicRoot = fileURLToPath(new URL("./public/", import.meta.url));
const files = { "/": ["index.html", "text/html"], "/app.js": ["app.js", "text/javascript"], "/styles.css": ["styles.css", "text/css"] };
const securityHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
};

export function createDashboardServer({ config = readConfig(), reporter = createReporter(config) } = {}) {
  return http.createServer(async (req, res) => {
    const send = (status, body, type = "application/json") => {
      res.writeHead(status, { ...securityHeaders, "Content-Type": `${type}; charset=utf-8` });
      res.end(req.method === "HEAD" ? undefined : typeof body === "string" ? body : JSON.stringify(body));
    };
    const port = req.socket.localPort;
    const allowedHosts = [`127.0.0.1:${port}`, `localhost:${port}`];
    if (!allowedHosts.includes(req.headers.host)) return send(403, { error: "Local access only." });
    if (!["GET", "HEAD"].includes(req.method)) return send(405, { error: "This dashboard is read-only." });
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith("/api/")) {
      if (req.headers["sec-fetch-site"] === "cross-site" || (req.headers.origin && !allowedHosts.some((host) => req.headers.origin === `http://${host}`))) {
        return send(403, { error: "Cross-site access is not allowed." });
      }
      const setup = {
        propertyConfigured: Boolean(config.propertyId), credentialsConfigured: config.credentialsAvailable,
        measurementConfigured: config.measurementConfigured, trackingEnabled: config.trackingEnabled,
      };
      if (url.pathname === "/api/status") return send(200, { setup, readOnly: true });
      if (url.pathname === "/api/dashboard") {
        let selection;
        try { selection = parseSelection(url.searchParams); } catch (error) { return send(400, { error: error.message }); }
        if (!setup.propertyConfigured || !setup.credentialsConfigured) {
          return send(200, { state: "setup_required", setup, selection, history: null, realtime: null, errors: [] });
        }
        try { return send(200, { ...await reporter(selection), setup }); }
        catch { return send(502, { error: "The reporting connection failed. No visitor data is available." }); }
      }
      return send(404, { error: "Not found." });
    }
    if (!files[url.pathname]) return send(404, "Not found", "text/plain");
    const [filename, type] = files[url.pathname];
    try { return send(200, await readFile(path.join(publicRoot, filename), "utf8"), type); }
    catch { return send(500, "Dashboard files are unavailable.", "text/plain"); }
  });
}

export async function startDashboard(preferredPort = Number(process.env.ANALYTICS_PORT || 4175)) {
  if (!Number.isInteger(preferredPort) || preferredPort < 1024 || preferredPort > 65525) throw new Error("ANALYTICS_PORT must be between 1024 and 65525.");
  for (let port = preferredPort; port < preferredPort + 10; port += 1) {
    const server = createDashboardServer();
    try {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", resolve);
      });
      console.log(`Lucky Analytics dashboard: http://127.0.0.1:${port}/`);
      console.log("Private, read-only. Missing configuration displays no invented traffic.");
      return server;
    } catch (error) { if (error.code !== "EADDRINUSE") throw error; }
  }
  throw new Error("No free dashboard port was found; set ANALYTICS_PORT to another local port.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startDashboard().catch(() => {
    console.error("Analytics dashboard could not start. Check the local port and configuration.");
    process.exitCode = 1;
  });
}
