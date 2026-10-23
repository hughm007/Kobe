/**
 * Compile-time proof that each runtime schema and its hand-written contract describe the
 * same shape. If a field is added to one but not the other, `npm run typecheck` fails here.
 */
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import type {
  DeepReadonly,
  BallAerodynamicsProfile,
  BallAerodynamicsProfileSchema,
  CalibrationRecord,
  CalibrationRecordSchema,
  Club,
  ClubSchema,
  EnvironmentProfile,
  EnvironmentProfileSchema,
  LaunchState,
  LaunchStateSchema,
  Player,
  PlayerSchema,
  RawSensorObservation,
  RawSensorObservationSchema,
  ReplayHeader,
  ReplayHeaderSchema,
  ReplayRecord,
  ReplayRecordSchema,
  SensorCapabilities,
  SensorCapabilitiesSchema,
  SensorConfiguration,
  SensorConfigurationSchema,
  Session,
  SessionSchema,
  ShotRecord,
  ShotRecordSchema,
  ShotResult,
  ShotResultSchema,
  SurfaceProperties,
  SurfacePropertiesSchema,
} from "../src/index";

type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type SameKeys<A, B> = MutuallyAssignable<keyof A, keyof B>;
// Contracts are deeply readonly; zod infers mutable types, so compare against the
// readonly view of the inferred type (readonly arrays are not assignable to mutable ones).
type Inferred<Schema extends z.ZodType> = DeepReadonly<z.infer<Schema>>;
type Parity<Contract, Schema extends z.ZodType> =
  MutuallyAssignable<Contract, Inferred<Schema>> extends true
    ? SameKeys<Contract, Inferred<Schema>> extends true
      ? true
      : false
    : false;

function assertParity<T extends true>(): T {
  return true as T;
}

describe("schema/contract parity", () => {
  it("every exported schema matches its TypeScript contract", () => {
    const checks = [
      assertParity<Parity<LaunchState, typeof LaunchStateSchema>>(),
      assertParity<Parity<ShotResult, typeof ShotResultSchema>>(),
      assertParity<Parity<ShotRecord, typeof ShotRecordSchema>>(),
      assertParity<Parity<Session, typeof SessionSchema>>(),
      assertParity<Parity<RawSensorObservation, typeof RawSensorObservationSchema>>(),
      assertParity<Parity<ReplayHeader, typeof ReplayHeaderSchema>>(),
      assertParity<Parity<ReplayRecord, typeof ReplayRecordSchema>>(),
      assertParity<Parity<CalibrationRecord, typeof CalibrationRecordSchema>>(),
      assertParity<Parity<SensorConfiguration, typeof SensorConfigurationSchema>>(),
      assertParity<Parity<SensorCapabilities, typeof SensorCapabilitiesSchema>>(),
      assertParity<Parity<EnvironmentProfile, typeof EnvironmentProfileSchema>>(),
      assertParity<Parity<BallAerodynamicsProfile, typeof BallAerodynamicsProfileSchema>>(),
      assertParity<Parity<SurfaceProperties, typeof SurfacePropertiesSchema>>(),
      assertParity<Parity<Player, typeof PlayerSchema>>(),
      assertParity<Parity<Club, typeof ClubSchema>>(),
    ];
    expect(checks.every(Boolean)).toBe(true);
  });
});
