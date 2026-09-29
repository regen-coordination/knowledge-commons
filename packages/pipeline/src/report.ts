import type {
  IngestionRecord,
  KnowledgeObject,
  ValidationRequest,
} from "./ingestion";
import {
  dimensions,
  type IntegrityAssessment,
  integrityTotal,
} from "./integrity";
import { reportProse as prose } from "./report-prose";

export function renderReport(
  run: IngestionRecord,
  draft: ValidationRequest,
  assessment?: IntegrityAssessment,
): string {
  const article = draft.objects.find((o) => o.class === "Article");
  if (
    assessment &&
    (assessment.runId !== run.id ||
      JSON.stringify(assessment.candidateDigests) !==
        JSON.stringify(run.candidateDigests))
  )
    throw new Error("assessment_revision_mismatch");
  const primaryRating = assessment?.output.objects.find(
    (o) => o.objectId === article?.id,
  );
  const primaryTotal = primaryRating
    ? integrityTotal(primaryRating.ratings)
    : null;
  const scoreLabel =
    primaryTotal?.total != null
      ? `${primaryTotal.total}/10 for the Article · ${assessment?.fixture ? "synthetic machine assessment" : "machine assessment"}`
      : "not assessed completely yet";
  const assessmentSection = assessment
    ? `**${scoreLabel}** · Human ratings pending

This machine assessment reviews the exact candidate against its frozen evidence. It is provisional, not calibrated, and is not approval to publish. Each object has its own ratings; the headline is the Article's score, not a combined score for the whole report.

${[...assessment.output.objects]
  .sort(
    (a, b) =>
      Number(b.objectId === article?.id) - Number(a.objectId === article?.id),
  )
  .map((item, index) => {
    const object = draft.objects.find((o) => o.id === item.objectId);
    const total = integrityTotal(item.ratings);
    return `${index === 1 ? "<details>\n<summary>Individual scores for Source and Claims</summary>\n\n" : ""}### ${object?.class}: ${prose(object?.title ?? item.objectId)}

**${total.total === null ? "Total not available" : `${total.total}/10`} · ${total.assessed}/5 dimensions assessed**

| Dimension | Rating | Reason |
| --- | --- | --- |
${Object.entries(item.ratings)
  .map(
    ([key, r]) =>
      `| ${dimensions[key as keyof typeof dimensions]} | ${r.score === null ? "Not assessed" : `${r.score}/2`} | ${prose(r.reason)} |`,
  )
  .join("\n")}

*Evidence references: ${[...new Set(Object.values(item.ratings).flatMap((r) => r.evidenceRefs))].map((id) => `E${draft.evidence.findIndex((e) => e.id === id) + 1}`).join(", ") || "Capture metadata / no passage references"}.*`;
  })
  .join("\n\n")}

${assessment.output.objects.length > 1 ? "</details>" : ""}

**Scale:** 0 = inadequate · 1 = partial · 2 = sufficient for the stated use. Null ratings are missing assessments, not zero. A total requires all five dimensions; it is not a probability of truth.

*Assessor: machine (${prose(assessment.returnedModel)}) · Profile: ${assessment.profile} · Human and machine ratings remain separate.*`
    : null;

  const claims = draft.objects.filter((o) => o.class === "Claim");
  const fixture = run.execution === "fixture";
  const sourceUrl = fixture
    ? `https://example.org/fixture/${run.topicId}`
    : `https://hub.regencoordination.xyz/t/${run.topicId}`;
  const evidenceLabels = new Map(
    draft.evidence.map((e, i) => [e.id, `E${i + 1}`]),
  );
  const captureDigests = [
    ...new Set(draft.evidence.map((e) => e.sourceRevisionDigest)),
  ];
  const evidenceFor = (object: KnowledgeObject) =>
    object.evidenceRefs
      .map((id) => evidenceLabels.get(id) ?? "Unresolved evidence")
      .join(", ") || "No passage references";
  const findings = claims
    .map(
      (claim, i) =>
        `### ${i + 1}. ${prose(claim.title)}

**${prose(claim.claimMode.charAt(0).toUpperCase() + claim.claimMode.slice(1))}** — ${prose(claim.summary)}

*Attributed to ${prose(claim.scope.attribution)}. Evidence: ${evidenceFor(claim)}.*`,
    )
    .join("\n\n");
  const uncertainties = article?.uncertainties.length
    ? article.uncertainties.map((item) => `- ${prose(item)}`).join("\n")
    : "- No additional uncertainty was recorded by the model. Human review is still needed.";
  const evidenceRows = draft.evidence
    .map(
      (e, i) =>
        `| E${i + 1} | ${prose(e.selector.nativePostId)} | ${e.selector.start}–${e.selector.end} | ${prose(e.relation)} | C${captureDigests.indexOf(e.sourceRevisionDigest) + 1} |`,
    )
    .join("\n");
  const objectDetails = draft.objects
    .map(
      (object) =>
        `- **${object.class}: ${prose(object.title)}**\n  - Object ID: ${object.id}\n  - Evidence: ${object.class === "Source" ? "Frozen source provenance; reuse rights unknown" : evidenceFor(object)}`,
    )
    .join("\n");
  const usage = run.modelUsage;
  const cost =
    usage?.costUsd == null
      ? "Not available"
      : `USD ${usage.costUsd.toFixed(6)}`;
  const duration =
    run.durationMs == null
      ? "Not available"
      : `${(run.durationMs / 1000).toFixed(2)} seconds`;
  const validation = run.validation?.valid
    ? "Passed"
    : run.validation
      ? "Failed"
      : "Not checked";
  const postCount =
    run.capturedPosts == null
      ? "Post count unknown"
      : `${run.capturedPosts} ${run.capturedPosts === 1 ? "post" : "posts"}`;

  return `# 🌱 Regen Knowledge Commons

## Ingestion review

${fixture ? "> **SYNTHETIC FIXTURE — not a live Hub ingestion.**\n\n" : ""}> **${run.validation?.valid ? "Ready for human review" : "Needs validation"} · Draft and unapproved**
>
> **Integrity score: ${assessment ? scoreLabel : "not assessed yet"}.** ${assessment ? "Machine assessment; human review pending." : "No reviewer has rated the five dimensions. This is not a score of zero."}

### At a glance

- **Source:** [Hub topic ${run.topicId}${fixture ? " · synthetic" : ""}](${sourceUrl})
- **Captured:** ${prose(run.captureStatus ?? "Unknown")} · ${postCount} · linked pages excluded
- **Draft output:** ${draft.objects.filter((o) => o.class === "Article").length} Article · ${draft.objects.filter((o) => o.class === "Source").length} Source · ${claims.length} ${claims.length === 1 ? "Claim" : "Claims"}
- **Automated checks:** ${validation} — structure and evidence references
- **Human approvals:** 0 of 2 recorded

## The takeaway

${prose(article?.summary ?? "A draft was produced for review.")}

## What the source says

*Planned* means proposed or intended. *Reported* means stated by the source, without independent verification. *Disputed* means contested in the evidence.

${findings || "No Claims proposed. Review the Article and its uncertainties."}

## What still needs checking

${uncertainties}

- **Evidence:** Resolving a passage does not establish that it supports every part of a claim.
- **Reuse:** Rights remain unknown. No public release or Geo submission has been made.

## Integrity score

${
  assessmentSection ??
  `**Not available · 0 of 5 dimensions assessed**

The ingestion currently checks structure and exact passage references. It does **not** perform a scored Integrity assessment. A reviewer must rate the candidate against its evidence and record a reason for each rating.

| Dimension | Rating | Review question |
| --- | --- | --- |
| Origin & independence | Not assessed | Who is the source, and is there independent support? |
| Evidence traceability | Not assessed | Does every material assertion have supporting evidence? |
| Support & uncertainty | Not assessed | Does the wording match what the evidence establishes? |
| Context & usefulness | Not assessed | Are dates, conditions, and intended use clear? |
| Contest & public use | Not assessed | Are disputes, corrections, and reuse limits addressed? |

**Scale:** 0 = inadequate · 1 = partial · 2 = sufficient for the stated use. A total **out of 10** is shown only after all five ratings exist. It is not a probability of truth or a publication approval.

*Profile: commons-pilot-integrity/0.1-draft · Assessor: not assigned · Human and machine ratings must remain separate.*
`
}

## Extraction snapshot

- **${fixture ? "Adapter" : "Provider"}:** ${fixture ? "Synthetic fixture; no live model call" : "OpenAI"}
- **Model:** ${fixture ? "Not run — fixture output only" : prose(run.model ?? run.requestedModel)}
- **Estimated cost:** ${cost}${fixture ? " (fixture)" : ""}
- **Provider time:** ${duration}

Cost is an estimate, not an invoice. OpenAI/Luna is the current setup. Other model comparisons are deferred; no comparative winner has been established.

${
  assessment
    ? `## Assessment snapshot

- **Model:** ${prose(assessment.returnedModel)}
- **Estimated cost:** USD ${assessment.usage.costUsd ?? "unknown"}
- **Provider time:** ${(assessment.durationMs / 1000).toFixed(2)} seconds
- **Assessment ID:** ${assessment.id}

`
    : ""
}## Next: human review

- [ ] Check each claim against its cited passages, including dates and omissions.
- [ ] Score all five Integrity dimensions with reasons tied to this candidate revision.
- [ ] Resolve reuse limits and confirm the intended scope.
- [ ] Record two distinct affirmative human approvals of the exact revision and scope before promotion.

**Reviewer 1:** unassigned · **Reviewer 2:** unassigned. No binding approvals recorded.

**Publication:** disabled. The ontology is draft and unratified; no Afo pin is recorded.

---

<details>
<summary>Evidence and proposed objects</summary>

**Source title:** ${prose(run.sourceTitle ?? `Topic ${run.topicId}`)}

${objectDetails}

Evidence labels identify exact passages in the private frozen capture. Offsets are UTF-16 start–end positions. Source text is not reproduced here.

| Reference | Native post | Offsets | Relation | Capture |
| --- | --- | --- | --- | --- |
${evidenceRows}

${captureDigests.map((value, i) => `- **C${i + 1}:** ${value}`).join("\n")}

</details>

<details>
<summary>Run record, revisions, and usage</summary>

- **Run:** ${run.id}
- **Created (UTC):** ${run.createdAt}
- **Report layout:** commons-report/0.3
- **Stage:** machine extraction and validation; human content/Integrity assessment pending
- **Validation:** ${validation}
- **Ontology:** ${run.ontologyVersion} · unratified · ${run.registryDigest}
- **Code at submission:** ${prose(run.codeRevision)}
- **Execution revisions:** ${(run.executionRevisions ?? [run.codeRevision]).join(", ")}
- **Prompt:** ${run.promptVersion} · ${run.promptDigest}
- **Extraction schema:** ${run.extractionSchemaDigest}
- **Requested model:** ${prose(run.requestedModel)}
- **Returned model:** ${prose(run.model ?? "Not reported")}
- **Provider request ID:** ${prose(run.providerRequestId ?? "Not reported")}
- **Settings:** reasoning low; max_output_tokens 4096; structured JSON; store false; no tools
- **Input tokens:** ${usage?.inputTokens ?? "Unknown"}
- **Cached input tokens:** ${usage?.cachedInputTokens ?? "Unknown"}
- **Output tokens:** ${usage?.outputTokens ?? "Unknown"}
- **Reasoning tokens (included in output):** ${usage?.reasoningTokens ?? "Unknown"}
- **Estimated cost (unrounded USD):** ${usage?.costUsd ?? "Unknown"}
- **Provider duration (ms):** ${run.durationMs ?? "Unknown"}
- **Attempt:** ${run.attempt} · no repair calls
- **Failure:** ${prose(run.failure?.code ?? "None")}
- **Depth:** 0; linked pages not fetched

Unknown usage is never zero. Fixture usage is explicitly synthetic.

### Private artifact references

- **Manifest:** runs/${run.id}/manifest.json
- **Capture:** ${run.captureRef}
- **Candidate:** ${run.candidateRef}
- **Provider response:** ${run.responseRef}${run.extractionInput ? `\n- **Extraction input:** ${run.extractionInput.ref} · ${run.extractionInput.digest}` : ""}

${
  assessment
    ? `### Assessment provenance

- **Candidate bundle digest:** ${assessment.candidateDigest}
- **Assessment created:** ${assessment.createdAt}
- **Assessor:** machine; not a human approval
- **Prompt:** ${assessment.promptVersion} / ${assessment.promptDigest}
- **Schema:** ${assessment.schemaDigest}
- **Code:** ${assessment.codeRevision}
- **Provider request:** ${prose(assessment.requestId ?? "Unknown")}
- **Assessment usage:** ${JSON.stringify(assessment.usage)}

`
    : ""
}### Source digests

${run.sourceDigests.map((value) => `- ${value}`).join("\n")}

### Candidate digests

${run.candidateDigests.map((value) => `- ${value}`).join("\n")}

</details>
`;
}
