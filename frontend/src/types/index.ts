export type NavItem = {
  label: string;
  href: string;
};

export type Service = {
  slug: string;
  number: string;
  title: string;
  description: string;
  bullets: string[];
  icon: string;
};

export type CaseStudy = {
  slug: string;
  tag: string;
  title: string;
  image: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  image: string;
};

export type Stat = {
  value: number;
  suffix: string;
  label: string;
};

export type ValueItem = {
  number: string;
  title: string;
  description: string;
};

/** One heading + body block of a legal page (@see src/data/legal/*.ts). */
export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};
