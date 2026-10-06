export type ContactEnquiryInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  marketingOptIn: boolean;
  spam: { honeypot: string; renderedAtMs: number };
};

export type ActionError = { code: string; message: string; fieldErrors?: Record<string, string[]> };
export type Result<T> = { ok: true; data: T } | { ok: false; error: ActionError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T>(code: string, message: string, fieldErrors?: Record<string, string[]>): Result<T> {
  return { ok: false, error: { code, message, fieldErrors } };
}
