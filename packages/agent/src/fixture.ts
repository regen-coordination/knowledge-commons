import {
  type Capture,
  type CapturePacket,
  captureDigest,
  type Extraction,
  MODEL,
  type ProviderResponse,
  stableId,
} from "@knowledge-commons/pipeline";
import type { ExtractionProvider } from "./provider";
export async function fixtureCapture(
  now: string,
  topicId: 235 | 356 = 235,
): Promise<CapturePacket> {
  const capture: Capture = {
    sourceId: await stableId(`fixture:topic-${topicId}`),
    sourceSystem: "synthetic-fixture",
    topicId: String(topicId),
    url: `https://example.org/fixture/${topicId}`,
    retrievedAt: now,
    digest: `sha256:${"0".repeat(64)}`,
    captureRef: `fixture:${topicId}:${now}`,
    status: "complete",
    depth: 0,
    expectedPostIds: ["fixture-466", "fixture-467"],
    posts: [
      {
        nativePostId: "fixture-466",
        postNumber: 1,
        author: "Synthetic author",
        createdAt: now,
        updatedAt: null,
        text: "We propose a community garden and funding pool. The community garden is still a draft.",
      },
      {
        nativePostId: "fixture-467",
        postNumber: 2,
        author: "Synthetic reviewer",
        createdAt: now,
        updatedAt: null,
        text: "Please clarify the historical funding deadline before describing the offer.",
      },
    ],
  };
  capture.digest = await captureDigest(capture);
  return {
    capture,
    title: "Synthetic community garden proposal",
    access: { depth: 0, linkedPages: "not-fetched", reuse: "unknown" },
    requests: [],
    raw: [],
  };
}
export class FixtureProvider implements ExtractionProvider {
  async extract(capture: Capture): Promise<ProviderResponse> {
    const citation = {
      nativePostId: capture.posts[0]?.nativePostId ?? "missing",
      passageId: "p0001",
      relation: "supports" as const,
      limitations: ["Synthetic evidence only"],
    };
    const extraction: Extraction = {
      article: {
        title: "Synthetic community garden proposal",
        summary:
          "A synthetic thread proposes a community garden and funding pool; implementation is not established.",
        body: "The synthetic author proposes a community garden and funding pool. A reply requests clarity about a historical deadline.",
        purpose: "Test planned-versus-reported handling",
        citations: [citation],
      },
      claims: [
        {
          title: "Proposed community garden",
          statement:
            "The synthetic author proposes a community garden and funding pool.",
          mode: "planned",
          attribution: "Synthetic author",
          startDate: null,
          endDate: null,
          citations: [citation],
        },
      ],
      uncertainties: [
        "Not live source evidence",
        "Funding availability is not established",
      ],
    };
    return {
      status: 200,
      body: JSON.stringify({
        status: "completed",
        model: `fixture:${MODEL}`,
        output: [
          {
            type: "message",
            content: [
              { type: "output_text", text: JSON.stringify(extraction) },
            ],
          },
        ],
        usage: { input_tokens: 0, output_tokens: 0 },
      }),
      requestId: null,
      durationMs: 0,
      requestedModel: MODEL,
      fixture: true,
    };
  }
}
