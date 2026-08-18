export function buildRequestHeaders(
  initial: Record<string, string> | undefined,
  hasBody: boolean
): Record<string, string> {
  const headers: Record<string, string> = {};
  let hasContentType = false;

  for (const [key, value] of Object.entries(initial ?? {})) {
    if (key.toLowerCase() === "content-type") {
      if (!hasBody) continue;
      hasContentType = true;
    }
    headers[key] = value;
  }

  if (hasBody && !hasContentType) headers["Content-Type"] = "application/json";
  return headers;
}
