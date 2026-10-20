// Local-only entry point. Never copy the private dataset into public/ or deployment output.
import { createServer } from "node:http";
import { readFileSync, realpathSync, statSync, createReadStream } from "node:fs";
import path from "node:path";

const root = process.env.TWS_MEETING_SOURCE_DIR && realpathSync(process.env.TWS_MEETING_SOURCE_DIR);
if (!root) throw new Error("Set TWS_MEETING_SOURCE_DIR to the extracted R3 directory outside the site repository.");
const relative = path.relative(realpathSync(process.cwd()), root);
if (!relative.startsWith("..") && !path.isAbsolute(relative)) throw new Error("Private source directory must be outside the site repository.");
const index = JSON.parse(readFileSync(path.join(root, "SOURCE_INDEX.json"), "utf8"));
const records = new Map(index.map(i => [i.request_id.toLowerCase(), i]));
const sources = createServer((req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
  // Refuse DNS rebinding and remote browser origins. The server binds only to loopback.
  if (req.headers.host !== "127.0.0.1:4319" || (req.headers.origin && !/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(req.headers.origin))) { res.writeHead(403).end(); return; }
  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405).end(); return; }
  const match = /^\/(mic1-012-unseen-\d{3})\/(pdf|page\/(\d+))$/.exec(new URL(req.url, "http://127.0.0.1:4319").pathname);
  const entry = match && records.get(match[1]);
  const page = match?.[3] ? Number(match[3]) : null;
  if (!entry || (page !== null && (!Number.isInteger(page) || page < 1 || page > entry.physical_pages))) { res.writeHead(404).end(); return; }
  try {
    const file = realpathSync(path.join(root, page ? `${entry.source_images}/page-${String(page).padStart(4, "0")}.png` : entry.source_pdf));
    if (path.relative(root, file).startsWith("..") || path.isAbsolute(path.relative(root, file))) throw new Error("Unsafe source path");
    res.writeHead(200, { "Content-Type": page ? "image/png" : "application/pdf", "Content-Length": statSync(file).size });
    if (req.method === "HEAD") res.end(); else createReadStream(file).pipe(res);
  } catch { res.writeHead(404).end(); }
});
sources.listen(4319, "127.0.0.1");
console.log("Retained source viewer: http://127.0.0.1:4319/<meeting-key>/pdf or /page/<physical-page>");
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => sources.close());
sources.on("error", error => { console.error(error.message); process.exitCode = 1; });
