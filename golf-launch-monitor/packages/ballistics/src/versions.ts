/**
 * Model version identifiers for this package. Any change to an equation, a constant, a
 * default parameter, or the integrator that can change a simulated number must bump the
 * matching version in the same commit (docs/physics-model.md).
 */

/** Air-flight physics: force model, aerodynamic model registry, shipped ball profiles, integrator. */
export const PHYSICS_MODEL_VERSION = "glm-physics-0.1.0-provisional";

/** Environment model: moist-air density, viscosity, ISA pressure, defaults and validation. */
export const ENVIRONMENT_MODEL_VERSION = "glm-env-0.1.0";
