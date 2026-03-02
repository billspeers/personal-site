/**
 * Cloudflare Pages Function — /api/count
 *
 * Increments a visitor counter stored in Workers KV and returns the new total.
 *
 * SETUP REQUIRED (one-time, in Cloudflare dashboard):
 *   1. Workers & Pages → KV → Create namespace → name it e.g. "SITE_KV"
 *   2. Pages → your project → Settings → Functions → KV namespace bindings
 *      Variable name : SITE_KV   (must match the binding name used below)
 *      KV namespace  : (select the one you just created)
 *   3. Redeploy — the binding is injected at runtime automatically.
 *
 * The counter key is "page_views". You can reset it any time from the KV UI.
 */

export async function onRequestPost(context) {
  const { env } = context;

  // Guard: if KV isn't bound yet, return a graceful response
  if (!env.SITE_KV) {
    return Response.json(
      { error: 'KV namespace not bound. See setup instructions in functions/api/count.js.' },
      { status: 503 }
    );
  }

  const KEY = 'page_views';

  // Read current value (null if first ever visit)
  const current = await env.SITE_KV.get(KEY);
  const next = (parseInt(current ?? '0', 10) || 0) + 1;

  // Write back — no expiration, persists forever
  await env.SITE_KV.put(KEY, String(next));

  return Response.json(
    { count: next },
    {
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// Handle preflight CORS (browsers sometimes send OPTIONS first)
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
