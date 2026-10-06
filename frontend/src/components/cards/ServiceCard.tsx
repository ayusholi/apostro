import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Service } from "@/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Reveal as="article" className="service-card">
      <div className="service-card__num">{service.number} /</div>
      <div className="service-card__icon">
        <Image src={service.icon} alt="" width={34} height={34} />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <ul>
        {service.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      <Link
        className="more"
        href="/services"
        aria-label={`Learn more about ${service.title}`}
      >
        Learn More →
      </Link>
    </Reveal>
  );
}
