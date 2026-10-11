import { legalConfig } from "@/config/legal";

const BADGES = [
  { label: "SRA Regulated", detail: legalConfig.sra.statement, href: legalConfig.sra.website },
  { label: "Law Society Member", detail: legalConfig.lawSociety.statement, href: legalConfig.lawSociety.website },
  { label: `ICO Registered | No. ${legalConfig.ico.registrationNumber}`, detail: legalConfig.ico.statement, href: legalConfig.ico.website },
] as const;

/** Reused in the footer (compact) and on the About page's regulatory info section. */
export function TrustBadges({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? "trust-badges trust-badges--compact" : "trust-badges"}>
      {BADGES.map((badge) => (
        <li key={badge.label}>
          <a href={badge.href} target="_blank" rel="noopener noreferrer" title={badge.detail}>
            {badge.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
