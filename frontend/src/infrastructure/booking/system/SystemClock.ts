import type { Clock } from "@/application/booking/ports";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
