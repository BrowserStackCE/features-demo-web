const DEFAULT_OWNER = "BrowserStackCE";
const DEFAULT_REPO = "features-demo-web";

export const WORKFLOW_FILES: Record<string, string> = {
  "apple-pay": "test-apple-pay.yml",
  camera: "test-camera.yml",
  audio: "test-audio.yml",
  network: "test-network.yml",
  "self-healing": "test-self-healing.yml",
  "file-upload": "test-file-upload.yml",
  gps: "test-gps.yml",
  "ip-geolocation": "test-ip-geolocation.yml",
  timezone: "test-timezone.yml",
  iframe: "test-iframe.yml",
  permissions: "test-permissions.yml",
};

export type DispatchInputs = {
  username: string;
  accessKey: string;
  localTesting?: boolean;
};

export type DispatchResult = {
  workflowRunId: number;
  runUrl: string;
  htmlUrl: string;
};

type WorkflowRun = {
  id: number;
  status: string | null;
  conclusion: string | null;
  html_url: string;
  name: string | null;
  path: string;
};

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured");
  }
  return {
    token,
    owner: process.env.GITHUB_OWNER || DEFAULT_OWNER,
    repo: process.env.GITHUB_REPO || DEFAULT_REPO,
  };
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export function resolveWorkflowFile(alias: string): string | undefined {
  return WORKFLOW_FILES[alias];
}

export function listAllowedWorkflows(): string[] {
  return Object.keys(WORKFLOW_FILES);
}

export async function dispatchWorkflow(
  alias: string,
  inputs: DispatchInputs,
  ref = "main"
): Promise<DispatchResult> {
  const file = WORKFLOW_FILES[alias];
  if (!file) {
    throw new Error(`Unknown workflow: ${alias}`);
  }

  const { token, owner, repo } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${file}/dispatches`;

  const response = await fetch(url, {
    method: "POST",
    headers: githubHeaders(token),
    body: JSON.stringify({
      ref,
      return_run_details: true,
      inputs: {
        username: inputs.username,
        accessKey: inputs.accessKey,
        localTesting: String(inputs.localTesting ?? false),
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub dispatch failed (${response.status}): ${body}`);
  }

  // With return_run_details: true → 200 + run metadata; otherwise 204.
  if (response.status === 204) {
    throw new Error(
      "GitHub returned 204 without run details; ensure return_run_details is supported"
    );
  }

  const data = (await response.json()) as {
    workflow_run_id: number;
    run_url: string;
    html_url: string;
  };

  return {
    workflowRunId: data.workflow_run_id,
    runUrl: data.run_url,
    htmlUrl: data.html_url,
  };
}

export async function getWorkflowRun(runId: number): Promise<WorkflowRun> {
  const { token, owner, repo } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(token),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub get run failed (${response.status}): ${body}`);
  }

  return (await response.json()) as WorkflowRun;
}
