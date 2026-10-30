import { expect, test } from "bun:test";
import { MODEL, parseProvider } from "@knowledge-commons/pipeline";
import { FixtureProvider, fixtureCapture } from "./fixture";
import { OpenAIProvider } from "./provider";

test("OpenAI adapter uses documented Responses settings and no tools", async () => {
  const capture = (await fixtureCapture(new Date().toISOString())).capture;
  const fake = await new FixtureProvider().extract(capture);
  const fetcher = async function (
    this: unknown,
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    expect(this).toBeUndefined();
    expect(String(input)).toBe("https://api.openai.com/v1/responses");
    expect(init?.redirect).toBe("manual");
    const request = JSON.parse(String(init?.body));
    expect(request.model).toBe(MODEL);
    expect(request.reasoning).toEqual({ effort: "low" });
    expect(request.store).toBe(false);
    expect(request.max_output_tokens).toBe(4096);
    expect(request.tools).toBeUndefined();
    expect(request.text.format.strict).toBe(true);
    return new Response(fake.body, {
      headers: { "x-request-id": "synthetic-request" },
    });
  } as typeof fetch;
  const result = await new OpenAIProvider("test-key", fetcher).extract(capture);
  expect(result.fixture).toBe(false);
  expect(result.requestId).toBe("synthetic-request");
  expect(parseProvider(result).extraction.claims[0]?.mode).toBe("planned");
});
