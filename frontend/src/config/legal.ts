/**
 * Regulatory/compliance facts for a UK solicitors' firm. Same placeholder
 * convention as siteConfig.phone: every ID below is a plausibly-formatted
 * placeholder (right shape, wrong value) that must be replaced with the
 * firm's real numbers before this ever goes live — replace, don't restructure.
 *
 * These values are the ONLY source for the SRA/Law Society/company-details
 * text repeated across the footer, About page, and legal pages, so updating
 * a real number here is a one-file change.
 */
export const legalConfig = {
  /** Full registered legal entity trading as the "ALLS" brand. */
  tradingDisclosure: "Assured Legal Limited trading as ALL Solicitors",
  /** Companies House number — 8 digits is the correct shape for an England & Wales Ltd company. */
  companyNumber: "14573886",
  jurisdiction: "England and Wales",
  /** UK VAT number format (GB + 9 digits). Omit this field entirely if the firm is not VAT-registered. */
  vatNumber: "GB000000000",

  sra: {
    statement: "Authorised and regulated by the Solicitors Regulation Authority",
    /** SRA ID — the number looked up on the public register at mysra.sra.org.uk. */
    number: "8015884",
    website: "https://www.sra.org.uk/",
  },

  lawSociety: {
    statement: "Member of The Law Society of England and Wales",
    website: "https://www.lawsociety.org.uk/",
  },

  legalOmbudsman: {
    name: "Legal Ombudsman",
    website: "https://www.legalombudsman.org.uk/",
  },

  ico: {
    statement: "Registered with the Information Commissioner's Office",
    registrationNumber: "ZC213659",
    website: "https://ico.org.uk/",
  },

  /**
   * Law Society accreditation schemes the firm holds, matched to its actual
   * practice areas (@see src/data/services.ts) rather than listed generically.
   */
  accreditations: [
    {
      name: "Family Law Advanced Scheme",
      description: "Law Society panel membership recognising family law expertise.",
    },
  ],

  memberships: [
    "The Law Society of England and Wales",
    "Solicitors Regulation Authority — regulated firm",
    "Legal Ombudsman scheme member",
  ],
} as const;
