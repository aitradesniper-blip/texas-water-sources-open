const FORMSPREE_ORIGIN = "https://formspree.io";
const FORMSPREE_FORM_PATH = /^\/f\/[a-z0-9]+$/;

export function validateFeedbackFormEndpoint(
  rawValue: string | undefined,
  { required = false }: { required?: boolean } = {},
): string {
  const value = rawValue?.trim() ?? "";
  if (!value) {
    if (required) throw new Error("The public feedback form endpoint is required for a production build.");
    return "";
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("The public feedback form endpoint must be an absolute URL.");
  }
  if (parsed.origin !== FORMSPREE_ORIGIN || parsed.protocol !== "https:") {
    throw new Error("The public feedback form endpoint must use the expected HTTPS Formspree origin.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("The public feedback form endpoint cannot contain credentials.");
  }
  if (parsed.search || parsed.hash) {
    throw new Error("The public feedback form endpoint cannot contain a query or fragment.");
  }
  if (!FORMSPREE_FORM_PATH.test(parsed.pathname)) {
    throw new Error("The public feedback form endpoint must use the expected /f/{form-id} path.");
  }
  return `${parsed.origin}${parsed.pathname}`;
}
