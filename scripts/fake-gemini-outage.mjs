// Preload that makes the Gemini models listed in FAIL_MODELS answer 503, to test the route's fallback.
const failing = (process.env.FAIL_MODELS ?? "").split(",");
const realFetch = globalThis.fetch;

globalThis.fetch = (input, init) => {
  const url = String(input?.url ?? input);
  const isFailing = url.includes("generativelanguage") && failing.some((m) => m && url.includes(`/${m}:`));
  if (!isFailing) return realFetch(input, init);
  console.log("fake outage:", url.split("/models/")[1]);
  return Promise.resolve(new Response('{"error":{"code":503}}', { status: 503 }));
};
