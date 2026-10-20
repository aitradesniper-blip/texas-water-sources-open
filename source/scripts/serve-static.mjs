import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT || 3000);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".jsonl": "application/x-ndjson; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    const relative = normalize(pathname).replace(/^([/\\])+/, "");
    let file = resolve(join(root, relative));
    if (file !== root && !file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const cleanUrlFile = file;
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      file = join(file, "index.html");
      info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        file = `${cleanUrlFile}.html`;
        info = await stat(file).catch(() => null);
      }
    }
    if (!info?.isFile() && !extname(file)) {
      file = `${file}.html`;
      info = await stat(file).catch(() => null);
    }
    if (!info?.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extname(file).toLowerCase()] || "application/octet-stream",
      "Content-Length": info.size,
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(400).end("Bad request");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Texas Water Sources preview: http://127.0.0.1:${port}`);
});
