import type { IsoUtcTimestamp } from "./primitives";

export type Handedness = "right" | "left";

export const CLUB_CATEGORIES = [
  "driver",
  "fairway-wood",
  "hybrid",
  "long-iron",
  "mid-iron",
  "short-iron",
  "wedge",
  "putter",
] as const;

export type ClubCategory = (typeof CLUB_CATEGORIES)[number];

/**
 * A club in a player's bag. Clubs never carry a distance: carry and total always come from
 * the launch state and the physics model.
 */
export type Club = {
  readonly id: string;
  readonly label: string;
  readonly category: ClubCategory;
  /** Static (manufactured) loft, if known. Not dynamic loft. */
  readonly staticLoftDeg: number | null;
};

export type Player = {
  readonly id: string;
  readonly displayName: string;
  readonly handedness: Handedness;
  readonly createdUtc: IsoUtcTimestamp;
};
