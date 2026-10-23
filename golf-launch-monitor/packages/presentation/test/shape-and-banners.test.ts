import { degToRad } from "@glm/units";
import { describe, expect, it } from "vitest";
import {
  dataOriginBanner,
  SHOT_SHAPE_SEVERE_MIN_DEG,
  SHOT_SHAPE_SEVERE_MIN_RAD,
  SHOT_SHAPE_STRAIGHT_MAX_DEG,
  SHOT_SHAPE_STRAIGHT_MAX_RAD,
  shotShapeLabel,
  validityBanner,
} from "../src/index";
import { makeLaunch } from "./fixtures";

describe("shotShapeLabel (coordinate-system.md §6)", () => {
  it("regression: topspin-dominant tilts (|tilt| > 90°, topped shots) are 'topspin', never a noise-chosen hook/slice", () => {
    for (const deg of [180, -180, 179, -179, 178.45, -178.19, 135, -135, 91, -91]) {
      expect(shotShapeLabel(degToRad(deg), "right"), `${deg}`).toBe("topspin");
      expect(shotShapeLabel(degToRad(deg), "left"), `${deg}`).toBe("topspin");
    }
    // Pure sidespin (90°) is still a severe curve.
    expect(shotShapeLabel(degToRad(90), "right")).toBe("slice");
    expect(shotShapeLabel(degToRad(-90), "right")).toBe("hook");
  });

  it("exports the thresholds", () => {
    expect(SHOT_SHAPE_STRAIGHT_MAX_DEG).toBe(2);
    expect(SHOT_SHAPE_SEVERE_MIN_DEG).toBe(12);
    expect(SHOT_SHAPE_STRAIGHT_MAX_RAD).toBe(degToRad(2));
    expect(SHOT_SHAPE_SEVERE_MIN_RAD).toBe(degToRad(12));
  });

  it("right-handed: positive tilt (curves right) = fade / slice; negative = draw / hook", () => {
    expect(shotShapeLabel(degToRad(5), "right")).toBe("fade");
    expect(shotShapeLabel(degToRad(15), "right")).toBe("slice");
    expect(shotShapeLabel(degToRad(-5), "right")).toBe("draw");
    expect(shotShapeLabel(degToRad(-15), "right")).toBe("hook");
  });

  it("left-handed: the same ball flight gets the mirrored label", () => {
    expect(shotShapeLabel(degToRad(5), "left")).toBe("draw");
    expect(shotShapeLabel(degToRad(15), "left")).toBe("hook");
    expect(shotShapeLabel(degToRad(-5), "left")).toBe("fade");
    expect(shotShapeLabel(degToRad(-15), "left")).toBe("slice");
  });

  it("boundaries: |tilt| <= 2° straight, > 12° severe", () => {
    for (const hand of ["right", "left"] as const) {
      expect(shotShapeLabel(0, hand)).toBe("straight");
      expect(shotShapeLabel(-0, hand)).toBe("straight");
      expect(shotShapeLabel(degToRad(2), hand)).toBe("straight");
      expect(shotShapeLabel(degToRad(-2), hand)).toBe("straight");
    }
    expect(shotShapeLabel(degToRad(2.01), "right")).toBe("fade");
    expect(shotShapeLabel(degToRad(12), "right")).toBe("fade");
    expect(shotShapeLabel(degToRad(12.01), "right")).toBe("slice");
    expect(shotShapeLabel(degToRad(-12), "left")).toBe("fade");
    expect(shotShapeLabel(degToRad(-12.01), "left")).toBe("slice");
  });

  it("null -> unknown; non-finite or bad handedness throws", () => {
    expect(shotShapeLabel(null, "right")).toBe("unknown");
    expect(shotShapeLabel(null, "left")).toBe("unknown");
    expect(() => shotShapeLabel(Number.NaN, "right")).toThrow(RangeError);
    expect(() => shotShapeLabel(0.1, "ambidextrous" as never)).toThrow(/handedness/);
  });

  it("works from a LaunchState spin-axis field after a deg -> rad conversion", () => {
    const launch = makeLaunch();
    const tiltDeg = launch.spinAxisTiltDeg.value as number;
    expect(shotShapeLabel(degToRad(tiltDeg), launch.handedness)).toBe("fade");
  });
});

describe("validityBanner", () => {
  it("valid shot: no messages", () => {
    expect(validityBanner(makeLaunch())).toEqual({ level: "valid", title: "Valid shot", messages: [] });
  });

  it("provisional: warnings verbatim, in order", () => {
    const warnings = ["Spin estimated from club model (±600 rpm)", "Only 4 frames tracked"];
    const banner = validityBanner(makeLaunch({ validity: "provisional", warnings }));
    expect(banner.level).toBe("provisional");
    expect(banner.title).toMatch(/^Provisional/);
    expect(banner.messages).toEqual(warnings);
  });

  it("invalid: rejection reasons first, then warnings, verbatim", () => {
    const banner = validityBanner(
      makeLaunch({ validity: "invalid", rejectionReasons: ["Ball left the field of view after 2 frames"], warnings: ["Low light"] }),
    );
    expect(banner.level).toBe("invalid");
    expect(banner.title).toMatch(/^Invalid/);
    expect(banner.messages).toEqual(["Ball left the field of view after 2 frames", "Low light"]);
    expect(Object.isFrozen(banner.messages)).toBe(true);
  });

  it("throws on an unknown validity, including prototype keys", () => {
    for (const level of ["bogus", "constructor", "toString", "__proto__"]) {
      expect(() => validityBanner(makeLaunch({ validity: level as never })), level).toThrow(/unknown validity/);
    }
  });
});

describe("dataOriginBanner", () => {
  it("labels every non-live origin; live has no banner", () => {
    expect(dataOriginBanner("synthetic")).toBe("SYNTHETIC DATA — generated for testing, not measured.");
    expect(dataOriginBanner("manual")).toContain("developer manual entry");
    expect(dataOriginBanner("replay")).toContain("Replay of recorded data");
    expect(dataOriginBanner("live")).toBeNull();
    expect(() => dataOriginBanner("simulated" as never)).toThrow(/unknown data origin/);
    for (const key of ["toString", "constructor", "hasOwnProperty", "__proto__"]) {
      expect(() => dataOriginBanner(key as never), key).toThrow(/unknown data origin/);
    }
  });
});
