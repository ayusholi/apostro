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
  tradingDisclosure: 'ALLS Solicitors Limited (trading as "ALLS")',
  /** Companies House number — 8 digits is the correct shape for an England & Wales Ltd company. */
  companyNumber: "12345678",
  jurisdiction: "England and Wales",
  /** UK VAT number format (GB + 9 digits). Omit this field entirely if the firm is not VAT-registered. */
  vatNumber: "GB000000000",

  sra: {
    statement: "Authorised and regulated by the Solicitors Regulation Authority",
    /** SRA ID — the number looked up on the public register at mysra.sra.org.uk. */
    number: "000000",
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
    /** ICO register reference — real references start "Z" or "ZA" followed by digits. */
    registrationNumber: "ZA000000",
    website: "https://ico.org.uk/",
  },

  /**
   * Law Society accreditation schemes the firm holds, matched to its actual
   * practice areas (@see src/data/services.ts) rather than listed generically.
   */
  accreditations: [
    {
      name: "Lexcel",
      description: "The Law Society's practice management and client-care accreditation.",
    },
    {
      name: "Conveyancing Quality Scheme",
      description: "Recognised standard for residential property and conveyancing work.",
    },
    {
      name: "Family Law Advanced Scheme",
      description: "Law Society panel membership recognising family law expertise.",
    },
    {
      name: "Criminal Litigation Accreditation",
      description: "Law Society accreditation for criminal defence practitioners.",
    },
  ],

  memberships: [
    "The Law Society of England and Wales",
    "Solicitors Regulation Authority — regulated firm",
    "Legal Ombudsman scheme member",
  ],
} as const;
