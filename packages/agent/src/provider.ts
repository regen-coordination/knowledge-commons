import {
  type Capture,
  MODEL,
  type ProviderResponse,
  providerRequest,
  readBounded,
} from "@knowledge-commons/pipeline";
export interface ExtractionProvider {
  extract(capture: Capture): Promise<ProviderResponse>;
}
export class OpenAIProvider implements ExtractionProvider {
  constructor(
    private readonly key: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}
  async extract(capture: Capture): Promise<ProviderResponse> {
    return this.request(providerRequest(capture));
  }
  async request(request: unknown): Promise<ProviderResponse> {
    const start = Date.now();
    const fetcher = this.fetcher;
    const response = await fetcher("https://api.openai.com/v1/responses", {
      method: "POST",
      redirect: "manual",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(90_000),
    });
    return {
      status: response.status,
      body: await readBounded(response, 256 * 1024),
      requestId: response.headers.get("x-request-id"),
      durationMs: Date.now() - start,
      requestedModel: MODEL,
      fixture: false,
    };
  }
}
