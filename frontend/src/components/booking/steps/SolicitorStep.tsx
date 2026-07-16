import Image from "next/image";
import type { Solicitor } from "@/application/booking/ports";
import { StateBanner } from "@/components/ui/StateBanner";

export function SolicitorStep({
  status,
  solicitors,
  error,
  selected,
  onSelect,
}: {
  status: "idle" | "loading" | "error" | "success";
  solicitors: Solicitor[] | null;
  error: string | null;
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  if (status === "loading" || status === "idle") {
    return <StateBanner variant="loading" title="Finding solicitors for this service…" />;
  }
  if (status === "error") {
    return <StateBanner variant="error" title="Couldn't load solicitors">{error}</StateBanner>;
  }
  if (!solicitors || solicitors.length === 0) {
    return (
      <StateBanner variant="empty" title="No solicitors currently handle this service">
        Please call the office directly and we&apos;ll arrange this for you.
      </StateBanner>
    );
  }

  return (
    <fieldset>
      <legend className="eyebrow" style={{ marginBottom: 20 }}>
        Choose a solicitor
      </legend>
      <div className="option-grid">
        {solicitors.map((s) => (
          <button
            key={s.slug}
            type="button"
            className="option-card"
            aria-pressed={selected === s.slug}
            onClick={() => onSelect(s.slug)}
          >
            <span className="option-card__media">
              <Image src={s.image} alt="" width={56} height={56} />
            </span>
            <span className="option-card__title">{s.name}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
