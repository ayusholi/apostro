import type { ReactNode } from "react";

/**
 * One shared shape for the four states every async step in the booking flow
 * can be in, so a "no slots this month" empty state and a "couldn't reach
 * the server" error state look like siblings, not two different components
 * someone has to redesign against.
 */
type Variant = "loading" | "empty" | "error" | "success";

const ICONS: Record<Variant, string> = {
  loading: "",
  empty: "○",
  error: "!",
  success: "✓",
};

export function StateBanner({
  variant,
  title,
  children,
  action,
}: {
  variant: Variant;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={`state-banner state-banner--${variant}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {variant === "loading" ? (
        <span className="state-banner__spinner" aria-hidden="true" />
      ) : (
        <span className="state-banner__icon" aria-hidden="true">
          {ICONS[variant]}
        </span>
      )}
      <div>
        <p className="state-banner__title">{title}</p>
        {children && <div className="state-banner__body">{children}</div>}
        {action && <div className="state-banner__action">{action}</div>}
      </div>
    </div>
  );
}
