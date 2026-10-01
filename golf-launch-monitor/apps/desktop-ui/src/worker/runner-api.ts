/**
 * PipelineRunner: the UI's only handle on the shot pipeline. Implementations:
 * - createWorkerRunner(worker) (here): messages go to pipeline.worker.ts, so Monte Carlo
 *   propagation never blocks the UI thread;
 * - createPipelineRunner() (runner.ts): the same PipelineHost in-process, for tests and
 *   environments without Worker support.
 * This module does not import the pipeline packages, so the main bundle can stay small.
 */
import type { UiToWorkerMessage, WorkerToUiMessage } from "./protocol";

export type RunnerKind = "worker" | "in-process";
export type RunnerListener = (message: WorkerToUiMessage) => void;

export interface PipelineRunner {
  readonly kind: RunnerKind;
  send(message: UiToWorkerMessage): void;
  /** Returns an unsubscribe function. */
  onMessage(listener: RunnerListener): () => void;
  dispose(): void;
}

export type ListenerSet = {
  add(listener: RunnerListener): () => void;
  deliver(message: WorkerToUiMessage): void;
  clear(): void;
};

export function createListenerSet(): ListenerSet {
  const listeners = new Set<RunnerListener>();
  return {
    add(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    deliver(message) {
      for (const listener of [...listeners]) listener(message);
    },
    clear() {
      listeners.clear();
    },
  };
}

/** The subset of the Worker API the runner uses (so it can be faked in tests). */
export type WorkerLike = {
  postMessage(message: UiToWorkerMessage): void;
  addEventListener(type: "message", listener: (event: MessageEvent<WorkerToUiMessage>) => void): void;
  addEventListener(type: "error", listener: (event: ErrorEvent) => void): void;
  terminate(): void;
};

export function createWorkerRunner(worker: WorkerLike): PipelineRunner {
  const listeners = createListenerSet();
  worker.addEventListener("message", (event) => listeners.deliver(event.data));
  worker.addEventListener("error", (event) => {
    listeners.deliver({ type: "error", message: `Pipeline worker error: ${event.message || "unknown error"}` });
    listeners.deliver({ type: "busy", busy: false });
  });
  return {
    kind: "worker",
    send: (message) => worker.postMessage(message),
    onMessage: (listener) => listeners.add(listener),
    dispose() {
      listeners.clear();
      worker.terminate();
    },
  };
}
