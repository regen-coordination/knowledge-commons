import { expect, test } from "bun:test";
import { captureTopic, verifyCapture } from "./ingestion";

const time = "2026-09-09T00:00:00Z";
const post = (id: number, number: number) => ({
  id,
  post_number: number,
  topic_id: 235,
  username: "synthetic",
  created_at: time,
  updated_at: time,
  raw: `Synthetic post ${id}.`,
});
const topic = {
  id: 235,
  title: "Synthetic topic",
  posts_count: 2,
  visible: true,
  post_stream: { stream: [466, 900], posts: [post(466, 1)] },
};
test("alternate demo topic is explicit and rejects wrong topic readback", async () => {
  const fetcher = (async () =>
    Response.json({
      ...topic,
      id: 356,
      post_stream: {
        stream: [466, 900],
        posts: [
          { ...post(466, 1), topic_id: 356 },
          { ...post(900, 2), topic_id: 356 },
        ],
      },
    })) as unknown as typeof fetch;
  const capture = await captureTopic(fetcher, time, 356);
  expect(capture.capture.topicId).toBe("356");
  expect(capture.capture.url).toEndWith("/356");
  await expect(captureTopic(fetcher, time, 235)).rejects.toThrow(
    "source_topic_mismatch",
  );
});
test("captures paginated native replies, keeps post numbers separate, never follows links", async () => {
  const paths: string[] = [];
  const fetcher = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    paths.push(url.pathname);
    return Response.json(
      url.pathname === "/posts/900.json" ? post(900, 2) : topic,
    );
  }) as unknown as typeof fetch;
  const packet = await captureTopic(fetcher, time);
  await verifyCapture(packet.capture);
  expect(packet.capture.expectedPostIds).toEqual(["466", "900"]);
  expect(packet.capture.posts.map((p) => p.postNumber)).toEqual([1, 2]);
  expect(paths).toEqual([
    "/t/235.json",
    "/posts/900.json",
    "/t/235.json",
    "/posts/900.json",
  ]);
  expect(packet.access.linkedPages).toBe("not-fetched");
});
test("manifest mismatch and changing post revision fail capture", async () => {
  const bad = (async () =>
    Response.json({ ...topic, posts_count: 3 })) as unknown as typeof fetch;
  await expect(captureTopic(bad, time)).rejects.toThrow("incomplete_capture");
  let calls = 0;
  const changed = (async (input: RequestInfo | URL) => {
    if (String(input).includes("/posts/900"))
      return Response.json(post(900, 2));
    calls++;
    return Response.json(
      calls === 1
        ? topic
        : {
            ...topic,
            post_stream: {
              ...topic.post_stream,
              posts: [{ ...post(466, 1), raw: "Edited text" }],
            },
          },
    );
  }) as unknown as typeof fetch;
  await expect(captureTopic(changed, time)).rejects.toThrow(
    "source_changed_during_capture",
  );
});
test("source HTTP errors are explicit and bounded", async () => {
  const unavailable = (async () =>
    new Response("no", { status: 403 })) as unknown as typeof fetch;
  await expect(captureTopic(unavailable, time)).rejects.toThrow(
    "source_http_403",
  );
});

test("redirects are rejected without following unapproved source URLs", async () => {
  const redirect = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    expect(init?.redirect).toBe("manual");
    return new Response(null, {
      status: 302,
      headers: { Location: "https://unapproved.example" },
    });
  }) as typeof fetch;
  await expect(captureTopic(redirect, time)).rejects.toThrow("source_http_302");
});

test("passage IDs preserve exact Markdown, repeated lines, and UTF-16 offsets", async () => {
  const { passages } = await import("./ingestion");
  const raw = `# Heading\n\n**Funding** is proposed.\n**Funding** is proposed.\n${"x".repeat(399)}🌱 end`;
  const parts = passages(raw);
  expect(parts.every((p) => raw.slice(p.start, p.end) === p.text)).toBe(true);
  expect(new Set(parts.map((p) => p.id)).size).toBe(parts.length);
  expect(parts[1]?.text).toBe(parts[2]?.text);
  expect(parts[1]?.start).not.toBe(parts[2]?.start);
  expect(parts.every((p) => !/[\uD800-\uDBFF]$/.test(p.text))).toBe(true);
});
