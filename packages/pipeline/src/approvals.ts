export type Reviewer = { id: number; login: string; type: string };
export type SubmittedReview = {
  id: number;
  user: Reviewer;
  state: string;
  commit_id: string;
  submitted_at: string | null;
};

/** A point-in-time report decision. This never supplies a Geo vote or merge action. */
export function evaluateReportReviews(
  head: string,
  authorId: number,
  eligible: Reviewer[],
  reviews: SubmittedReview[],
) {
  const members = new Set(
    eligible
      .filter((u) => u.type === "User" && u.id !== authorId)
      .map((u) => u.id),
  );
  const submitted = reviews.filter((r) => r.state !== "PENDING");
  if (
    submitted.some(
      (r) => !r.submitted_at || !Number.isFinite(Date.parse(r.submitted_at)),
    )
  )
    throw new Error("review_timestamp_invalid");
  submitted.sort(
    (a, b) =>
      Date.parse(a.submitted_at ?? "") - Date.parse(b.submitted_at ?? "") ||
      a.id - b.id,
  );
  const latest = new Map<number, SubmittedReview>();
  const objections = new Map<number, SubmittedReview>();
  for (const r of submitted) {
    if (!members.has(r.user.id) || r.user.type !== "User") continue;
    latest.set(r.user.id, r);
    if (r.state === "CHANGES_REQUESTED") objections.set(r.user.id, r);
    // A comment cannot resolve an objection. Dismissal is not approval.
    if (r.state === "APPROVED" && r.commit_id === head)
      objections.delete(r.user.id);
  }
  const approvals = [...latest.values()].filter(
    (r) => r.state === "APPROVED" && r.commit_id === head,
  );
  const blockers = [...objections.values()];
  return {
    status:
      approvals.length >= 2 && blockers.length === 0
        ? ("approved" as const)
        : ("pending" as const),
    required: 2,
    approvals: approvals.map((r) => ({
      userId: r.user.id,
      login: r.user.login,
      reviewId: r.id,
    })),
    changesRequested: blockers.map((r) => ({
      userId: r.user.id,
      login: r.user.login,
      reviewId: r.id,
    })),
    eligibleCount: members.size,
    knowledgeApproval: "not-granted" as const,
  };
}
