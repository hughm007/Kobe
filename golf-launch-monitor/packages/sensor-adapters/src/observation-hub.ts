import type { RawSensorObservation, Unsubscribe } from "@glm/shared-types";

export type ObservationCallback = (observation: RawSensorObservation) => void;

type Subscription = { readonly callback: ObservationCallback };

/**
 * Fan-out of observations to any number of subscribers.
 *
 * - Each subscribe() call is an independent subscription (subscribing the same function
 *   twice delivers twice; each Unsubscribe removes only its own subscription).
 * - Unsubscribing takes effect immediately, even in the middle of a delivery.
 * - A subscriber that throws is isolated: the error is caught and recorded in `lastError`,
 *   and delivery to the remaining subscribers (and of later observations) continues.
 */
export class ObservationHub {
  private readonly subscriptions = new Set<Subscription>();
  private lastErrorValue: unknown = null;
  private errorCount = 0;
  private deliveryDepth = 0;

  subscribe(callback: ObservationCallback): Unsubscribe {
    if (typeof callback !== "function") {
      throw new TypeError("subscribeToObservations: callback must be a function");
    }
    const subscription: Subscription = { callback };
    this.subscriptions.add(subscription);
    return () => {
      this.subscriptions.delete(subscription);
    };
  }

  publish(observation: RawSensorObservation): void {
    this.deliveryDepth += 1;
    try {
      // Iterate over a snapshot so subscribe() inside a callback does not receive the
      // observation that is currently being delivered.
      for (const subscription of [...this.subscriptions]) {
        if (!this.subscriptions.has(subscription)) continue;
        try {
          subscription.callback(observation);
        } catch (error) {
          this.lastErrorValue = error;
          this.errorCount += 1;
        }
      }
    } finally {
      this.deliveryDepth -= 1;
    }
  }

  /** True while publish() is running, i.e. when the caller is inside a subscriber callback. */
  get isDelivering(): boolean {
    return this.deliveryDepth > 0;
  }

  publishAll(observations: readonly RawSensorObservation[]): void {
    for (const observation of observations) this.publish(observation);
  }

  get subscriberCount(): number {
    return this.subscriptions.size;
  }

  /** The most recent value thrown by a subscriber, or null if none has thrown. */
  get lastError(): unknown {
    return this.lastErrorValue;
  }

  get subscriberErrorCount(): number {
    return this.errorCount;
  }
}
