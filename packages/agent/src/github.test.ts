import { expect, test } from "bun:test";
import { digest, type SubmittedReview } from "@knowledge-commons/pipeline";
import { type Delivery, GitHubDelivery } from "./github";

test("approval readback is exact, current, read-only and fails closed on races or API errors", async () => {
  const h = await fixture();
  await h.adapter.deliver(h.markdown, h.d, h.save);
  h.state.reviews = [2, 3].map((id) => ({
    id,
    user: { id, login: id === 2 ? "alice" : "bob", type: "User" },
    state: "APPROVED",
    commit_id: "report-commit",
    submitted_at: "2026-09-09T00:00:00Z",
  }));
  const writes = h.requests.filter((r) => r.method !== "GET").length;
  expect(await h.adapter.evaluate(h.d)).toMatchObject({
    status: "approved",
    headSha: "report-commit",
    draft: true,
    knowledgeApproval: "not-granted",
  });
  expect(h.requests.filter((r) => r.method !== "GET")).toHaveLength(writes);
  h.state.memberReads = 0;
  h.state.changeMembership = true;
  await expect(h.adapter.evaluate(h.d)).rejects.toThrow(
    "github_review_changed_during_evaluation",
  );
  h.state.changeMembership = false;
  h.state.failRead = true;
  await expect(h.adapter.evaluate(h.d)).rejects.toThrow("github_http_503");
  h.state.failRead = false;
  h.state.moveHead = true;
  await expect(h.adapter.evaluate(h.d)).rejects.toThrow(
    "github_report_revision_changed",
  );
  h.state.moveHead = false;
  h.state.corrupt = true;
  await expect(h.adapter.evaluate(h.d)).rejects.toThrow(
    "github_content_mismatch",
  );
});

async function fixture() {
  const markdown =
    "# 🌱 Regen Knowledge Commons\n\nMachine review, not approval.\n";
  const d: Delivery = {
    branch: "codex/report-12345678-abcd",
    path: "reports/ingestion/topic-235/12345678-abcd.md",
    markdownDigest: await digest(markdown),
    baseSha: null,
    commitSha: null,
    prNumber: null,
    prUrl: null,
    reviewers: [],
    status: "pending",
    error: null,
  };
  const author = { id: 1, login: "author", type: "User" };
  const members = [
    author,
    { id: 2, login: "alice", type: "User" },
    { id: 3, login: "bob", type: "User" },
    { id: 4, login: "bot", type: "Bot" },
    { id: 5, login: "reader", type: "User" },
  ];
  const state = {
    branch: null as string | null,
    pr: null as null | {
      number: number;
      html_url: string;
      user: typeof author;
      body: string;
      state: string;
      draft: boolean;
      head: { sha: string; ref: string };
      base: { ref: string };
    },
    requested: [] as typeof members,
    creates: 0,
    notifications: 0,
    losePrResponse: false,
    rejectReviewers: false,
    moveHead: false,
    corrupt: false,
    reviews: [] as SubmittedReview[],
    memberReads: 0,
    changeMembership: false,
    failRead: false,
  };
  const requests: {
    path: string;
    method: string;
    body: { draft?: boolean };
  }[] = [];
  const fetcher = (async (url: RequestInfo | URL, options?: RequestInit) => {
    const u = new URL(String(url));
    const path = u.pathname.replace(
      "/repos/regen-coordination/knowledge-commons",
      "",
    );
    const method = options?.method ?? "GET";
    const body = options?.body ? JSON.parse(String(options.body)) : undefined;
    requests.push({ path, method, body });
    const response = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status });
    if (path === "/git/ref/heads/main")
      return response({ object: { sha: "base" } });
    if (path === `/git/ref/heads/${d.branch}`)
      return state.branch
        ? response({ object: { sha: state.branch } })
        : response({}, 404);
    if (path === "/git/commits/base")
      return response({ tree: { sha: "base-tree" } });
    if (path === "/git/trees") {
      expect(body.tree[0].content).toBe(markdown);
      return response({ sha: "report-tree" });
    }
    if (path === "/git/commits") return response({ sha: "report-commit" });
    if (path === "/git/refs") {
      state.branch = body.sha;
      return response({ object: { sha: state.branch } });
    }
    if (path.startsWith("/contents/"))
      return response({
        encoding: "base64",
        content: Buffer.from(state.corrupt ? "corrupt" : markdown).toString(
          "base64",
        ),
      });
    if (path === "/pulls" && method === "GET")
      return response(state.pr ? [state.pr] : []);
    if (path === "/pulls" && method === "POST") {
      state.creates++;
      state.pr = {
        number: 17,
        html_url:
          "https://github.com/regen-coordination/knowledge-commons/pull/17",
        user: author,
        body: body.body,
        state: "open",
        draft: true,
        head: { sha: "report-commit", ref: d.branch },
        base: { ref: "main" },
      };
      if (state.losePrResponse) {
        state.losePrResponse = false;
        throw new Error("response lost after GitHub created PR");
      }
      return response(state.pr);
    }
    if (path === "/pulls/17")
      return response(
        state.moveHead ? { ...state.pr, head: { sha: "changed" } } : state.pr,
      );
    if (path === "/issues/17/labels") return response(body.labels);
    if (path === "/orgs/regen-coordination/teams/knowledge-commons/members") {
      if (state.failRead) return response({}, 503);
      state.memberReads++;
      return response(
        state.changeMembership && state.memberReads % 2 === 0
          ? members.filter((u) => u.id !== 3)
          : members,
      );
    }
    if (path.startsWith("/collaborators/"))
      return response({
        permission: path.includes("reader") ? "read" : "write",
      });
    if (path === "/pulls/17/reviews") return response(state.reviews);
    if (path === "/pulls/17/requested_reviewers") {
      if (method === "POST") {
        if (state.rejectReviewers) return response({}, 422);
        state.notifications++;
        state.requested = members.filter((u) =>
          body.reviewers.includes(u.login),
        );
      }
      return response({ users: state.requested });
    }
    throw new Error(`Unexpected route ${method} ${path}`);
  }) as typeof fetch;
  return {
    markdown,
    d,
    state,
    requests,
    adapter: new GitHubDelivery("test-only-token", fetcher),
    save: async () => {},
  };
}

