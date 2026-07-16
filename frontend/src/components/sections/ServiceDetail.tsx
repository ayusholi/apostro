import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ServiceDetail as ServiceDetailData } from "@/data/services";

export function ServiceDetail({ detail }: { detail: ServiceDetailData }) {
  return (
    <section className="section">
      <Container>
        <div className="about-grid">
          <Reveal className="about-grid__media">
            <Image src={detail.image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" />
          </Reveal>
          <Reveal>
            <Eyebrow>Overview</Eyebrow>
            <h2>{detail.heading}</h2>
            {detail.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="value-list">
              {detail.values.map((value) => (
                <div className="v" key={value.title}>
                  <span className="num">{value.number}</span>
                  <div>
                    <h4>{value.title}</h4>
                    <p>{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
