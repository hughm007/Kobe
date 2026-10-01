import {
  deepFreeze,
  type BounceEvent,
  type GroundMotionResult,
  type GroundTermination,
  type SurfaceType,
  type TerrainQuery,
  type TerrainSample,
  type TrajectorySample,
  type Vec3,
} from "@glm/shared-types";
import { addScaled, dot, isFiniteVec, normalize } from "@glm/core-math";
import type { BallInertiaProfile } from "./ball";
import { resolveImpact } from "./impact";
import { simulateRoll } from "./roll";
import { DEFAULT_GROUND_SETTINGS, GROUND_MODEL_VERSION, type GroundSettings } from "./version";

export type BallKinematicState = {
  readonly positionM: Vec3;
  readonly velocityMps: Vec3;
  readonly angularVelocityRadPerSec: Vec3;
};

export type GroundContact = BallKinematicState & {
  /** Seconds since the launch reference time. */
  readonly timeS: number;
  readonly terrain: TerrainSample;
};

/**
 * Air hop between bounces, injected by the caller (normally the ballistics integrator with
 * phase "bounce-air"). Ground physics never flies the ball itself, so air and ground models
 * stay independent. `startTimeS` is absolute; returned times must be absolute too: samples
 * non-decreasing and inside [startTimeS, contact.timeS] (or from startTimeS on if there is
 * no contact), and contact.timeS > startTimeS. simulateGroundMotion throws otherwise.
 */
export type HopSimulator = (
  state: BallKinematicState,
  startTimeS: number,
) => {
  readonly samples: readonly TrajectorySample[];
  readonly contact: GroundContact | null;
  readonly termination: string;
};

export type GroundMotionSettings = Partial<GroundSettings> & {
  /** Ground-phase (bounce + roll) time limit measured from the first contact, s. */
  readonly maxGroundTimeS: number;
  readonly outputSampleIntervalS: number;
};

export type GroundMotionInput = {
  readonly firstContact: GroundContact;
  readonly terrain: TerrainQuery;
  readonly ballProfile: BallInertiaProfile;
  readonly gravityMps2: number;
  readonly hop: HopSimulator;
  readonly settings: GroundMotionSettings;
};

/**
 * Bounce sequence followed by skid and roll (docs/terrain-model.md §6).
 *
 * At each contact the impact is resolved (crater-tilted contact plane, §3) and recorded as a
 * BounceEvent. The crater is local to the impact: what follows uses the TRUE surface normal.
 * If the outgoing speed along it exceeds minBounceNormalSpeedMps, fewer than maxBounces have
 * been resolved and ground time remains, the injected hop flies the ball to its next contact;
 * otherwise the normal component is removed and simulateRoll takes over — unless the ball is still
 * faster than maxRollEntrySpeedMps along the surface, in which case it keeps skipping at exactly
 * minBounceNormalSpeedMps (continuity across the threshold; see GroundSettings). Contacts on terminal surfaces end
 * the motion at once without a bounce. A hop that ends without contact ends the motion with
 * "max-time"; a hop reporting "numerical-failure" throws.
 */
