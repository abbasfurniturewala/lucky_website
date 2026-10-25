import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { createDashboardServer } from "./server.mjs";

test("private server serves the dashboard without credentials, fake zeros, external requests or write endpoints", async (t) => {
  let requests = 0;
  const config = { propertyId: "", credentialsAvailable: false, measurementConfigured: false, trackingEnabled: false };
  const server = createDashboardServer({ config, reporter: async () => { requests += 1; } });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}`;
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Your website, at a glance/);
  assert.match(page.headers.get("content-security-policy"), /connect-src 'self'/);
  assert.equal(page.headers.get("x-robots-tag"), "noindex, nofollow");
  const data = await (await fetch(`${url}/api/dashboard`)).json();
  assert.equal(data.state, "setup_required");
  assert.equal(data.history, null);
  assert.equal(data.realtime, null);
  assert.equal(requests, 0);
  assert.equal((await fetch(`${url}/api/dashboard?days=999`)).status, 400);
  assert.equal((await fetch(`${url}/.env.local`)).status, 404);
  assert.equal((await fetch(`${url}/api/dashboard`, { method: "POST" })).status, 405);
  assert.equal((await fetch(`${url}/api/dashboard`, { headers: { Origin: "https://evil.example" } })).status, 403);
  assert.equal((await fetch(`${url}/api/dashboard`, { headers: { "Sec-Fetch-Site": "cross-site" } })).status, 403);
  const rebinding = await new Promise((resolve, reject) => {
    http.get({ hostname: "127.0.0.1", port, path: "/api/status", headers: { Host: `evil.example:${port}` } }, (response) => { response.resume(); resolve(response.statusCode); }).on("error", reject);
  });
  assert.equal(rebinding, 403);
});
