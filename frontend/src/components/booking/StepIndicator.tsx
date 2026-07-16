"use client";

import { WIZARD_STEPS, type WizardStepIndex } from "@/hooks/useBookingWizard";

export function StepIndicator({
  current,
  furthestUnlocked,
  onJump,
}: {
  current: WizardStepIndex;
  furthestUnlocked: WizardStepIndex;
  onJump: (step: WizardStepIndex) => void;
}) {
  return (
    <ol className="step-indicator" aria-label="Booking steps">
      {WIZARD_STEPS.map((label, i) => {
        const index = i as WizardStepIndex;
        const state = index === current ? "current" : index < current ? "done" : "upcoming";
        const reachable = index <= furthestUnlocked;
        return (
          <li key={label} data-state={state}>
            <button
              type="button"
              disabled={!reachable}
              aria-current={index === current ? "step" : undefined}
              onClick={() => reachable && onJump(index)}
            >
              <span className="num" aria-hidden="true">
                {state === "done" ? "✓" : i + 1}
              </span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
