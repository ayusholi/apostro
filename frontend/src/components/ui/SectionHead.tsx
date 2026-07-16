import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function SectionHead({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal className={center ? "section-head center" : "section-head"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
