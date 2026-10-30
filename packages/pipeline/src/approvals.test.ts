import { expect, test } from "bun:test";
import { evaluateReportReviews, type SubmittedReview } from "./approvals";

const humans = [1, 2, 3, 4].map((id) => ({
  id,
  login: `human${id}`,
  type: "User",
}));
const review = (
  id: number,
  user: number,
  state = "APPROVED",
  commit_id = "head",
): SubmittedReview => ({
  id,
  user: humans[user - 1]!,
  state,
  commit_id,
  submitted_at: `2026-09-09T00:00:${String(id).padStart(2, "0")}Z`,
});
const evaluate = (reviews: SubmittedReview[]) =>
  evaluateReportReviews("head", 1, humans, reviews);
test("two distinct current humans approve only the report", () => {
  expect(evaluate([review(1, 2), review(2, 3)])).toMatchObject({
    status: "approved",
    knowledgeApproval: "not-granted",
  });
  expect(evaluate([review(1, 2), review(2, 2)]).status).toBe("pending");
  expect(evaluate([review(1, 1), review(2, 2)]).status).toBe("pending");
});
test("stale, dismissed, pending, bots and lost membership never count", () => {
  for (const invalid of [
    review(2, 3, "APPROVED", "old"),
    review(2, 3, "DISMISSED"),
    review(2, 3, "PENDING"),
    { ...review(2, 3), user: { ...humans[2]!, type: "Bot" } },
  ])
    expect(evaluate([review(1, 2), invalid]).status).toBe("pending");
  expect(
    evaluateReportReviews("head", 1, humans.slice(0, 2), [
      review(1, 2),
      review(2, 3),
    ]).status,
  ).toBe("pending");
  expect(
    evaluate([review(1, 2), review(2, 3), review(3, 3, "DISMISSED")]).status,
  ).toBe("pending");
});
test("latest submitted review controls approval; comments do not erase objections", () => {
  const rs = [
    review(1, 2),
    review(2, 3),
    review(3, 4, "CHANGES_REQUESTED", "old"),
    review(4, 4, "COMMENTED"),
  ];
  expect(evaluate(rs).status).toBe("pending");
  expect(evaluate([...rs, review(5, 4)]).status).toBe("approved");
  expect(
    evaluate([review(1, 2), review(2, 3), review(3, 3, "COMMENTED")]).status,
  ).toBe("pending");
  expect(() => evaluate([{ ...review(1, 2), submitted_at: null }])).toThrow(
    "review_timestamp_invalid",
  );
});
