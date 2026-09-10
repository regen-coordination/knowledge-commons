import { mkdir } from "node:fs/promises";
import { captureTopic, topicIdSchema } from "../packages/pipeline/src/index";

const topicId = topicIdSchema.parse(Number(process.argv[2] ?? 356));
const packet = await captureTopic(fetch, new Date().toISOString(), topicId);
const dir = new URL(`../raw-captures/topic-${topicId}/`, import.meta.url);
await mkdir(dir, { recursive: true });
const name = `${packet.capture.digest.slice(7)}.json`;
await Bun.write(new URL(name, dir), JSON.stringify(packet, null, 2));
console.info(
  JSON.stringify({
    topicId,
    posts: packet.capture.posts.length,
    nativePostIds: packet.capture.expectedPostIds,
    status: packet.capture.status,
    digest: packet.capture.digest,
    path: `raw-captures/topic-${topicId}/${name}`,
  }),
);
