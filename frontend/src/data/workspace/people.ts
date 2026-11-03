import type { Client, Notification, TeamMember } from "@/types/workspace";
import { day, stamp } from "@/lib/workspace/dates";

/** Fictional firm. Every name, address and number below is invented. */
export const firm = { name: "Harlow Reyes Solicitors", short: "Harlow Reyes" };

export const CURRENT_USER_ID = "ps";

export const team: TeamMember[] = [
  { id: "ps", name: "Saul Goodman", initials: "PS", role: "Solicitor" },
  { id: "do", name: "Daniel Okoro", initials: "DO", role: "Partner" },
  { id: "hm", name: "Helen Marsh", initials: "HM", role: "Senior associate" },
  { id: "tb", name: "Tom Bennett", initials: "TB", role: "Trainee solicitor" },
  { id: "gl", name: "Grace Lin", initials: "GL", role: "Legal assistant" },
];

export const clients: Client[] = [
  {
    id: "okafor",
    name: "Amara Okafor",
    kind: "Individual",
    email: "amara.okafor@example.com",
    phone: "07700 900412",
    preferredChannel: "email",
    address: "Flat 3, 22 Grange Road, London E17",
    clientSince: day(-62),
    idCheck: { status: "Verified", date: day(-61) },
    notes: "First-time buyer. Prefers email; available for calls before 9am or at lunchtime.",
  },
  {
    id: "hassan",
    name: "Yusuf Hassan",
    kind: "Individual",
    email: "y.hassan@example.com",
    phone: "07700 900127",
    preferredChannel: "email",
    address: "Flat 7, Marlow Court, London E15",
    clientSince: day(-140),
    idCheck: { status: "Verified", date: day(-139) },
  },
  {
    id: "whitmore",
    name: "James and Ruth Whitmore",
    kind: "Joint",
    contact: "Ruth Whitmore",
    email: "ruth.whitmore@example.com",
    phone: "07700 900583",
    preferredChannel: "whatsapp",
    address: "41 Chestnut Avenue, London E7",
    clientSince: day(-40),
    idCheck: { status: "Verified", date: day(-38) },
    notes: "Two children (ages 6 and 9). Ruth is the main point of contact.",
  },
  {
    id: "kowalczyk",
    name: "Lena Kowalczyk",
    kind: "Individual",
    email: "lena.k@example.com",
    phone: "07700 900764",
    preferredChannel: "email",
    address: "Address withheld — see secure file",
    clientSince: day(-95),
    idCheck: { status: "Verified", date: day(-94) },
    notes: "Do not send post to home address. Use email only.",
  },
  {
    id: "northgate",
    name: "Northgate Joinery Ltd",
    kind: "Organisation",
    contact: "Mark Ellison, Director",
    email: "mark@northgate-joinery.example.co.uk",
    phone: "020 7946 0381",
    preferredChannel: "email",
    address: "Unit 4, Lea Bridge Industrial Estate, London E10",
    clientSince: day(-410),
    idCheck: { status: "Verified", date: day(-408) },
  },
  {
    id: "hale",
    name: "Simon Hale",
    kind: "Individual",
    contact: "Executor, Estate of Margaret Hale",
    email: "simon.hale@example.com",
    phone: "07700 900950",
    preferredChannel: "email",
    address: "9 Orchard Close, Chelmsford CM2",
    clientSince: day(-120),
    idCheck: { status: "Outstanding" },
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    at: stamp(0, "09:31"),
    text: "Hollis & Co replied on PRO/0142 with two attachments",
    href: "/workspace/inbox?c=hollis",
    read: false,
  },
  {
    id: "n2",
    at: stamp(0, "08:15"),
    text: "Tom Bennett asked you to review “Chaser to Castlebrook”",
    href: "/workspace/documents?d=chaser",
    read: false,
  },
  {
    id: "n3",
    at: stamp(-1, "17:02"),
    text: "Daniel Okoro added you to CIV/0219",
    href: "/workspace/matters/civ-0219",
    read: true,
  },
];
