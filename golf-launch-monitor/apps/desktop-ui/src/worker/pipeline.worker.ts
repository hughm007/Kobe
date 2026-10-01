/**
 * Module Web Worker: a thin shell around PipelineHost. All decision logic lives in host.ts and
 * ../pipeline/*, which are tested without a Worker.
 */
import { defaultHostDependencies, PipelineHost } from "./host";
import type { UiToWorkerMessage, WorkerToUiMessage } from "./protocol";

type WorkerScope = {
  postMessage(message: WorkerToUiMessage): void;
  addEventListener(type: "message", listener: (event: MessageEvent<UiToWorkerMessage>) => void): void;
};

const scope = globalThis as unknown as WorkerScope;
const host = new PipelineHost((message) => scope.postMessage(message), defaultHostDependencies());

scope.addEventListener("message", (event) => {
  void host.handle(event.data);
});
