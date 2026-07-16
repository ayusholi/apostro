import type { Office } from "@/application/booking/ports";
import { StateBanner } from "@/components/ui/StateBanner";

export function OfficeStep({
  status,
  offices,
  error,
  selected,
  onSelect,
  onContinue,
}: {
  status: "idle" | "loading" | "error" | "success";
  offices: Office[] | null;
  error: string | null;
  selected: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
}) {
  if (status === "loading" || status === "idle") {
    return <StateBanner variant="loading" title="Finding offices this solicitor works from…" />;
  }
  if (status === "error") {
    return <StateBanner variant="error" title="Couldn't load offices">{error}</StateBanner>;
  }
  if (!offices || offices.length === 0) {
    return (
      <StateBanner variant="empty" title="No office is currently linked to this solicitor">
        Please call the office directly and we&apos;ll arrange this for you.
      </StateBanner>
    );
  }

  // Only one office exists today — show it as a confirmed choice rather than
  // a pointless single-option picker, but keep the step genuinely present.
  if (offices.length === 1) {
    const office = offices[0];
    return (
      <div>
        <span className="eyebrow" style={{ marginBottom: 20, display: "inline-flex" }}>
          Your appointment will be at
        </span>
        <div className="option-card" style={{ cursor: "default", maxWidth: 360 }} aria-pressed="true">
          <span className="option-card__title">{office.name}</span>
          <span className="option-card__meta">{office.address}</span>
        </div>
        <div className="wizard-actions" style={{ justifyContent: "flex-start" }}>
          <button type="button" className="btn btn--gold" onClick={onContinue}>
            Continue <span className="arrow">↗</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="eyebrow" style={{ marginBottom: 20 }}>
        Choose an office
      </legend>
      <div className="option-grid">
        {offices.map((o) => (
          <button
            key={o.id}
            type="button"
            className="option-card"
            aria-pressed={selected === o.id}
            onClick={() => onSelect(o.id)}
          >
            <span className="option-card__title">{o.name}</span>
            <span className="option-card__meta">{o.address}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
