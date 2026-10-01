/**
 * Connection/capture state machine shared by the software adapters.
 *
 *   disconnected --connect()--> connected --startCapture()--> capturing
 *        ^                         |  ^                           |
 *        +-------disconnect()------+  +-------stopCapture()-------+
 *
 * disconnect() is allowed from any state (it stops a running capture first) and is a no-op
 * when already disconnected, so it is safe in cleanup code. Every other invalid transition
 * throws a SensorStateError that names the adapter, the action and the current state.
 */
export type AdapterState = "disconnected" | "connected" | "capturing";

export class SensorStateError extends Error {
  override readonly name = "SensorStateError";
  readonly state: AdapterState;
  readonly action: string;

  constructor(adapterId: string, action: string, state: AdapterState, hint: string) {
    super(`${adapterId}: cannot ${action} while ${state}. ${hint}`);
    this.state = state;
    this.action = action;
  }
}

/**
 * Thrown when an observation callback calls back into the adapter that is delivering to it
 * with an action that would start a nested delivery or move the cursor (emitNextShot(),
 * startCapture(), reset(), submitManualLaunch()). Nested delivery would hand the later
 * subscribers a newer observation before the current one and break per-sensor time order.
 * stopCapture() and disconnect() stay allowed inside callbacks: delivery then halts at the
 * next observation boundary.
 */
export class ReentrantEmissionError extends Error {
  override readonly name = "ReentrantEmissionError";
  readonly action: string;

  constructor(adapterId: string, action: string) {
    super(
      `${adapterId}: cannot call ${action} from inside an observation callback while observations are being delivered. ` +
        "Defer the call until the callback has returned (e.g. with queueMicrotask).",
    );
    this.action = action;
  }
}

export class AdapterLifecycle {
  private current: AdapterState = "disconnected";

  constructor(private readonly adapterId: string) {}

  get state(): AdapterState {
    return this.current;
  }

  get isConnected(): boolean {
    return this.current !== "disconnected";
  }

  connect(): void {
    if (this.current !== "disconnected") {
      throw new SensorStateError(this.adapterId, "connect()", this.current, "The adapter is already connected.");
    }
    this.current = "connected";
  }

  disconnect(): void {
    this.current = "disconnected";
  }

  startCapture(): void {
    if (this.current === "disconnected") {
      throw new SensorStateError(this.adapterId, "startCapture()", this.current, "Call connect() first.");
    }
    if (this.current === "capturing") {
      throw new SensorStateError(this.adapterId, "startCapture()", this.current, "Capture is already running.");
    }
    this.current = "capturing";
  }

  stopCapture(): void {
    if (this.current !== "capturing") {
      throw new SensorStateError(this.adapterId, "stopCapture()", this.current, "Capture is not running.");
    }
    this.current = "connected";
  }

  /** Guard for actions that deliver observations (a sensor only emits while capturing). */
  requireCapturing(action: string): void {
    if (this.current !== "capturing") {
      const hint = this.current === "disconnected" ? "Call connect() and startCapture() first." : "Call startCapture() first.";
      throw new SensorStateError(this.adapterId, action, this.current, hint);
    }
  }
}