export function simulateGroundMotion(input: GroundMotionInput): GroundMotionResult {
  const settings: GroundSettings & GroundMotionSettings = { ...DEFAULT_GROUND_SETTINGS, ...stripUndefined(input.settings) };
  if (!Number.isFinite(settings.maxGroundTimeS) || settings.maxGroundTimeS < 0) {
    throw new RangeError(`simulateGroundMotion: maxGroundTimeS must be >= 0, got ${settings.maxGroundTimeS}`);
  }
  if (!Number.isInteger(settings.maxBounces) || settings.maxBounces < 1) {
    throw new RangeError(`simulateGroundMotion: maxBounces must be a positive integer, got ${settings.maxBounces}`);
  }
  if (!Number.isFinite(settings.minBounceNormalSpeedMps) || settings.minBounceNormalSpeedMps < 0) {
    throw new RangeError("simulateGroundMotion: minBounceNormalSpeedMps must be >= 0");
  }
  if (Number.isNaN(settings.maxRollEntrySpeedMps) || settings.maxRollEntrySpeedMps < 0) {
    throw new RangeError("simulateGroundMotion: maxRollEntrySpeedMps must be >= 0 (Infinity disables forced skips)");
  }
  const first = input.firstContact;
  assertContact(first, "firstContact");
  if (first.timeS < 0) {
    throw new RangeError(`simulateGroundMotion: firstContact.timeS must be >= 0 (seconds since launch), got ${first.timeS}`);
  }
  const deadlineS = first.timeS + settings.maxGroundTimeS;

  const bounces: BounceEvent[] = [];
  const samples: TrajectorySample[] = [];
  /**
   * Appends validated samples up to `untilS`. A sample at an instant already recorded (the
   * contact instant shared by consecutive segments) is kept once; nothing else is dropped.
   */
  const appendSamples = (incoming: readonly TrajectorySample[], untilS: number): void => {
    for (const sample of incoming) {
      if (sample.tS > untilS) break;
      const last = samples[samples.length - 1];
      if (last === undefined || sample.tS > last.tS) samples.push(copySample(sample));
    }
  };
  const finish = (
    termination: GroundTermination,
    restPositionM: Vec3,
    restTimeS: number,
    finalSurface: SurfaceType,
    rollStartPositionM: Vec3 | null,
  ): GroundMotionResult =>
    deepFreeze({
      modelVersion: GROUND_MODEL_VERSION,
      bounces,
      samples,
      rollStartPositionM,
      restPositionM,
      restTimeS,
      termination,
      finalSurface,
    });

  let contact = first;
  if (contact.terrain.surface.terminal) {
    return finish("terminal-surface", copyVec(contact.positionM), contact.timeS, contact.terrain.surface.type, null);
  }

  for (;;) {
    const surface = contact.terrain.surface;
    const n = normalize(contact.terrain.normal);
    if (n === null) throw new RangeError("simulateGroundMotion: contact normal must be non-zero");
    const impact = resolveImpact({
      velocityMps: contact.velocityMps,
      angularVelocityRadPerSec: contact.angularVelocityRadPerSec,
      normal: n,
      surface,
      ballProfile: input.ballProfile,
    });
    bounces.push({
      index: bounces.length,
      timeS: contact.timeS,
      positionM: copyVec(contact.positionM),
      incomingVelocityMps: copyVec(contact.velocityMps),
      outgoingVelocityMps: copyVec(impact.velocityMps),
      incomingAngularVelocityRadPerSec: copyVec(contact.angularVelocityRadPerSec),
      outgoingAngularVelocityRadPerSec: copyVec(impact.angularVelocityRadPerSec),
      surface: surface.type,
      regime: impact.regime,
    });

    // Along the TRUE normal; may be negative after a backward bounce out of a crater, in which
    // case the ball rolls with that (into-ground) component removed.
    const outgoingNormalSpeed = dot(impact.velocityMps, n);
    const canHop = bounces.length < settings.maxBounces && contact.timeS < deadlineS;
    let hopVelocity = impact.velocityMps;
    let hops = canHop && outgoingNormalSpeed > settings.minBounceNormalSpeedMps;
    if (canHop && !hops) {
      // Too fast to start rolling: keep skipping at the threshold normal speed (see
      // GroundSettings.maxRollEntrySpeedMps), so the result is continuous across the threshold.
      const skip = skipAtThreshold(impact.velocityMps, n, outgoingNormalSpeed, settings);
      if (skip !== null) {
        hopVelocity = skip;
        hops = true;
      }
    }
    if (hopVelocity !== impact.velocityMps) {
      // Record what the ball actually leaves the contact with.
      const last = bounces[bounces.length - 1] as BounceEvent;
      bounces[bounces.length - 1] = { ...last, outgoingVelocityMps: copyVec(hopVelocity) };
    }
    if (!hops) {
      const roll = simulateRoll({
        positionM: contact.positionM,
        velocityMps: addScaled(impact.velocityMps, n, -outgoingNormalSpeed),
        angularVelocityRadPerSec: impact.angularVelocityRadPerSec,
        terrain: input.terrain,
        ballProfile: input.ballProfile,
        gravityMps2: input.gravityMps2,
        startTimeS: contact.timeS,
        settings: {
          timestepS: settings.rollTimestepS,
          maxTimeS: Math.max(0, deadlineS - contact.timeS),
          outputSampleIntervalS: settings.outputSampleIntervalS,
          restSpeedMps: settings.restSpeedMps,
          slipToRollToleranceMps: settings.slipToRollToleranceMps,
        },
      });
      appendSamples(roll.samples, Number.POSITIVE_INFINITY);
      return finish(roll.termination, roll.restPositionM, roll.restTimeS, roll.finalSurface, roll.rollStartPositionM);
    }

    const hop = input.hop(
      {
        positionM: contact.positionM,
        velocityMps: hopVelocity,
        angularVelocityRadPerSec: impact.angularVelocityRadPerSec,
      },
      contact.timeS,
    );
    const next = hop.contact;
    if (next !== null) assertContact(next, "hop contact");
    assertHopTiming(hop.samples, contact.timeS, next === null ? null : next.timeS, bounces.length);
    appendSamples(hop.samples, deadlineS);
    if (next === null || next.timeS > deadlineS) {
      if (next === null && hop.termination === "numerical-failure") {
        throw new Error("simulateGroundMotion: bounce hop reported numerical-failure");
      }
      // Out of ground time mid-hop: report where the ball was when time ran out.
      const last = samples[samples.length - 1];
      const position = last !== undefined && last.tS > contact.timeS ? last.positionM : contact.positionM;
      const time = last !== undefined && last.tS > contact.timeS ? last.tS : contact.timeS;
      const below = input.terrain.sample(position.x, position.y);
      return finish("max-time", copyVec(position), time, below.surface.type, null);
    }
    if (next.terrain.surface.terminal) {
      return finish("terminal-surface", copyVec(next.positionM), next.timeS, next.terrain.surface.type, null);
    }
    contact = next;
  }
}

