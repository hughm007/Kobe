/**
 * In-process fallback runner: the same PipelineHost the worker uses, on the calling thread.
 * Used by tests and by browsers without module-worker support (heavy shots then block the UI).
 */
import { defaultHostDependencies, PipelineHost, type HostDependencies } from "./host";
import { createListenerSet, type PipelineRunner } from "./runner-api";

export * from "./runner-api";

/** In-process runner; `idle()` resolves when every message sent so far has been processed. */
export interface InProcessPipelineRunner extends PipelineRunner {
  idle(): Promise<void>;
}

export function createPipelineRunner(deps: Partial<HostDependencies> = {}): InProcessPipelineRunner {
  const listeners = createListenerSet();
  let disposed = false;
  const host = new PipelineHost(
    (message) => {
      if (!disposed) listeners.deliver(message);
    },
    { ...defaultHostDependencies(), ...deps },
  );
  return {
    kind: "in-process",
    send(message) {
      if (!disposed) void host.handle(message);
    },
    onMessage: (listener) => listeners.add(listener),
    idle: () => host.idle(),
    dispose() {
      disposed = true;
      listeners.clear();
    },
  };
}
