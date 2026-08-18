import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { clientLogos } from "@/data/stats";

export function LogoStrip() {
  return (
    <section className="logos">
      <Container>
        <p className="logos__label">Serving Clients Nationwide</p>
        <div className="logos__grid">
          {clientLogos.map((logo) => (
            <Image key={logo.src} src={logo.src} alt="Client logo" width={logo.width} height={logo.height} />
          ))}
        </div>
      </Container>
    </section>
  );
}
