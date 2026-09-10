import { describe, expect, test } from "bun:test";
import { validDraft } from "../../ontology/fixtures/draft";
import app from "./index";

const token = "test-only-".repeat(8);
const env = { PILOT_API_TOKEN: token };
const auth = { Authorization: `Bearer ${token}` };

describe("pilot endpoints", () => {
  test("health reveals only liveness without configured secrets", async () => {
    const response = await app.request("/health", {}, {});
    expect(response.status).toBe(200);
    expect(await response.json<{ ok: boolean }>()).toEqual({ ok: true });
  });
  for (const path of ["/ready", "/v1/ontology", "/v1/validate", "/unknown"]) {
    test(`${path} rejects missing and wrong credentials`, async () => {
      for (const headers of [
        {},
        { Authorization: "Bearer wrong" },
        { Authorization: `Basic ${token}` },
      ]) {
        const response = await app.request(
          path,
          { headers: new Headers(headers as Record<string, string>) },
          env,
        );
        expect(response.status).toBe(401);
        expect(response.headers.get("WWW-Authenticate")).toContain("Bearer");
        expect(await response.text()).not.toContain(token);
      }
    });
  }
  test("missing or weak configuration fails closed", async () => {
    for (const secret of [undefined, "short", `${token} `]) {
      const response = await app.request(
        "/ready",
        { headers: auth },
        { PILOT_API_TOKEN: secret },
      );
      expect(response.status).toBe(503);
    }
  });
  test("readiness distinguishes foundation from ingestion", async () => {
    const response = await app.request("/ready", { headers: auth }, env);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ready: true,
      ingestion: { implemented: true, verified: false },
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  test("ontology is unratified with reproducible registry", async () => {
    const first = await app.request("/v1/ontology", { headers: auth }, env);
    const second = await app.request("/v1/ontology", { headers: auth }, env);
    const body = await first.json<Record<string, unknown>>();
    expect(body).toEqual(await second.json());
    expect(body.status).toBe("unratified");
    expect(body.pin).toBeNull();
    expect(body.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(body.enabledClasses).toEqual(["Article", "Source", "Claim"]);
  });
  const post = (body: string, headers = {}) =>
    app.request(
      "/v1/validate",
      {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json", ...headers },
        body,
      },
      env,
    );
  test("validates a complete draft without returning source text", async () => {
    const response = await post(JSON.stringify(await validDraft()));
    expect(response.status).toBe(200);
    expect(
      await response.json<{ valid: boolean; issues: unknown[] }>(),
    ).toEqual({ valid: true, issues: [] });
  });
  test("returns useful validation paths for malformed candidates", async () => {
    const response = await post('{"objects":[]}');
    expect(response.status).toBe(422);
    expect(
      (await response.json<{ issues: { path: string }[] }>()).issues[0]!.path,
    ).toBe("objects");
  });
  test("malformed JSON, media type, oversized body", async () => {
    expect((await post("{")).status).toBe(400);
    expect((await post("{}", { "Content-Type": "text/plain" })).status).toBe(
      415,
    );
    expect((await post("x".repeat(256 * 1024 + 1))).status).toBe(413);
  });
});
