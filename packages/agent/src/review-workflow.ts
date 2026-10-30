import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { type Bindings, runtime } from "./bindings";
import { executeReview } from "./review";
export class ReviewWorkflow extends WorkflowEntrypoint<
  Bindings,
  { runId: string }
> {
  async run(event: WorkflowEvent<{ runId: string }>, step: WorkflowStep) {
    const result = await step.do(
      "assess-and-deliver",
      { retries: { limit: 0, delay: "1 second" }, timeout: "5 minutes" },
      () => executeReview(runtime(this.env), event.payload.runId),
    );
    if (
      result.delivery?.status !== "delivered" ||
      result.assessment.status !== "completed"
    )
      throw new Error("review_needs_attention");
    return { runId: result.runId, prUrl: result.delivery.prUrl };
  }
}
