import type { BookableService } from "@/application/booking/ports";

export function ServiceStep({
  services,
  selected,
  onSelect,
}: {
  services: BookableService[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <fieldset>
      <legend className="eyebrow" style={{ marginBottom: 20 }}>
        Which service do you need?
      </legend>
      <div className="option-grid">
        {services.map((service) => (
          <button
            key={service.slug}
            type="button"
            className="option-card"
            aria-pressed={selected === service.slug}
            onClick={() => onSelect(service.slug)}
          >
            <span className="option-card__title">{service.title}</span>
            <span className="option-card__meta">{service.durationMinutes}-minute consultation</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
