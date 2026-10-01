import type { LaunchState } from "./launch-state";
import type { CalculatedValue } from "./measurement";
import type { EnvironmentProfile } from "./physics-profiles";
import type { Vec3 } from "./primitives";
import type { SurfaceType } from "./terrain";

export type TrajectoryPhase = "air" | "bounce-air" | "roll";

export type TrajectorySample = {
  /** Seconds since the launch reference time. */
  readonly tS: number;
  readonly positionM: Vec3;
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
  readonly phase: TrajectoryPhase;
};

export type SimulationSettings = {
  /** Fixed RK4 timestep for air flight, s. */
  readonly timestepS: number;
  /** Air-flight time limit, s. */
  readonly maxFlightTimeS: number;
  /** Ground-phase (bounce + roll) time limit, s. */
  readonly maxGroundTimeS: number;
  /** Interval at which trajectory samples are retained for output, s. */
  readonly outputSampleIntervalS: number;
  /** Number of Monte Carlo samples for uncertainty propagation; 0 disables it. */
  readonly monteCarloSamples: number;
  /** Seed for the deterministic Monte Carlo generator. */
  readonly monteCarloSeed: number;
};

export type FlightTermination = "ground-contact" | "max-time" | "numerical-failure";

export type AirFlightResult = {
  readonly modelVersion: string;
  readonly integrator: { readonly method: "rk4"; readonly timestepS: number };
  readonly dragModelId: string;
  readonly liftModelId: string;
  readonly spinDecayModelId: string;
  readonly samples: readonly TrajectorySample[];
  readonly termination: FlightTermination;
  readonly flightTimeS: number;
  readonly apex: {
    readonly timeS: number;
    readonly positionM: Vec3;
    /** Apex height above the launch point's height, m. */
    readonly heightAboveLaunchM: number;
  };
  /** E.g. "ball speed above profile applicable range". */
  readonly applicabilityWarnings: readonly string[];
};

export type LandingResult = {
  readonly timeS: number;
  readonly positionM: Vec3;
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
  readonly surface: SurfaceType;
  readonly surfaceNormal: Vec3;
};

export type BounceEvent = {
  readonly index: number;
  readonly timeS: number;
  readonly positionM: Vec3;
  readonly incomingVelocityMps: Vec3;
  readonly outgoingVelocityMps: Vec3;
  readonly incomingAngularVelocityRadPerSec: Vec3;
  readonly outgoingAngularVelocityRadPerSec: Vec3;
  readonly surface: SurfaceType;
  /** Whether the contact point was still sliding when the ball left the surface. */
  readonly regime: "sliding" | "rolling-at-separation";
};

export type GroundTermination = "rest" | "terminal-surface" | "max-time";

export type GroundMotionResult = {
  readonly modelVersion: string;
  readonly bounces: readonly BounceEvent[];
  readonly samples: readonly TrajectorySample[];
  /** Where continuous rolling began, or null if the ball never rolled. */
  readonly rollStartPositionM: Vec3 | null;
  readonly restPositionM: Vec3;
  /** Seconds since the launch reference time. */
  readonly restTimeS: number;
  readonly termination: GroundTermination;
  readonly finalSurface: SurfaceType;
};

export type LieType =
  | "range"
  | "tee"
  | "fairway"
  | "first-cut"
  | "rough"
  | "bunker"
  | "green"
  | "fringe"
  | "cart-path"
  | "water"
  | "out-of-bounds"
  | "penalty-area"
  | "trees"
  | "unknown";

export type Penalty = {
  readonly kind: "water" | "out-of-bounds" | "penalty-area" | "unplayable";
  readonly strokes: number;
  readonly reason: string;
};

export type ScoringEvent = {
  readonly kind: "holed" | "on-green" | "penalty";
  readonly detail: string;
};

/**
 * Calculated, golfer-facing results. Distances are horizontal (XY-plane) distances from the
 * launch point; lateral values are signed, positive = left of the target line; bounce and roll
 * are signed along-track displacements (docs/coordinate-system.md §5).
 * Angles are radians internally and converted for display only.
 */
export type ShotMetrics = {
  /** Horizontal distance from launch to first ground contact. */
  readonly carryM: CalculatedValue<number>;
  /** Signed lateral offset from the target line at first ground contact (+left). */
  readonly carryLateralM: CalculatedValue<number>;
  /** Horizontal distance from launch to the final resting position. */
  readonly totalM: CalculatedValue<number>;
  /** Signed lateral offset from the target line at rest (+left). */
  readonly totalLateralM: CalculatedValue<number>;
  /** Signed horizontal displacement along the landing heading from first contact to the start of continuous rolling (negative if the ball spins back). */
  readonly bounceDistanceM: CalculatedValue<number>;
  /** Signed horizontal displacement along the landing heading while rolling (negative if the ball spins back). */
  readonly rollDistanceM: CalculatedValue<number>;
  /** Apex height above launch height. */
  readonly apexHeightM: CalculatedValue<number>;
  /** Horizontal distance from launch to the apex. */
  readonly apexDistanceM: CalculatedValue<number>;
  readonly flightTimeS: CalculatedValue<number>;
  /** Angle of the velocity below horizontal at first ground contact. */
  readonly descentAngleRad: CalculatedValue<number>;
  readonly landingSpeedMps: CalculatedValue<number>;
  /** Heading of the horizontal landing velocity, right-hand about +Z (+left). */
  readonly landingDirectionRad: CalculatedValue<number>;
  /** Signed lateral bend at landing relative to the initial start line (+left). */
  readonly curveM: CalculatedValue<number>;
  readonly spinAtLandingRadPerSec: CalculatedValue<number>;
};

export type PhysicsProvenance = {
  readonly physicsModelVersion: string;
  readonly groundModelVersion: string;
  readonly ballProfileId: string;
  readonly ballProfileVersion: string;
  readonly environment: EnvironmentProfile;
  readonly terrainId: string;
  readonly terrainVersion: string;
  readonly settings: SimulationSettings;
};

/**
 * The physical result of one shot. Course play consumes this, never raw sensor data.
 */
export type ShotResult = {
  readonly launch: LaunchState;
  readonly airFlight: AirFlightResult;
  readonly landing: LandingResult;
  readonly groundMotion: GroundMotionResult;
  readonly finalPositionM: Vec3;
  readonly finalLie: LieType;
  readonly penalties: readonly Penalty[];
  readonly scoringEvent: ScoringEvent | null;
  readonly simulationConfidence: number;

  readonly metrics: ShotMetrics;
  readonly physics: PhysicsProvenance;
  readonly warnings: readonly string[];
};
