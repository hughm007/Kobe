import { validityBanner } from "@glm/presentation";
import type { ShotRecord } from "@glm/shared-types";
import { IMPERIAL_GOLF_UNITS } from "@glm/units";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { ShotView } from "../src/components/ShotView";
import type { UiToWorkerMessage, WorkerToUiMessage } from "../src/worker/protocol";
import { createWorkerRunner, type WorkerLike } from "../src/worker/runner-api";
import { invalidRecord } from "./helpers";

let invalid: ShotRecord;

beforeAll(async () => {
  invalid = await invalidRecord();
});

describe("invalid shots", () => {
  it("show the rejection reasons verbatim and never carry/total or a trajectory", () => {
    expect(invalid.launch.validity).toBe("invalid");
    expect(invalid.result).toBeNull();
    const { container } = render(<ShotView record={invalid} unitSystem={IMPERIAL_GOLF_UNITS} precision="golfer" />);
    const banner = validityBanner(invalid.launch);
    expect(screen.getByText("Invalid shot: rejected")).toBeInTheDocument();
    expect(banner.messages.some((m) => /outside calibrated hitting zone/i.test(m))).toBe(true);
    for (const m of banner.messages) expect(screen.getByText(m)).toBeInTheDocument();
    expect(screen.queryByTestId("metric-carry")).not.toBeInTheDocument();
    expect(screen.queryByTestId("metric-total")).not.toBeInTheDocument();
    expect(screen.getAllByText(invalid.simulationSkippedReason as string, { exact: false }).length).toBeGreaterThan(0);
    expect(container.querySelector(".trace-carry")).toBeNull();
    expect(screen.getByText("Validity: invalid")).toBeInTheDocument();
  });
});

describe("worker runner", () => {
  it("forwards messages both ways and turns a worker crash into an error and busy=false", () => {
    const posted: UiToWorkerMessage[] = [];
    const handlers: { message?: (e: MessageEvent<WorkerToUiMessage>) => void; error?: (e: ErrorEvent) => void } = {};
    let terminated = false;
    const fake: WorkerLike = {
      postMessage: (m) => posted.push(m),
      addEventListener: ((type: "message" | "error", listener: (e: never) => void) => {
        handlers[type] = listener as never;
      }) as WorkerLike["addEventListener"],
      terminate: () => {
        terminated = true;
      },
    };
    const runner = createWorkerRunner(fake);
    const received: WorkerToUiMessage[] = [];
    runner.onMessage((m) => received.push(m));
    runner.send({ type: "replay-next-shot" });
    expect(posted).toEqual([{ type: "replay-next-shot" }]);
    handlers.message!({ data: { type: "busy", busy: true } } as MessageEvent<WorkerToUiMessage>);
    handlers.error!({ message: "boom" } as ErrorEvent);
    expect(received).toEqual([
      { type: "busy", busy: true },
      { type: "error", message: "Pipeline worker error: boom" },
      { type: "busy", busy: false },
    ]);
    runner.dispose();
    expect(terminated).toBe(true);
    expect(runner.kind).toBe("worker");
  });
});
