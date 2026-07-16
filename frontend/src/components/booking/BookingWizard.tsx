"use client";

import { useRouter } from "next/navigation";
import { useBookingWizard, type WizardStepIndex } from "@/hooks/useBookingWizard";
import type { BookableService } from "@/application/booking/ports";
import { StepIndicator } from "./StepIndicator";
import { ServiceStep } from "./steps/ServiceStep";
import { SolicitorStep } from "./steps/SolicitorStep";
import { OfficeStep } from "./steps/OfficeStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { DetailsStep } from "./steps/DetailsStep";
import { ReviewStep } from "./steps/ReviewStep";

export function BookingWizard({ services }: { services: BookableService[] }) {
  const router = useRouter();
  const wizard = useBookingWizard(services);

  const furthestUnlocked: WizardStepIndex = wizard.selectedSlotStartUtc
    ? 5
    : wizard.officeId
      ? 3
      : wizard.solicitorSlug
        ? 2
        : wizard.serviceSlug
          ? 1
          : 0;

  async function handleConfirm() {
    const result = await wizard.submit();
    if (result?.ok) {
      router.push(`/booking/manage/${result.data.manageToken}?confirmed=1`);
    }
  }

  return (
    <div>
      <StepIndicator current={wizard.step} furthestUnlocked={furthestUnlocked} onJump={wizard.goToStep} />

      {wizard.step === 0 && (
        <ServiceStep services={wizard.services} selected={wizard.serviceSlug} onSelect={wizard.selectService} />
      )}

      {wizard.step === 1 && (
        <>
          <SolicitorStep
            status={wizard.solicitorsState.status}
            solicitors={wizard.solicitorsState.data}
            error={wizard.solicitorsState.error}
            selected={wizard.solicitorSlug}
            onSelect={wizard.selectSolicitor}
          />
          <BackButton onClick={() => wizard.goToStep(0)} />
        </>
      )}

      {wizard.step === 2 && (
        <>
          <OfficeStep
            status={wizard.officesState.status}
            offices={wizard.officesState.data}
            error={wizard.officesState.error}
            selected={wizard.officeId}
            onSelect={wizard.selectOffice}
            onContinue={() => wizard.goToStep(3)}
          />
          <BackButton onClick={() => wizard.goToStep(1)} />
        </>
      )}

      {wizard.step === 3 && (
        <>
          <DateTimeStep
            status={wizard.availabilityState.status}
            slots={wizard.availabilityState.data?.slots ?? null}
            error={wizard.availabilityState.error}
            displayTimeZone={wizard.displayTimeZone}
            onChangeTimeZone={wizard.setDisplayTimeZone}
            selectedDate={wizard.selectedDate}
            onSelectDate={wizard.selectDate}
            selectedSlotStartUtc={wizard.selectedSlotStartUtc}
            onSelectSlot={wizard.selectSlot}
          />
          <div className="wizard-actions">
            <BackButton onClick={() => wizard.goToStep(2)} />
            {wizard.selectedSlotStartUtc && (
              <button type="button" className="btn btn--gold" onClick={() => wizard.goToStep(4)}>
                Continue <span className="arrow">↗</span>
              </button>
            )}
          </div>
        </>
      )}

      {wizard.step === 4 && (
        <>
          <DetailsStep
            client={wizard.client}
            onChange={wizard.updateClient}
            honeypot={wizard.honeypot}
            onHoneypotChange={wizard.setHoneypot}
            onContinue={() => wizard.goToStep(5)}
          />
          <BackButton onClick={() => wizard.goToStep(3)} />
        </>
      )}

      {wizard.step === 5 && wizard.service && wizard.solicitor && wizard.office && wizard.selectedSlotStartUtc && (
        <>
          <ReviewStep
            service={wizard.service}
            solicitor={wizard.solicitor}
            office={wizard.office}
            slotStartUtc={wizard.selectedSlotStartUtc}
            displayTimeZone={wizard.displayTimeZone}
            client={wizard.client}
            submitStatus={wizard.submitState.status}
            submitError={wizard.submitState.error}
            onConfirm={handleConfirm}
          />
          <BackButton onClick={() => wizard.goToStep(4)} />
        </>
      )}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="wizard-actions" style={{ justifyContent: "flex-start" }}>
      <button type="button" className="btn btn--ghost-nav" onClick={onClick}>
        ← Back
      </button>
    </div>
  );
}
