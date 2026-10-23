import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { randomId } from "./ids";
import type { AppRuntime } from "./state/AppContext";
import { browserStorage } from "./state/settings";
import { downloadText } from "./storage/download";
import { createLocalRepository } from "./storage/repository";
import { createBrowserPipelineRunner } from "./worker/browser-runner";
import "./styles.css";

const storage = createLocalRepository();
const runtime: AppRuntime = {
  runner: createBrowserPipelineRunner(),
  repository: storage.repository,
  storageDescription: storage.description,
  storagePersistent: storage.persistent,
  settingsStorage: browserStorage(),
  newId: randomId,
  nowUtc: () => new Date().toISOString(),
  download: downloadText,
};

const root = document.getElementById("root");
if (root === null) throw new Error("index.html is missing #root");
createRoot(root).render(
  <StrictMode>
    <App runtime={runtime} />
  </StrictMode>,
);
