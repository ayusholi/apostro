"use client";

import { HIDDEN_STEPS, WIZARD_STEPS, type WizardStepIndex } from "@/hooks/useBookingWizard";

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
        // Temporarily hidden: Solicitor and Appointment steps (restore by emptying HIDDEN_STEPS).
        if (HIDDEN_STEPS.includes(i)) return null;
        const displayNumber = i + 1 - HIDDEN_STEPS.filter((h) => h < i).length;
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
                {state === "done" ? "✓" : displayNumber}
              </span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
