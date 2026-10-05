import { Hono } from "hono";
import {
  dispatchWorkflow,
  getWorkflowRun,
  listAllowedWorkflows,
  resolveWorkflowFile,
} from "./github.js";
import { mintPollToken, verifyPollToken } from "./token.js";

export const app = new Hono().basePath("/api");

type TriggerBody = {
  workflow?: string;
  workflows?: string[];
  username?: string;
  accessKey?: string;
  localTesting?: boolean;
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
