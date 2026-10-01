import type { DisplayValue, ProvenanceBadge } from "@glm/presentation";

/** One-line help shown as a tooltip; the badge text itself is always visible (never colour alone). */
export const BADGE_HELP: Readonly<Record<ProvenanceBadge, string>> = Object.freeze({
  MEASURED: "Measured by a sensor for this shot.",
  ESTIMATED: "Estimated from a player or club model; not measured.",
  ASSUMED: "Generic assumed value (allowed in Settings); not about this shot.",
  CALCULATED: "Calculated by the flight model from the launch state; not observed.",
  SYNTHETIC: "Synthetic data generated for testing; not measured.",
  MANUAL: "Entered by hand (developer mode); not measured.",
  UNAVAILABLE: "Not available for this shot.",
});

export function Badge({ badge, minor = false }: { readonly badge: ProvenanceBadge; readonly minor?: boolean }) {
  return (
    <span className={`badge badge-${badge.toLowerCase()}${minor ? " badge-minor" : ""}`} title={BADGE_HELP[badge]}>
      {badge}
    </span>
  );
}

/** Primary badge first, then the secondary (basis) badges from @glm/presentation. */
export function BadgeRow({ value }: { readonly value: DisplayValue }) {
  return (
    <span className="badge-row">
      <Badge badge={value.badge} />
      {value.secondaryBadges.map((b) => (
        <Badge key={b} badge={b} minor />
      ))}
    </span>
  );
}
