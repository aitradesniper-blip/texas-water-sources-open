import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PROPERTY_REPORT_PRODUCTION_ORIGIN =
  "https://property-water-free-lookup-hwuqkmnvqq-vp.a.run.app";
export const PROPERTY_REPORT_DISCONNECTED_COPY =
  "The free report is not connected right now";

const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".txt",
  ".xml",
]);
const ARCGIS_SECRET_PATTERNS = [
  /(?:ARCGIS[_-]?(?:API[_-]?KEY|TOKEN)|arcgis(?:ApiKey|Token))\s*["']?\s*[:=]\s*["']?[A-Za-z0-9._~-]{16,}/i,
  /[?&](?:api[_-]?key|token)=[A-Za-z0-9._~-]{16,}/i,
];

async function collectTextFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectTextFiles(path));
    else if (TEXT_FILE_EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

export async function checkPropertyReportProductionConnection({
  artifactRoot,
  configuredOrigin,
} = {}) {
  const root = resolve(artifactRoot ?? resolve(dirname(fileURLToPath(import.meta.url)), "../dist/client"));
  const origin = configuredOrigin?.trim() ?? "";

  if (!origin) {
    throw new Error("NEXT_PUBLIC_TWS_FREE_LOOKUP_API_URL is required for a production connection check.");
  }
  if (origin !== PROPERTY_REPORT_PRODUCTION_ORIGIN) {
    throw new Error(
      `NEXT_PUBLIC_TWS_FREE_LOOKUP_API_URL must exactly equal ${PROPERTY_REPORT_PRODUCTION_ORIGIN}.`,
    );
  }

  const propertyReportPath = resolve(root, "property-water-report.html");
  let propertyReportHtml;
  try {
    propertyReportHtml = await readFile(propertyReportPath, "utf8");
  } catch (error) {
    throw new Error(`Generated Property Report HTML is missing: ${propertyReportPath}`, { cause: error });
  }

  if (!propertyReportHtml.includes(origin)) {
    throw new Error("Generated Property Report application does not contain the configured production API origin.");
  }
  if (!/class="[^"]*\blookup-form\b[^"]*"/.test(propertyReportHtml)) {
    throw new Error("Generated Property Report HTML does not contain the lookup form.");
  }
  if (propertyReportHtml.includes(PROPERTY_REPORT_DISCONNECTED_COPY)) {
    throw new Error("Generated Property Report HTML contains the disconnected fallback copy.");
  }

  const generatedFiles = await collectTextFiles(root);
  for (const path of generatedFiles) {
    const contents = await readFile(path, "utf8");
    if (ARCGIS_SECRET_PATTERNS.some((pattern) => pattern.test(contents))) {
      throw new Error(`Generated static files contain a possible ArcGIS secret or API key: ${path}`);
    }
  }

  return {
    artifactRoot: root,
    origin,
    propertyReportPath,
    generatedFilesChecked: generatedFiles.length,
  };
}

const invokedAsScript = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (invokedAsScript) {
  try {
    const result = await checkPropertyReportProductionConnection({
      configuredOrigin: process.env.NEXT_PUBLIC_TWS_FREE_LOOKUP_API_URL,
    });
    console.log(
      `PASS Property Report production connection: ${result.origin} (${result.generatedFilesChecked} generated text files checked)`,
    );
  } catch (error) {
    console.error(`FAIL Property Report production connection: ${error.message}`);
    process.exitCode = 1;
  }
}
