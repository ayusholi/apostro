import { randomBytes, randomUUID } from "node:crypto";
import type { IdGenerator } from "@/application/booking/ports";

export class CryptoIdGenerator implements IdGenerator {
  newId(): string {
    return randomUUID();
  }

  /** 32 bytes -> 43-char base64url, unguessable and URL-safe for the /booking/manage/[token] link. */
  newToken(): string {
    return randomBytes(32).toString("base64url");
  }
}
