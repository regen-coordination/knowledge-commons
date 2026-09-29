import {
  digest,
  type IngestionRecord,
  type ValidationRequest,
} from "./ingestion";
import {
  assessmentBinding,
  dimensions,
  type IntegrityAssessment,
  integrityTotal,
} from "./integrity";

export const OBJECT_REPORT_LAYOUT = "commons-object-report/0.1";
export type ObjectReport = {
  name: string;
  objectId: string;
  markdown: string;
  markdownDigest: string;
};
const prose = (text: string) =>
  text
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[contact redacted]")
    .replace(/0x[a-fA-F0-9]{40,}/g, "[address redacted]")
    .replace(/[\\`*_{}[\]()<>|#!]/g, "\\$&")
    .replace(/[\r\n]+/g, " ");
const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map(prose)
    .join("\n\n");

/** Bind filenames, object identity and bytes; filenames cannot escape an export directory. */
export async function objectReportsDigest(files: ObjectReport[]) {
  if (
    !Array.isArray(files) ||
    !files.length ||
    files.length > 100 ||
    new Set(files.map((f) => f.name)).size !== files.length ||
    new Set(files.map((f) => f.objectId)).size !== files.length
  )
    throw new Error("object_report_membership_invalid");
  for (const f of files) {
    if (
      !/^(article|source|claim)-[a-z0-9-]+\.md$/.test(f.name) ||
      !/^[a-f0-9-]{36}$/.test(f.objectId) ||
      !f.name.endsWith(`-${f.objectId}.md`) ||
      typeof f.markdown !== "string" ||
      (await digest(f.markdown)) !== f.markdownDigest
    )
      throw new Error("object_report_integrity_failure");
  }
  return digest({
    layout: OBJECT_REPORT_LAYOUT,
    files: files
      .map(({ markdown: _, ...f }) => f)
      .sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export async function renderObjectReports(
  run: IngestionRecord,
  draft: ValidationRequest,
  assessment?: IntegrityAssessment,
  assessmentError?: string | null,
): Promise<ObjectReport[]> {
  const candidateDigest = await assessmentBinding(draft);
  if (
    assessment &&
    (assessment.runId !== run.id ||
      assessment.candidateDigest !== candidateDigest ||
      JSON.stringify(assessment.candidateDigests) !==
        JSON.stringify(run.candidateDigests))
  )
    throw new Error("assessment_revision_mismatch");
  const reports: ObjectReport[] = [];
  for (const object of draft.objects) {
    const rating = assessment?.output.objects.find(
      (r) => r.objectId === object.id,
    );
    const total = rating ? integrityTotal(rating.ratings) : null;
    const selected = new Set([
      ...object.evidenceRefs,
      ...Object.values(rating?.ratings ?? {}).flatMap((r) => r.evidenceRefs),
    ]);
    const evidence = draft.evidence.filter((e) => selected.has(e.id));
    const refs = new Map(evidence.map((e, i) => [e.id, `E${i + 1}`]));
    const source = draft.captures.find(
      (c) =>
        c.sourceId ===
        (object.class === "Source" ? object.id : object.sourceRefs[0]),
    );
    const sourceUrl =
      run.execution === "fixture"
        ? `https://example.org/fixture/${run.topicId}`
        : `https://hub.regencoordination.xyz/t/${run.topicId}`;
    const score =
      total?.total == null ? "Not fully assessed" : `${total.total}/10`;
    const content =
      object.class === "Article"
        ? `## Summary\n\n${prose(object.summary)}\n\n## Article\n\n${paragraphs(object.body)}\n\n## What needs checking\n\n${object.uncertainties.map((u) => `- ${prose(u)}`).join("\n") || "- Human review is pending."}`
        : object.class === "Claim"
          ? `## Claim\n\n**${prose(object.claimMode)}** — ${prose(object.statement)}\n\n- **Attribution:** ${prose(object.scope.attribution)}\n- **Evidence basis:** ${prose(object.scope.basis)}\n- **Time scope:** ${object.scope.startDate ?? "Not specified"} → ${object.scope.endDate ?? "Not specified"}\n\nPlanned means intended; reported means stated by the source; disputed means contested. Human review must check that this classification fits the cited passage.`
          : `## Source\n\n${prose(object.summary)}\n\n- **Original thread:** [Hub topic ${run.topicId}](${sourceUrl})\n- **Capture:** ${prose(object.captureStatus)} · ${source?.posts.length ?? "Unknown"} posts\n- **Retrieved:** ${object.retrievedAt}\n- **Native post IDs:** ${object.nativeIds.postIds.map(prose).join(", ")}\n- **Linked pages:** Not fetched\n- **Reuse status:** ${prose(object.reuseStatus)}`;
    const markdown = `**🌱 Regen Knowledge Commons · ${object.class} review**

# ${prose(object.title)}

${run.execution === "fixture" ? "> **SYNTHETIC FIXTURE — no live source or model assessment.**\n\n" : ""}> **Draft · Human review pending**${"  "}
> **Integrity: ${score}${rating ? " · machine assessment" : ""}**

${content}

${object.class !== "Article" && object.uncertainties.length ? `## What needs checking\n\n${object.uncertainties.map((u) => `- ${prose(u)}`).join("\n")}\n\n` : ""}## Integrity assessment

${
  rating
    ? `| Dimension | Rating | Reason | Evidence |
| --- | --- | --- | --- |
${Object.entries(rating.ratings)
  .map(
    ([key, r]) =>
      `| ${dimensions[key as keyof typeof dimensions]} | ${r.score === null ? "Not assessed" : `${r.score}/2`} | ${prose(r.reason)} | ${r.evidenceRefs.map((id) => refs.get(id) ?? "Unresolved").join(", ") || "Capture metadata / no passage reference"} |`,
  )
  .join("\n")}

**${total?.assessed}/5 dimensions assessed.** Model: ${prose(assessment?.returnedModel ?? "Unknown")}. Profile: ${assessment?.profile}.`
    : `No machine ratings are available for this object.${assessmentError ? ` Assessment status: ${prose(assessmentError)}.` : ""}`
}

Ratings use 0 = inadequate, 1 = partial, 2 = sufficient for the stated use. Missing ratings stay unassessed; a total requires all five dimensions. Machine ratings are provisional and do not supply human approval.

## Evidence

[Open source thread](${sourceUrl}). References below resolve within the private frozen capture; source text is not reproduced. Offsets use UTF-16 start inclusive, end exclusive.

${
  evidence.length
    ? `| Reference | Native post | Offsets | Relation | Limitations |
| --- | --- | --- | --- | --- |
${evidence.map((e) => `| ${refs.get(e.id)} | ${prose(e.selector.nativePostId)} | ${e.selector.start}–${e.selector.end} | ${prose(e.relation)} | ${e.limitations.map(prose).join("; ") || "None recorded"} |`).join("\n")}`
    : "This Source object records capture provenance. It has no passage-level assertions to cite."
}

## Human review

- [ ] Check this object's content and evidence, including scope and dates.
- [ ] Record independent Integrity ratings and corrections for this revision.
- [ ] Confirm reuse and intended disclosure before knowledge promotion.

Human ratings and approvals are pending. Two distinct affirmative humans must approve the exact revision and scope before promotion. PR approval covers the current report files; it does not authorize Geo publication. Ontology status: **unratified**.

<details>
<summary>Identity and provenance</summary>

- **Object ID:** ${object.id}
- **Object revision:** ${object.revision}
- **Object digest:** ${object.contentDigest}
- **Run:** ${run.id}
- **Candidate bundle:** ${candidateDigest}
- **Layout:** ${OBJECT_REPORT_LAYOUT}
- **Registry:** ${run.registryDigest}
- **Extraction model:** ${prose(run.model ?? run.requestedModel)}
- **Assessment ID:** ${assessment?.id ?? "None"}
- **Assessment revision:** ${assessment ? await digest(assessment) : "None"}
- **Scope / reuse:** ${prose(JSON.stringify(object.publicUseBoundary))}
${[...new Set([...(source ? [source.digest] : []), ...evidence.map((e) => e.sourceRevisionDigest)])].map((d) => `- **Capture digest:** ${d}`).join("\n")}
${evidence.map((e) => `- **${refs.get(e.id)} evidence ID:** ${e.id}`).join("\n")}

</details>
`;
    const slug =
      object.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48)
        .replace(/-$/g, "") || "object";
    reports.push({
      name: `${object.class.toLowerCase()}-${slug}-${object.id}.md`,
      objectId: object.id,
      markdown,
      markdownDigest: await digest(markdown),
    });
  }
  await objectReportsDigest(reports);
  return reports.sort((a, b) => a.name.localeCompare(b.name));
}
