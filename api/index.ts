import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  APP_ANDROID_DEFAULT_FEATURES,
  APP_ANDROID_FEATURES,
  APP_ANDROID_WORKFLOW_FILES,
  dispatchWorkflow,
  dispatchWorkflowFile,
  getWorkflowRun,
  listAllowedWorkflows,
  resolveWorkflowFile,
} from "./github.js";
import { mintPollToken, verifyPollToken } from "./token.js";

export const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
);

type TriggerBody = {
  workflow?: string;
  workflows?: string[];
  features?: string[];
  username?: string;
  accessKey?: string;
  localTesting?: boolean;
  product?: "automate" | "app-automate";
  platform?: "android" | "ios";
  ref?: string;
};

function normalizeWorkflows(body: TriggerBody): string[] {
  const names: string[] = [];
  if (typeof body.workflow === "string" && body.workflow.trim()) {
    names.push(body.workflow.trim());
  }
  if (Array.isArray(body.workflows)) {
    for (const name of body.workflows) {
      if (typeof name === "string" && name.trim()) {
        names.push(name.trim());
      }
    }
  }
  return [...new Set(names)];
}

function collectTokens(
  c: {
    req: {
      query: (key: string) => string | undefined;
      queries: (key: string) => string[] | undefined;
    };
  }
): string[] {
  const tokens = new Set<string>();

  for (const value of c.req.queries("token") ?? []) {
    if (value.trim()) tokens.add(value.trim());
  }

  const single = c.req.query("token");
  if (single?.trim()) tokens.add(single.trim());

  const csv = c.req.query("tokens");
  if (csv) {
    for (const part of csv.split(",")) {
      if (part.trim()) tokens.add(part.trim());
    }
  }

  return [...tokens];
}

app.get("/health", (c) => c.json({ ok: true }));

app.post("/trigger", async (c) => {
  let body: TriggerBody;
  try {
    body = await c.req.json<TriggerBody>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const username = body.username?.trim();
  const accessKey = body.accessKey?.trim();
  if (!username || !accessKey) {
    return c.json({ error: "username and accessKey are required" }, 400);
  }

  const product =
    body.product ??
    (body.platform === "android" || body.platform === "ios"
      ? "app-automate"
      : "automate");
  if (product !== "automate" && product !== "app-automate") {
    return c.json({ error: `Unknown product: ${product}` }, 400);
  }

  if (product === "app-automate") {
    if (body.platform !== "android" && body.platform !== "ios") {
      return c.json(
        { error: "platform must be 'android' or 'ios' for app-automate" },
        400
      );
    }
    if (body.platform === "ios") {
      return c.json({ error: "iOS App Automate is not available yet" }, 501);
    }

    const features = [
      ...new Set(
        (Array.isArray(body.features) ? body.features : [])
          .filter((f): f is string => typeof f === "string")
          .map((f) => f.trim())
          .filter(Boolean)
      ),
    ];
    const unknownFeatures = features.filter(
      (f) => !APP_ANDROID_FEATURES.includes(f)
    );
    if (unknownFeatures.length > 0) {
      return c.json(
        {
          error: `Unknown feature(s): ${unknownFeatures.join(", ")}`,
          allowed: APP_ANDROID_FEATURES,
        },
        400
      );
    }
    if (!process.env.GITHUB_TOKEN) {
      return c.json({ error: "GITHUB_TOKEN is not configured" }, 500);
    }

    // No features selected => run every Android feature workflow.
    const selected = features.length > 0 ? features : APP_ANDROID_DEFAULT_FEATURES;
    const appRuns = await Promise.all(
      selected.map(async (feature) => {
        const workflow = `app-android-${feature}`;
        try {
          const dispatched = await dispatchWorkflowFile(
            APP_ANDROID_WORKFLOW_FILES[feature],
            { username, accessKey, localTesting: Boolean(body.localTesting) },
            body.ref?.trim() || "main"
          );
          const token = mintPollToken({
            runId: dispatched.workflowRunId,
            workflow,
          });
          return { workflow, token, htmlUrl: dispatched.htmlUrl };
        } catch (err) {
          return {
            workflow,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })
    );
    return c.json({ runs: appRuns });
  }

  const workflows = normalizeWorkflows(body);
  if (workflows.length === 0) {
    return c.json(
      {
        error: "Provide workflow (string) and/or workflows (string[])",
        allowed: listAllowedWorkflows(),
      },
      400
    );
  }

  const unknown = workflows.filter((name) => !resolveWorkflowFile(name));
  if (unknown.length > 0) {
    return c.json(
      {
        error: `Unknown workflow alias(es): ${unknown.join(", ")}`,
        allowed: listAllowedWorkflows(),
      },
      400
    );
  }

  if (!process.env.GITHUB_TOKEN) {
    return c.json({ error: "GITHUB_TOKEN is not configured" }, 500);
  }

  const ref = body.ref?.trim() || "main";
  const localTesting = Boolean(body.localTesting);

  const runs = await Promise.all(
    workflows.map(async (workflow) => {
      try {
        const dispatched = await dispatchWorkflow(
          workflow,
          { username, accessKey, localTesting },
          ref
        );
        const token = mintPollToken({
          runId: dispatched.workflowRunId,
          workflow,
        });
        return {
          workflow,
          token,
          htmlUrl: dispatched.htmlUrl,
        };
      } catch (err) {
        return {
          workflow,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  return c.json({ runs });
});

app.get("/status", async (c) => {
  const tokens = collectTokens(c);
  if (tokens.length === 0) {
    return c.json(
      { error: "Provide token query param (or tokens=a,b / repeated token=)" },
      400
    );
  }

  if (!process.env.GITHUB_TOKEN) {
    return c.json({ error: "GITHUB_TOKEN is not configured" }, 500);
  }

  const runs = await Promise.all(
    tokens.map(async (token) => {
      try {
        const payload = verifyPollToken(token);
        const run = await getWorkflowRun(payload.runId);
        return {
          token,
          workflow: payload.workflow,
          runId: payload.runId,
          status: run.status,
          conclusion: run.conclusion,
          htmlUrl: run.html_url,
        };
      } catch (err) {
        return {
          token,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  const allInvalid = runs.every((r) => "error" in r && !("runId" in r));
  if (allInvalid) {
    return c.json({ error: "Invalid token(s)", runs }, 400);
  }

  return c.json({ runs });
});

export default app;
