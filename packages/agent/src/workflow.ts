import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { type Bindings, runtime } from "./bindings";
import { executeJob } from "./job";
import { reviewRun } from "./review";
import { Store } from "./store";
export class IngestionWorkflow extends WorkflowEntrypoint<
  Bindings,
  { runId: string }
> {
  async run(event: WorkflowEvent<{ runId: string }>, step: WorkflowStep) {
    await executeJob(runtime(this.env), event.payload.runId, step);
    const env = runtime(this.env);
    if (env.REVIEW)
      await step.do("dispatch-review", async () => {
        const dispatch = await reviewRun(
          env,
          await new Store(env).run(event.payload.runId),
        );
        if (dispatch === "pending-retry")
          throw new Error("review_dispatch_pending");
        return dispatch;
      });
    return { runId: event.payload.runId };
  }
}
