const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function validateFreePropertyWaterApiOrigin(rawValue: string | undefined): string {
  const value = rawValue?.trim() ?? "";
  if (!value) return "";
  if (value.includes("*")) throw new Error("The free property-water API URL cannot contain a wildcard.");

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("The free property-water API URL must be an absolute URL.");
  }
  const localHttp = parsed.protocol === "http:" && LOOPBACK_HOSTS.has(parsed.hostname);
  if (parsed.protocol !== "https:" && !localHttp) {
    throw new Error("The free property-water API URL must use HTTPS except for localhost.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("The free property-water API URL cannot contain credentials.");
  }
  if (parsed.search || parsed.hash) {
    throw new Error("The free property-water API URL cannot contain a query or fragment.");
  }
  if (parsed.pathname !== "/") {
    throw new Error("The free property-water API URL must be an endpoint origin without a path.");
  }
  return parsed.origin;
}
