import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  validateGcdPublicEventPackage,
  type GcdPublicEventPackage,
} from "@/lib/gcd-public-events";

const packageRoot = join(process.cwd(), "data", "gcd-public-events", "v1");

function readArtifact(name: string): Buffer {
  return readFileSync(join(packageRoot, name));
}

function parseJson(bytes: Buffer, label: string): unknown {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error(`Invalid GCD public-event package: ${label} is not valid JSON`);
  }
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

let cachedPackage: GcdPublicEventPackage | null = null;

export function loadGcdPublicEventPackage(): GcdPublicEventPackage {
  if (cachedPackage) return cachedPackage;
  const feed = readArtifact("gcd_public_event_feed_v1.jsonl");
  const manifest = readArtifact("gcd_public_event_release_manifest_v1.json");
  const producerValidation = readArtifact("gcd_public_event_release_validation_v1.json");
  const publicEventSchema = readArtifact("gcd_public_event_feed_v1.schema.json");
  const consumerProvenance = readArtifact("consumer_provenance.json");
  const consumerValidation = readArtifact("consumer_validation.json");
  cachedPackage = validateGcdPublicEventPackage({
    feedText: feed.toString("utf8"),
    feedSha256: sha256(feed),
    manifest: parseJson(manifest, "producer manifest"),
    manifestSha256: sha256(manifest),
    producerValidation: parseJson(producerValidation, "producer validation"),
    producerValidationSha256: sha256(producerValidation),
    publicEventSchema: parseJson(publicEventSchema, "public event schema"),
    publicEventSchemaSha256: sha256(publicEventSchema),
    consumerProvenance: parseJson(consumerProvenance, "consumer provenance"),
    consumerValidation: parseJson(consumerValidation, "consumer validation"),
  });
  return cachedPackage;
}
