import type { ActivityEvent } from "@/types/workspace";
import { stamp } from "@/lib/workspace/dates";

export const activity: ActivityEvent[] = [
  // PRO/0142 — Okafor purchase
  { id: "e1", matterId: "pro-0142", kind: "status", at: stamp(-62, "10:15"), actor: "Saul Goodman", title: "Matter opened", detail: "Client care letter and terms of business sent." },
  { id: "e2", matterId: "pro-0142", kind: "task-done", at: stamp(-58, "11:05"), actor: "Grace Lin", title: "Office copy entries obtained" },
  { id: "e3", matterId: "pro-0142", kind: "document", at: stamp(-41, "09:40"), actor: "Grace Lin", title: "Draft contract received from Hollis & Co" },
  { id: "e4", matterId: "pro-0142", kind: "event", at: stamp(-33, "14:00"), actor: "Saul Goodman", title: "Searches ordered", detail: "Local authority, drainage & water, environmental." },
  { id: "e5", matterId: "pro-0142", kind: "message-out", at: stamp(-26, "15:12"), actor: "Saul Goodman", title: "Pre-contract enquiries raised with Hollis & Co" },
  { id: "e6", matterId: "pro-0142", kind: "document", at: stamp(-5, "14:20"), actor: "Grace Lin", title: "Search results uploaded", detail: "Local authority search awaiting review." },
  { id: "e7", matterId: "pro-0142", kind: "message-in", at: stamp(-3, "16:10"), actor: "Amara Okafor", title: "Client asked for search update" },
  { id: "e8", matterId: "pro-0142", kind: "message-out", at: stamp(-2, "10:02"), actor: "Saul Goodman", title: "Replied to client — searches under review" },
  { id: "e9", matterId: "pro-0142", kind: "call", at: stamp(-2, "11:30"), actor: "Grace Lin", title: "Chased broker for mortgage offer", detail: "Broker expects offer this week." },
  { id: "e10", matterId: "pro-0142", kind: "message-in", at: stamp(0, "08:47"), actor: "Amara Okafor", title: "Client asked about exchange timescale" },
  { id: "e11", matterId: "pro-0142", kind: "document", at: stamp(0, "09:31"), actor: "Hollis & Co", title: "Replies to enquiries and FENSA certificate received" },

  // PRO/0139 — Hassan sale
  { id: "e20", matterId: "pro-0139", kind: "status", at: stamp(-140, "09:00"), actor: "Saul Goodman", title: "Matter opened" },
  { id: "e21", matterId: "pro-0139", kind: "status", at: stamp(-7, "12:00"), actor: "Saul Goodman", title: "Contracts exchanged", detail: "Completion date fixed in contract." },
  { id: "e22", matterId: "pro-0139", kind: "document", at: stamp(-4, "10:10"), actor: "Grace Lin", title: "Signed transfer deed received" },
  { id: "e23", matterId: "pro-0139", kind: "call", at: stamp(-1, "11:20"), actor: "Grace Lin", title: "Chased seller’s lender for redemption figure" },
  { id: "e24", matterId: "pro-0139", kind: "document", at: stamp(-1, "16:40"), actor: "Grace Lin", title: "Draft completion statement prepared" },

  // WIL/0311 — Whitmore
  { id: "e30", matterId: "wil-0311", kind: "status", at: stamp(-40, "10:00"), actor: "Saul Goodman", title: "Matter opened" },
  { id: "e31", matterId: "wil-0311", kind: "note", at: stamp(-12, "14:00"), actor: "Saul Goodman", title: "Drafting meeting with James and Ruth", detail: "Attendance note still to be written up." },
  { id: "e32", matterId: "wil-0311", kind: "document", at: stamp(-5, "15:20"), actor: "Saul Goodman", title: "Draft wills and LPAs sent for approval" },
  { id: "e33", matterId: "wil-0311", kind: "status", at: stamp(-5, "15:31"), actor: "Saul Goodman", title: "Status changed to Awaiting client" },
  { id: "e34", matterId: "wil-0311", kind: "message-in", at: stamp(-1, "19:20"), actor: "Ruth Whitmore", title: "Question about guardianship and trustees" },

  // FAM/0087 — Kowalczyk
  { id: "e40", matterId: "fam-0087", kind: "status", at: stamp(-95, "09:30"), actor: "Helen Marsh", title: "Matter opened" },
  { id: "e41", matterId: "fam-0087", kind: "document", at: stamp(-30, "12:00"), actor: "Helen Marsh", title: "C100 application issued" },
  { id: "e42", matterId: "fam-0087", kind: "event", at: stamp(-18, "10:00"), actor: "Helen Marsh", title: "Notice of first hearing received" },
  { id: "e43", matterId: "fam-0087", kind: "message-out", at: stamp(-3, "15:05"), actor: "Helen Marsh", title: "Replied to client about half term" },

  // CIV/0219 — Northgate
  { id: "e50", matterId: "civ-0219", kind: "status", at: stamp(-30, "11:00"), actor: "Daniel Okoro", title: "Matter opened" },
  { id: "e51", matterId: "civ-0219", kind: "document", at: stamp(-29, "10:00"), actor: "Mark Ellison", title: "Invoices received from client" },
  { id: "e52", matterId: "civ-0219", kind: "document", at: stamp(-14, "16:20"), actor: "Daniel Okoro", title: "Letter before claim sent" },
  { id: "e53", matterId: "civ-0219", kind: "message-in", at: stamp(-1, "14:12"), actor: "Mark Ellison", title: "Client reports informal call from Castlebrook" },
  { id: "e54", matterId: "civ-0219", kind: "document", at: stamp(0, "08:15"), actor: "Tom Bennett", title: "Draft chaser uploaded for review" },

  // PRB/0056 — Hale
  { id: "e60", matterId: "prb-0056", kind: "status", at: stamp(-120, "10:00"), actor: "Saul Goodman", title: "Matter opened" },
  { id: "e61", matterId: "prb-0056", kind: "event", at: stamp(-60, "15:00"), actor: "Saul Goodman", title: "Asset and liability letters sent" },
  { id: "e62", matterId: "prb-0056", kind: "document", at: stamp(-2, "12:30"), actor: "Simon Hale", title: "Bank valuation letter received" },
];
