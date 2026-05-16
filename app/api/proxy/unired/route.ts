export const runtime = "edge";

const UNIRED_AUTH =
  "Basic OSUyYlRGeWpHZ2FOMHFYcHVBcFg3JTJmdFZWOTFVa21KZHB2SkxQZHRmcjlYOVpqNjc3ZnR1NkFNTTdSWXNscWVDeFg=";

const UNIRED_HEADERS = {
  Authorization: UNIRED_AUTH,
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  Origin: "https://www.unired.cl",
  Referer: "https://www.unired.cl/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

/**
 * Proxy Edge para Unired — evita el bloqueo de IPs de Vercel Lambda (AWS).
 * Edge corre en Cloudflare, con IPs distintas que tienen más chance de pasar.
 *
 * Body: { endpoint: string, payload: unknown }
 */
export async function POST(req: Request) {
  try {
    const { endpoint, payload } = await req.json();

    if (!endpoint || !payload) {
      return Response.json({ error: "Faltan endpoint o payload" }, { status: 400 });
    }

    const uniredRes = await fetch(`https://apiportal.unired.cl${endpoint}`, {
      method: "POST",
      headers: UNIRED_HEADERS,
      body: JSON.stringify(payload),
    });

    const contentType = uniredRes.headers.get("content-type") || "";
    const rawText = await uniredRes.text();
    console.log("[UniredProxy] Status:", uniredRes.status, "| CT:", contentType);
    console.log("[UniredProxy] Body:", rawText.substring(0, 500));

    if (!contentType.includes("json")) {
      return Response.json(
        { error: `Unired respondió ${uniredRes.status} (no JSON)`, raw: rawText.substring(0, 300) },
        { status: 502 }
      );
    }

    const data = JSON.parse(rawText);
    return Response.json(data);
  } catch (err: any) {
    console.error("[UniredProxy] Error:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
