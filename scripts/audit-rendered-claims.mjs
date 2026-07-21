import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const distDirectory = resolve("dist");

const prohibitedClaims = [
  ["Ahmedabad reference", /\bAhmedabad\b|\bAhmeda\.\.\.|\bAhm\.\.\./i],
  ["supplier reference", /\bPepperfry\b|\bWoodsworth\b|\bBetter Home India\b/i],
  ["rating claim", /\bproduct rating\b/i],
  ["warranty claim", /\b\d+[- ]year warranty\b|\bwarranty included\b|\bbacked by a warranty\b/i],
  ["unverified stock claim", /\bAvailability:\s*In stock\b|\bIn stock\b/i],
  ["unverified customization claim", /\bfully customizable\b|\bcustom sizing available\b/i],
  ["unverified made-to-order claim", /\bMade to order\b/i],
  ["unsupported delivery promise", /\bdelivery support\b|\bfree delivery\b/i],
  ["unverified origin claim", /\bimported\b|\bmade in India\b|\blocal manufacturing\b/i],
  ["unsupported installation promise", /\binstallation options for your area\b|\bfree installation\b/i],
  ["unsupported shortlisting promise", /\bwe will help shortlist\b/i],
  ["unconfirmed showroom-display claim", /\bsee materials, sizes, and finishes in person\b/i],
  ["unverified opening hours", /\bOpen daily:\s*10:00 AM\s*-\s*9:00 PM\b/i],
  ["unconfirmed postal address", /\bShop No\.\s*4\/5,\s*Nilgiri Apartments\b/i],
];

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(entryPath)));
    if (entry.isFile() && (entry.name === "index.html" || entry.name === "404.html")) {
      files.push(entryPath);
    }
  }
  return files;
}

const failures = [];
const files = await htmlFiles(distDirectory);

for (const file of files) {
  const html = await readFile(file, "utf8");
  const visibleText = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ");
  const displayPath = relative(distDirectory, file).split(sep).join("/");

  for (const [label, pattern] of prohibitedClaims) {
    const match = visibleText.match(pattern);
    if (match) failures.push(`${displayPath}: ${label} (${match[0]})`);
  }
}

if (failures.length) {
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`));
  throw new Error(`Rendered claim audit found ${failures.length} unverified claim(s).`);
}

console.log(`Rendered claim audit passed for ${files.length} HTML files.`);