test("GitHub delivery preserves report bytes and requests only eligible individual humans", async () => {
  const h = await fixture();
  await h.adapter.deliver(h.markdown, h.d, h.save);
  expect(h.d.status).toBe("delivered");
  expect(h.d.reviewers.map((u) => u.login)).toEqual(["alice", "bob"]);
  expect(h.d.prNumber).toBe(17);
  await h.adapter.deliver(h.markdown, h.d, h.save);
  expect(h.state.creates).toBe(1);
  expect(h.state.notifications).toBe(1);
  expect(h.requests.some((r) => r.path.endsWith("/merge"))).toBe(false);
  expect(
    h.requests.filter((r) => r.path === "/pulls" && r.method === "POST")[0]
      ?.body.draft,
  ).toBe(true);
});

test("lost PR response is reconciled by branch without duplicate PR creation", async () => {
  const h = await fixture();
  h.state.losePrResponse = true;
  await expect(h.adapter.deliver(h.markdown, h.d, h.save)).rejects.toThrow(
    "response lost",
  );
  expect(h.d.prNumber).toBeNull();
  await h.adapter.deliver(h.markdown, h.d, h.save);
  expect(h.d.status).toBe("delivered");
  expect(h.state.creates).toBe(1);
});

test("reviewer rejection is inspectable and retries reuse the existing draft", async () => {
  const h = await fixture();
  h.state.rejectReviewers = true;
  await expect(h.adapter.deliver(h.markdown, h.d, h.save)).rejects.toThrow(
    "github_http_422",
  );
  expect(h.d.prNumber).toBe(17);
  expect(h.state.pr?.draft).toBe(true);
  h.state.rejectReviewers = false;
  await h.adapter.deliver(h.markdown, h.d, h.save);
  expect(h.state.creates).toBe(1);
});

test("changed branch and corrupt report readback block delivery", async () => {
  const h = await fixture();
  h.state.corrupt = true;
  await expect(h.adapter.deliver(h.markdown, h.d, h.save)).rejects.toThrow(
    "github_content_mismatch",
  );
  expect(h.state.creates).toBe(0);
  h.state.corrupt = false;
  h.state.branch = "reviewer-edited";
  await expect(h.adapter.deliver(h.markdown, h.d, h.save)).rejects.toThrow(
    "github_branch_changed",
  );
  expect(h.state.branch).toBe("reviewer-edited");
});
