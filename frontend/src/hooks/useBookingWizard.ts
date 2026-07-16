"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createBookingAction,
  getAvailabilityAction,
  listOfficesForSolicitorAction,
  listSolicitorsForServiceAction,
} from "@/actions/booking";
import type { BookingSummary } from "@/application/booking/dto";
import type { BookableService, Office, Solicitor } from "@/application/booking/ports";
import { getLocalYMD } from "@/domain/scheduling/timezone";
import { useDetectedTimeZone } from "./useDetectedTimeZone";

type AvailabilityData = { slots: string[]; officeTimeZone: string; durationMinutes: number };

export const WIZARD_STEPS = ["Service", "Solicitor", "Office", "Date & time", "Your details", "Review"] as const;
export type WizardStepIndex = 0 | 1 | 2 | 3 | 4 | 5;

type AsyncState<T> = { status: "idle" | "loading" | "error" | "success"; data: T | null; error: string | null };

function idleState<T>(): AsyncState<T> {
  return { status: "idle", data: null, error: null };
}

export type ClientDetails = { name: string; email: string; phone: string; notes: string };

export function useBookingWizard(initialServices: BookableService[]) {
  const detectedTimeZone = useDetectedTimeZone();

  const [step, setStep] = useState<WizardStepIndex>(0);
  const [serviceSlug, setServiceSlug] = useState<string | null>(null);
  const [solicitorSlug, setSolicitorSlug] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotStartUtc, setSelectedSlotStartUtc] = useState<string | null>(null);
  const [displayTimeZone, setDisplayTimeZone] = useState(detectedTimeZone);
  const [client, setClient] = useState<ClientDetails>({ name: "", email: "", phone: "", notes: "" });
  const [honeypot, setHoneypot] = useState("");
  const [renderedAtMs] = useState(() => Date.now());

  const [solicitorsState, setSolicitorsState] = useState<AsyncState<Solicitor[]>>(idleState());
  const [officesState, setOfficesState] = useState<AsyncState<Office[]>>(idleState());
  // Tracks which (service, solicitor, office) combination `data`/`error`
  // belongs to, so "loading" can be DERIVED (key requested !== key resolved)
  // instead of set synchronously inside the effect below — the fetch effect
  // then only ever calls setState from inside its .then() callback.
  const [availabilityResult, setAvailabilityResult] = useState<{
    key: string | null;
    data: AvailabilityData | null;
    error: string | null;
  }>({ key: null, data: null, error: null });
  const [submitState, setSubmitState] = useState<AsyncState<BookingSummary>>(idleState());

  const service = useMemo(() => initialServices.find((s) => s.slug === serviceSlug) ?? null, [initialServices, serviceSlug]);
  const solicitor = useMemo(
    () => solicitorsState.data?.find((s) => s.slug === solicitorSlug) ?? null,
    [solicitorsState.data, solicitorSlug],
  );
  const office = useMemo(() => officesState.data?.find((o) => o.id === officeId) ?? null, [officesState.data, officeId]);

  const availabilityKey = serviceSlug && solicitorSlug && officeId ? `${serviceSlug}|${solicitorSlug}|${officeId}` : null;

  // Fetching availability is a genuine async operation keyed off three
  // selections changing together. `ignore` guards a slower earlier request
  // from overwriting a later one if the user changes solicitor/office again
  // before the first response lands. Every setState call happens inside the
  // .then() callback (asynchronous), never synchronously in the effect body —
  // "loading" is derived from key mismatch below instead of stored.
  useEffect(() => {
    if (!availabilityKey || !serviceSlug || !solicitorSlug || !officeId) return;

    let ignore = false;
    getAvailabilityAction({ serviceSlug, solicitorSlug, officeId }).then((result) => {
      if (ignore) return;
      if (result.ok) setAvailabilityResult({ key: availabilityKey, data: result.data, error: null });
      else setAvailabilityResult({ key: availabilityKey, data: null, error: result.error.message });
    });
    return () => {
      ignore = true;
    };
  }, [availabilityKey, serviceSlug, solicitorSlug, officeId]);

  const availabilityState: AsyncState<AvailabilityData> = !availabilityKey
    ? idleState()
    : availabilityResult.key !== availabilityKey
      ? { status: "loading", data: null, error: null }
      : availabilityResult.error
        ? { status: "error", data: null, error: availabilityResult.error }
        : { status: "success", data: availabilityResult.data, error: null };

  const selectService = useCallback(async (slug: string) => {
    setServiceSlug(slug);
    setSolicitorSlug(null);
    setOfficeId(null);
    setSelectedDate(null);
    setSelectedSlotStartUtc(null);
    setSolicitorsState({ status: "loading", data: null, error: null });
    try {
      const solicitors = await listSolicitorsForServiceAction(slug);
      setSolicitorsState({ status: "success", data: solicitors, error: null });
    } catch {
      setSolicitorsState({ status: "error", data: null, error: "Couldn't load solicitors. Please try again." });
    }
    setStep(1);
  }, []);

  const selectSolicitor = useCallback(async (slug: string) => {
    setSolicitorSlug(slug);
    setOfficeId(null);
    setSelectedDate(null);
    setSelectedSlotStartUtc(null);
    setOfficesState({ status: "loading", data: null, error: null });
    try {
      const offices = await listOfficesForSolicitorAction(slug);
      setOfficesState({ status: "success", data: offices, error: null });
      // Only one office exists today — skip the pick when there's nothing to choose between,
      // but still land the user ON the office step so it's visibly part of the flow.
      if (offices.length === 1) setOfficeId(offices[0].id);
    } catch {
      setOfficesState({ status: "error", data: null, error: "Couldn't load offices. Please try again." });
    }
    setStep(2);
  }, []);

  const selectOffice = useCallback((id: string) => {
    setOfficeId(id);
    setSelectedDate(null);
    setSelectedSlotStartUtc(null);
    setStep(3);
  }, []);

  const selectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedSlotStartUtc(null);
  }, []);

  const selectSlot = useCallback((startUtc: string) => {
    setSelectedSlotStartUtc(startUtc);
  }, []);

  const goToStep = useCallback((target: WizardStepIndex) => {
    setStep(target);
  }, []);

  const updateClient = useCallback((patch: Partial<ClientDetails>) => {
    setClient((c) => ({ ...c, ...patch }));
  }, []);

  const submit = useCallback(async () => {
    if (!serviceSlug || !solicitorSlug || !officeId || !selectedSlotStartUtc) return;
    setSubmitState({ status: "loading", data: null, error: null });
    const result = await createBookingAction({
      serviceSlug,
      solicitorSlug,
      officeId,
      slotStartUtc: selectedSlotStartUtc,
      displayTimeZone,
      client,
      spam: { honeypot, renderedAtMs },
    });
    if (result.ok) {
      setSubmitState({ status: "success", data: result.data, error: null });
    } else {
      setSubmitState({ status: "error", data: null, error: result.error.message });
    }
    return result;
  }, [serviceSlug, solicitorSlug, officeId, selectedSlotStartUtc, displayTimeZone, client, honeypot, renderedAtMs]);

  return {
    step,
    goToStep,
    services: initialServices,
    service,
    serviceSlug,
    selectService,
    solicitorsState,
    solicitor,
    solicitorSlug,
    selectSolicitor,
    officesState,
    office,
    officeId,
    selectOffice,
    availabilityState,
    selectedDate,
    selectDate,
    selectedSlotStartUtc,
    selectSlot,
    displayTimeZone,
    setDisplayTimeZone,
    client,
    updateClient,
    honeypot,
    setHoneypot,
    renderedAtMs,
    submitState,
    submit,
  };
}

/** Groups a flat list of UTC slot ISO strings by their calendar date in `timeZone` — what the Calendar's availableDates and the TimeSlotGrid's per-day filter both need. */
export function groupSlotsByLocalDate(slots: string[], timeZone: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const iso of slots) {
    const { year, month, day } = getLocalYMD(new Date(iso), timeZone);
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const bucket = map.get(key) ?? [];
    bucket.push(iso);
    map.set(key, bucket);
  }
  return map;
}
