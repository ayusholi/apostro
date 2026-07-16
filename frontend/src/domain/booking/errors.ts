/**
 * Domain errors. These carry a stable `code` so the application layer can
 * map them to user-facing messages without string-matching, and so the same
 * error survives a serialization boundary (Server Action -> client) intact.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
}

export class SlotNoLongerAvailableError extends DomainError {
  readonly code = "SLOT_NO_LONGER_AVAILABLE";
  constructor() {
    super("That time slot was just booked by someone else. Please choose another.");
  }
}

export class OutsideNoticeWindowError extends DomainError {
  readonly code = "OUTSIDE_NOTICE_WINDOW";
  constructor(minNoticeHours: number) {
    super(`Bookings require at least ${minNoticeHours} hours' notice. Please choose a later time.`);
  }
}

export class OutsideBookingWindowError extends DomainError {
  readonly code = "OUTSIDE_BOOKING_WINDOW";
  constructor(maxAdvanceDays: number) {
    super(`Bookings can only be made up to ${maxAdvanceDays} days in advance.`);
  }
}

export class BookingNotFoundError extends DomainError {
  readonly code = "BOOKING_NOT_FOUND";
  constructor() {
    super("We couldn't find a booking matching that link. It may have been cancelled already.");
  }
}

export class BookingAlreadyCancelledError extends DomainError {
  readonly code = "BOOKING_ALREADY_CANCELLED";
  constructor() {
    super("This booking has already been cancelled.");
  }
}

export class CancellationWindowPassedError extends DomainError {
  readonly code = "CANCELLATION_WINDOW_PASSED";
  constructor(cancelWindowHours: number) {
    super(
      `This appointment is less than ${cancelWindowHours} hours away, so it can no longer be cancelled or rescheduled online. Please call the office directly.`,
    );
  }
}

export class UnknownServiceError extends DomainError {
  readonly code = "UNKNOWN_SERVICE";
  constructor() {
    super("That legal service could not be found.");
  }
}

export class UnknownSolicitorError extends DomainError {
  readonly code = "UNKNOWN_SOLICITOR";
  constructor() {
    super("That solicitor could not be found.");
  }
}

export class UnknownOfficeError extends DomainError {
  readonly code = "UNKNOWN_OFFICE";
  constructor() {
    super("That office could not be found.");
  }
}

export class SpamRejectedError extends DomainError {
  readonly code = "SPAM_REJECTED";
  constructor() {
    super("We couldn't process that submission. Please try again.");
  }
}

export class RateLimitedError extends DomainError {
  readonly code = "RATE_LIMITED";
  constructor() {
    super("Too many attempts. Please wait a few minutes and try again.");
  }
}

export class ValidationFailedError extends DomainError {
  readonly code = "VALIDATION_FAILED";
  constructor(
    message: string,
    public readonly fieldErrors: Record<string, string[]>,
  ) {
    super(message);
  }
}