/**
 * Outgoing velocity for a forced skip: normal component raised to minBounceNormalSpeedMps and
 * the tangential component scaled down so |v| is unchanged (no energy is created). Null when the
 * tangential speed is at or below maxRollEntrySpeedMps (the ball may roll) or the threshold is 0.
 */
function skipAtThreshold(v: Vec3, n: Vec3, normalSpeed: number, settings: GroundSettings): Vec3 | null {
  const vt = addScaled(v, n, -normalSpeed);
  const tangential = Math.hypot(vt.x, vt.y, vt.z);
  const target = settings.minBounceNormalSpeedMps;
  if (!(target > 0) || !(tangential > settings.maxRollEntrySpeedMps)) return null;
  const speedSq = tangential * tangential + normalSpeed * normalSpeed;
  const scaleT = Math.sqrt(Math.max(0, speedSq - target * target)) / tangential;
  return addScaled({ x: vt.x * scaleT, y: vt.y * scaleT, z: vt.z * scaleT }, n, target);
}

export type GroundDistances = {
  /** Signed along-track distance, first contact -> roll start (whole ground phase if no roll), m. */
  readonly bounceDistanceM: number;
  /** Signed along-track distance, roll start -> rest (0 if the ball never rolled), m. */
  readonly rollDistanceM: number;
};

/** Horizontal speeds below this have no defined heading; the target line (+X) is used. */
const HEADING_EPSILON_MPS = 1e-9;

/**
 * Ground-phase distances, SIGNED along the track: the horizontal displacement projected on the
 * landing heading (horizontal direction of the first bounce's incoming velocity; +X, the target
 * line, if there was no bounce or the landing was vertical). Bounce = first contact -> roll
 * start (bouncing plus skid), roll = roll start -> rest; with no roll, bounce = first contact ->
 * rest and roll = 0. A ball that checks and spins back gives a negative value, and
 * bounce + roll always equals the net along-track ground displacement (first contact -> rest).
 * Sideways displacement (e.g. a kick off a side slope) is excluded; the lateral offset at rest
 * is a separate metric.
 */
