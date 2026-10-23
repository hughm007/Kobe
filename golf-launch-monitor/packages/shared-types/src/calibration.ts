import type { IsoUtcTimestamp, Matrix, Vec3 } from "./primitives";

/** Pixel dimensions of an image. */
export type ImageSize = {
  readonly widthPx: number;
  readonly heightPx: number;
};

/**
 * Brown-Conrady (OpenCV "plumb bob") distortion coefficients:
 * radial k1, k2, k3 and tangential p1, p2.
 */
export type BrownConradyDistortion = {
  readonly model: "brown-conrady";
  readonly k1: number;
  readonly k2: number;
  readonly p1: number;
  readonly p2: number;
  readonly k3: number;
};

export type CameraIntrinsics = {
  readonly cameraId: string;
  readonly imageSize: ImageSize;
  /** Focal lengths in pixels. */
  readonly fxPx: number;
  readonly fyPx: number;
  /** Principal point in pixels. */
  readonly cxPx: number;
  readonly cyPx: number;
  readonly skew: number;
  readonly distortion: BrownConradyDistortion;
  /**
   * Hash of the locked device settings (resolution, focus, zoom, exposure mode) the
   * intrinsics were measured with. A mismatch at runtime invalidates the calibration.
   */
  readonly deviceConfigurationHash: string;
};

/**
 * Rigid transform from the WORLD frame to a CAMERA frame: p_cam = R * p_world + t.
 * The camera frame follows the OpenCV convention (+x right, +y down, +z forward).
 */
export type CameraExtrinsics = {
  readonly cameraId: string;
  /** 3x3 rotation matrix, row-major. */
  readonly rotationWorldToCamera: Matrix;
  /** Translation in meters. */
  readonly translationM: Vec3;
};

export type Plane = {
  /** Unit normal. */
  readonly normal: Vec3;
  /** Signed offset d in n . p = d (meters). */
  readonly offsetM: number;
};

/** Ties the world frame to the physical hitting bay (docs/calibration-procedure.md). */
export type WorldFrameCalibration = {
  /** Ball center at address, in the world frame (the origin by definition, so normally 0). */
  readonly addressPointM: Vec3;
  /** Unit vector along the target line in the ground plane (normally +X). */
  readonly targetLineUnit: Vec3;
  readonly groundPlane: Plane;
  readonly screenPlane: Plane | null;
  /** Height of the bottom of the ball above the mat/ground at address, m. */
  readonly teeHeightM: number;
  readonly method: "alignment-stick" | "laser" | "target-marker" | "board-on-ground" | "manual";
};

export type CalibrationStatus = "green" | "yellow" | "red" | "none";

export type PerCameraQuality = {
  readonly cameraId: string;
  readonly rmsReprojectionErrorPx: number;
  readonly boardCoverageScore: number;
  readonly imageCount: number;
};

export type CalibrationQualityReport = {
  readonly rmsReprojectionErrorPx: number;
  readonly perCamera: readonly PerCameraQuality[];
  /** Mean stereo epipolar error, pixels; null for single-camera setups. */
  readonly stereoEpipolarErrorPx: number | null;
  /** Relative error of a known physical length measured through the calibration. */
  readonly knownLengthRelativeError: number | null;
  /** Angle between calibrated and physically verified target line, radians. */
  readonly targetLineErrorRad: number | null;
  readonly evaluatedUtc: IsoUtcTimestamp;
};

export type CalibrationPatternSpec = {
  readonly type: "charuco" | "checkerboard";
  readonly squaresX: number;
  readonly squaresY: number;
  readonly squareSizeM: number;
  /** ChArUco only. */
  readonly markerSizeM: number | null;
  /** ChArUco only, e.g. "DICT_5X5_100". */
  readonly dictionary: string | null;
};

export type CalibrationRecord = {
  /** Unique, immutable version id. Every shot references the one it was measured with. */
  readonly version: string;
  readonly createdUtc: IsoUtcTimestamp;
  readonly sensorConfigurationVersion: string;
  readonly coordinateSystemVersion: string;
  readonly pattern: CalibrationPatternSpec;
  readonly intrinsics: readonly CameraIntrinsics[];
  readonly extrinsics: readonly CameraExtrinsics[];
  readonly worldFrame: WorldFrameCalibration | null;
  readonly quality: CalibrationQualityReport;
  readonly status: CalibrationStatus;
  readonly statusReasons: readonly string[];
  /** Local paths to retained calibration images/reports (only with diagnostic consent). */
  readonly artifactPaths: readonly string[];
};
