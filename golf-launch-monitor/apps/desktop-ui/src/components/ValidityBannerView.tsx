import { validityBanner } from "@glm/presentation";
import type { LaunchState } from "@glm/shared-types";

/** Title and messages verbatim from @glm/presentation (rejection reasons first, then warnings). */
export function ValidityBannerView({ launch }: { readonly launch: LaunchState }) {
  const banner = validityBanner(launch);
  return (
    <section className={`validity validity-${banner.level}`} aria-label="Shot validity">
      <h3 className="validity-title">{banner.title}</h3>
      {banner.messages.length > 0 && (
        <ul className="validity-messages">
          {banner.messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
