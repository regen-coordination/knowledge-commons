import {
  digest,
  evaluateReportReviews,
  IngestionError,
  readBounded,
  type SubmittedReview,
} from "@knowledge-commons/pipeline";

export const GITHUB_REPOSITORY = "regen-coordination/knowledge-commons";
export const GITHUB_TEAM = "knowledge-commons";
const base = `/repos/${GITHUB_REPOSITORY}`;
type User = { id: number; login: string; type: string };
type Pull = {
  number: number;
  html_url: string;
  state: string;
  draft: boolean;
  user: User;
  head: { sha: string; ref: string };
  base: { ref: string };
  body: string | null;
};
export type Delivery = {
  branch: string;
  path: string;
  markdownDigest: string;
  baseSha: string | null;
  commitSha: string | null;
  prNumber: number | null;
  prUrl: string | null;
  reviewers: User[];
  status: "pending" | "delivered" | "blocked";
  error: string | null;
};
export interface ReportDelivery {
  deliver(
    markdown: string,
    delivery: Delivery,
    save: () => Promise<void>,
  ): Promise<void>;
}
export class GitHubDelivery implements ReportDelivery {
  constructor(
    private readonly token: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}
  async api<T>(
    path: string,
    method = "GET",
    body?: unknown,
    allow404 = false,
  ): Promise<T> {
    const fetcher = this.fetcher;
    const response = await fetcher(`https://api.github.com${path}`, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "regen-knowledge-commons",
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (allow404 && response.status === 404) return null as T;
    if (!response.ok)
      throw new IngestionError(`github_http_${response.status}`);
    if (response.status === 204) return null as T;
    return JSON.parse(await readBounded(response, 1024 * 1024));
  }
  async pages<T>(path: string): Promise<T[]> {
    const all: T[] = [];
    for (let page = 1; page <= 10; page++) {
      const rows = await this.api<T[]>(
        `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`,
      );
      all.push(...rows);
      if (rows.length < 100) return all;
    }
    throw new IngestionError("github_pagination_limit");
  }
  async evaluate(d: Delivery) {
    if (!d.prNumber || !d.commitSha)
      throw new IngestionError("report_not_delivered");
    const snapshot = async () => {
      const pr = await this.api<Pull>(`${base}/pulls/${d.prNumber}`);
      if (
        pr.head.sha !== d.commitSha ||
        pr.head.ref !== d.branch ||
        pr.base.ref !== "main" ||
        pr.state !== "open"
      )
        throw new IngestionError("github_report_revision_changed");
      const members = await this.pages<User>(
        `/orgs/regen-coordination/teams/${GITHUB_TEAM}/members`,
      );
      const eligible: User[] = [];
      for (const u of new Map(members.map((u) => [u.id, u])).values()) {
        if (u.type !== "User" || u.id === pr.user.id) continue;
        const permission = await this.api<{ permission: string }>(
          `${base}/collaborators/${encodeURIComponent(u.login)}/permission`,
        );
        if (["admin", "write", "maintain"].includes(permission.permission))
          eligible.push({ id: u.id, login: u.login, type: u.type });
      }
      eligible.sort((a, b) => a.id - b.id);
      const reviews = await this.pages<SubmittedReview>(
        `${base}/pulls/${d.prNumber}/reviews`,
      );
      return {
        head: pr.head.sha,
        author: pr.user.id,
        draft: pr.draft,
        eligible,
        reviews,
      };
    };
    const before = await snapshot();
    const file = await this.api<{ content: string; encoding: string }>(
      `${base}/contents/${d.path}?ref=${d.commitSha}`,
    );
    if (
      file.encoding !== "base64" ||
      (await digest(
        new TextDecoder().decode(
          Uint8Array.from(atob(file.content.replace(/\s/g, "")), (c) =>
            c.charCodeAt(0),
          ),
        ),
      )) !== d.markdownDigest
    )
      throw new IngestionError("github_content_mismatch");
    const after = await snapshot();
    if ((await digest(before)) !== (await digest(after)))
      throw new IngestionError("github_review_changed_during_evaluation");
    const final = await this.api<Pull>(`${base}/pulls/${d.prNumber}`);
    if (
      final.head.sha !== after.head ||
      final.state !== "open" ||
      final.draft !== after.draft
    )
      throw new IngestionError("github_head_changed_during_evaluation");
    return {
      ...evaluateReportReviews(
        after.head,
        after.author,
        after.eligible,
        after.reviews,
      ),
      headSha: after.head,
      draft: after.draft,
      evaluatedAt: new Date().toISOString(),
      reportDigest: d.markdownDigest,
      prNumber: d.prNumber,
      prUrl: d.prUrl,
      snapshotDigest: await digest(after),
    };
  }
  async deliver(markdown: string, d: Delivery, save: () => Promise<void>) {
    if ((await digest(markdown)) !== d.markdownDigest)
      throw new IngestionError("delivery_digest_mismatch");
    if (
      !/^codex\/report-[a-f0-9-]+$/.test(d.branch) ||
      !/^reports\/ingestion\/topic-\d+\/[a-f0-9-]+\.md$/.test(d.path)
    )
      throw new IngestionError("delivery_path_invalid");
    // Resolve intent once, before writes. Replays use the original base even when main moves.
    if (!d.baseSha) {
      const ref = await this.api<{ object: { sha: string } }>(
        `${base}/git/ref/heads/main`,
      );
      d.baseSha = ref.object.sha;
      await save();
    }
    let branch = await this.api<{ object: { sha: string } } | null>(
      `${base}/git/ref/heads/${d.branch}`,
      "GET",
      undefined,
      true,
    );
    if (!branch) {
      if (!d.commitSha) {
        const commit = await this.api<{ tree: { sha: string } }>(
          `${base}/git/commits/${d.baseSha}`,
        );
        const tree = await this.api<{ sha: string }>(
          `${base}/git/trees`,
          "POST",
          {
            base_tree: commit.tree.sha,
            tree: [
              { path: d.path, mode: "100644", type: "blob", content: markdown },
            ],
          },
        );
        const created = await this.api<{ sha: string }>(
          `${base}/git/commits`,
          "POST",
          {
            message: "docs(agent): add assessed ingestion report",
            tree: tree.sha,
            parents: [d.baseSha],
          },
        );
        d.commitSha = created.sha;
        await save();
      }
      await this.api(`${base}/git/refs`, "POST", {
        ref: `refs/heads/${d.branch}`,
        sha: d.commitSha,
      });
      branch = await this.api(`${base}/git/ref/heads/${d.branch}`);
    }
    // Never overwrite another writer's branch, including a reviewer edit.
    if (branch?.object.sha !== d.commitSha)
      throw new IngestionError("github_branch_changed");
    const file = await this.api<{ content: string; encoding: string }>(
      `${base}/contents/${d.path}?ref=${d.commitSha}`,
    );
    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, "")), (c) =>
      c.charCodeAt(0),
    );
    if (
      file.encoding !== "base64" ||
      (await digest(new TextDecoder().decode(bytes))) !== d.markdownDigest
    )
      throw new IngestionError("github_content_mismatch");
    const marker = `<!-- commons-report:${d.markdownDigest} -->`;
    let pr: Pull;
    if (d.prNumber) pr = await this.api<Pull>(`${base}/pulls/${d.prNumber}`);
    else {
      const matches = await this.pages<Pull>(
        `${base}/pulls?state=all&head=regen-coordination:${encodeURIComponent(d.branch)}&base=main`,
      );
      if (matches.length > 1) throw new IngestionError("github_duplicate_prs");
      pr =
        matches[0] ??
        (await this.api<Pull>(`${base}/pulls`, "POST", {
          title: "docs(agent): review Regen Knowledge Commons ingestion",
          head: d.branch,
          base: "main",
          draft: true,
          body: `## Summary\n- Machine-extracted candidate and separately recorded Integrity assessment for human review.\n- Draft knowledge; no Geo submission or human approvals recorded.\n\n## Validation\n- Report digest: ${d.markdownDigest}\n- Require two eligible human reviews of the current revision. Scores and PR merges do not authorize Geo publication.\n\n${marker}`,
        }));
      d.prNumber = pr.number;
      d.prUrl = pr.html_url;
      await save();
    }
    if (
      !pr.body?.includes(marker) ||
      pr.head.sha !== d.commitSha ||
      pr.head.ref !== d.branch ||
      pr.base.ref !== "main"
    )
      throw new IngestionError("github_pr_changed");
    if (pr.state !== "open" || !pr.draft)
      throw new IngestionError("github_pr_not_draft");
    await this.api(`${base}/issues/${pr.number}/labels`, "POST", {
      labels: ["automated/codex", "draft"],
    });
    const members = await this.pages<User>(
      `/orgs/regen-coordination/teams/${GITHUB_TEAM}/members`,
    );
    const unique = [...new Map(members.map((u) => [u.id, u])).values()];
    const eligible: User[] = [];
    for (const user of unique) {
      if (user.type !== "User" || user.id === pr.user.id) continue;
      const access = await this.api<{ permission: string }>(
        `${base}/collaborators/${encodeURIComponent(user.login)}/permission`,
      );
      if (["admin", "write", "maintain"].includes(access.permission))
        eligible.push(user);
    }
    if (eligible.length < 2)
      throw new IngestionError("github_insufficient_reviewers");
    const current = await this.api<{ users: User[] }>(
      `${base}/pulls/${pr.number}/requested_reviewers`,
    );
    const reviews = await this.pages<{
      user: User;
      commit_id: string;
      state: string;
    }>(`${base}/pulls/${pr.number}/reviews`);
    const already = new Set([
      ...current.users.map((u) => u.id),
      ...reviews
        .filter(
          (r) =>
            r.commit_id === d.commitSha &&
            !["DISMISSED", "PENDING"].includes(r.state),
        )
        .map((r) => r.user.id),
    ]);
    const missing = eligible.filter((u) => !already.has(u.id));
    if (missing.length)
      await this.api(`${base}/pulls/${pr.number}/requested_reviewers`, "POST", {
        reviewers: missing.map((u) => u.login),
      });
    const checked = await this.api<{ users: User[] }>(
      `${base}/pulls/${pr.number}/requested_reviewers`,
    );
    const reviewed = reviews
      .filter(
        (r) =>
          r.commit_id === d.commitSha &&
          !["DISMISSED", "PENDING"].includes(r.state),
      )
      .map((r) => r.user.id);
    const requested = new Set([...reviewed, ...checked.users.map((u) => u.id)]);
    if (eligible.some((u) => !requested.has(u.id)))
      throw new IngestionError("github_reviewer_request_incomplete");
    const final = await this.api<Pull>(`${base}/pulls/${pr.number}`);
    if (final.head.sha !== d.commitSha)
      throw new IngestionError("github_head_changed_during_delivery");
    d.reviewers = eligible;
    d.status = "delivered";
    d.error = null;
    await save();
  }
}
