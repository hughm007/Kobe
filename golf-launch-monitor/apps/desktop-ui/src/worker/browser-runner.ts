/**
 * Browser entry for the pipeline: a module Web Worker when available, otherwise the in-process
 * fallback (loaded lazily so the physics packages are not in the main bundle twice).
 * Kept out of runner.ts so tests never touch `new Worker(...)`.
 */
import type { UiToWorkerMessage } from "./protocol";
import { createWorkerRunner, type PipelineRunner, type RunnerListener, type WorkerLike } from "./runner-api";

function createLazyInProcessRunner(): PipelineRunner {
  const listeners = new Set<RunnerListener>();
  const queue: UiToWorkerMessage[] = [];
  let inner: PipelineRunner | null = null;
  let disposed = false;
  void import("./runner").then(({ createPipelineRunner }) => {
    if (disposed) return;
    const runner = createPipelineRunner();
    runner.onMessage((m) => {
      for (const l of [...listeners]) l(m);
    });
    inner = runner;
    for (const message of queue.splice(0)) runner.send(message);
  });
  return {
    kind: "in-process",
    send(message) {
      if (inner === null) queue.push(message);
      else inner.send(message);
    },
    onMessage(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      disposed = true;
      listeners.clear();
      inner?.dispose();
    },
  };
}

export function createBrowserPipelineRunner(): PipelineRunner {
  if (typeof Worker === "undefined") return createLazyInProcessRunner();
  try {
    const worker = new Worker(new URL("./pipeline.worker.ts", import.meta.url), { type: "module" });
    return createWorkerRunner(worker as unknown as WorkerLike);
  } catch {
    return createLazyInProcessRunner();
  }
}
