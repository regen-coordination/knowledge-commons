const base = process.env.PILOT_BASE_URL ?? "http://127.0.0.1:8787";
const token = process.env.PILOT_API_TOKEN;
const key = process.argv[2];
if (!token || !key || !/^[A-Za-z0-9._-]{1,128}$/.test(key)) {
  throw new Error("Set PILOT_API_TOKEN and pass a stable idempotency key");
}
const url = new URL(base);
if (
  url.protocol !== "https:" &&
  !(
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  )
) {
  throw new Error("Use HTTPS outside loopback");
}
const response = await fetch(`${url.origin}/v1/ingestions`, {
  method: "POST",
  redirect: "error",
  signal: AbortSignal.timeout(30_000),
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Idempotency-Key": key,
  },
  body: JSON.stringify({
    topicId: Number(process.argv[3] ?? 356),
    provider: "openai",
    model: "gpt-5.6-luna",
    maxCostUsd: 0.05,
  }),
});
const result = await response.json();
console.info(JSON.stringify({ status: response.status, result }));
if (response.status !== 202) process.exitCode = 1;

export {};
