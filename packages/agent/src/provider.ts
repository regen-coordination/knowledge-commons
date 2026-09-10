import {
  type Capture,
  MODEL,
  type ProviderResponse,
  readBounded,
} from "@knowledge-commons/pipeline";
import type { ExtractionRequest } from "./extraction-input";
export interface ExtractionProvider {
  extract(
    capture: Capture,
    request: ExtractionRequest,
  ): Promise<ProviderResponse>;
}
export class OpenAIProvider implements ExtractionProvider {
  constructor(
    private readonly key: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}
  async extract(
    _capture: Capture,
    request: ExtractionRequest,
  ): Promise<ProviderResponse> {
    return this.request(request);
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
