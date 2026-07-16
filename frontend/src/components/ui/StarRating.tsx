type Size = "sm" | "md" | "lg";

/**
 * Renders fractional ratings (e.g. 4.3) as partially-filled stars using a
 * clipped overlay, not just rounding — the visible fill and the aria-label
 * describe the exact same number, since screen readers can't see the CSS.
 */
export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
}: {
  rating: number;
  max?: number;
  size?: Size;
  showValue?: boolean;
}) {
  const clamped = Math.max(0, Math.min(rating, max));
  const fillPercent = (clamped / max) * 100;
  const glyphs = "★".repeat(max);

  return (
    <span className={`star-rating star-rating--${size}`}>
      <span
        className="star-rating__stars"
        role="img"
        aria-label={`${clamped.toFixed(1)} out of ${max} stars`}
      >
        <span className="star-rating__track" aria-hidden="true">{glyphs}</span>
        <span className="star-rating__fill" aria-hidden="true" style={{ width: `${fillPercent}%` }}>
          {glyphs}
        </span>
      </span>
      {showValue && <span className="star-rating__value">{clamped.toFixed(1)}</span>}
    </span>
  );
}