export function groundDistances(
  firstContactM: Vec3,
  result: Pick<GroundMotionResult, "rollStartPositionM" | "restPositionM"> & {
    readonly bounces: readonly Pick<BounceEvent, "incomingVelocityMps">[];
  },
): GroundDistances {
  const landingVelocity = result.bounces[0]?.incomingVelocityMps;
  const hx = landingVelocity?.x ?? 0;
  const hy = landingVelocity?.y ?? 0;
  const h = Math.hypot(hx, hy);
  const ux = h > HEADING_EPSILON_MPS ? hx / h : 1;
  const uy = h > HEADING_EPSILON_MPS ? hy / h : 0;
  const along = (from: Vec3, to: Vec3): number => (to.x - from.x) * ux + (to.y - from.y) * uy;
  if (result.rollStartPositionM === null) {
    return { bounceDistanceM: along(firstContactM, result.restPositionM), rollDistanceM: 0 };
  }
  return {
    bounceDistanceM: along(firstContactM, result.rollStartPositionM),
    rollDistanceM: along(result.rollStartPositionM, result.restPositionM),
  };
}

/** Relative slack for hop sample times at the window edges (floating-point rounding only). */
const HOP_TIME_TOLERANCE_S = 1e-9;

/**
 * A hop must return absolute, ordered times inside its own window. Anything else (relative
 * times, a contact that runs backward, samples outside [start, contact]) is a caller bug that
 * would otherwise corrupt bounce times and samples silently.
 */
function assertHopTiming(
  hopSamples: readonly TrajectorySample[],
  startTimeS: number,
  contactTimeS: number | null,
  bounceIndex: number,
): void {
  const label = `simulateGroundMotion: hop after bounce ${bounceIndex - 1} (starting at t = ${startTimeS} s)`;
  if (contactTimeS !== null && !(contactTimeS > startTimeS)) {
    throw new Error(`${label} returned contact time ${contactTimeS} s, not after its start; HopSimulator times must be absolute`);
  }
  const tolerance = HOP_TIME_TOLERANCE_S * Math.max(1, Math.abs(startTimeS));
  const upper = contactTimeS === null ? Number.POSITIVE_INFINITY : contactTimeS + tolerance;
  let previous = Number.NEGATIVE_INFINITY;
  for (const [i, sample] of hopSamples.entries()) {
    const tS = sample.tS;
    if (!Number.isFinite(tS) || tS < startTimeS - tolerance || tS > upper) {
      throw new Error(
        `${label} returned sample ${i} at t = ${tS} s, outside [${startTimeS}, ${contactTimeS ?? "end"}] s; HopSimulator times must be absolute`,
      );
    }
    if (tS < previous) {
      throw new Error(`${label} returned sample ${i} at t = ${tS} s before the previous sample (${previous} s)`);
    }
    previous = tS;
  }
}

function assertContact(contact: GroundContact, label: string): void {
  if (
    !Number.isFinite(contact.timeS) ||
    !isFiniteVec(contact.positionM) ||
    !isFiniteVec(contact.velocityMps) ||
    !isFiniteVec(contact.angularVelocityRadPerSec)
  ) {
    throw new RangeError(`simulateGroundMotion: ${label} state must be finite`);
  }
}

/** Copies so that deep-freezing the result never freezes objects owned by the caller. */
function copyVec(v: Vec3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

function copySample(s: TrajectorySample): TrajectorySample {
  return {
    tS: s.tS,
    positionM: copyVec(s.positionM),
    velocityMps: copyVec(s.velocityMps),
    angularVelocityRadPerSec: copyVec(s.angularVelocityRadPerSec),
    phase: s.phase,
  };
}

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}
