// Commented out for now — the client logos are dummy placeholders and
// "Serving Clients Nationwide" doesn't match the firm's real East London
// area served. Restore once real client logos (with permission to display
// them) are available.
//
// import Image from "next/image";
// import { Container } from "@/components/ui/Container";
// import { clientLogos } from "@/data/stats";
//
// export function LogoStrip() {
//   return (
//     <section className="logos">
//       <Container>
//         <p className="logos__label">Serving Clients Nationwide</p>
//         <div className="logos__grid">
//           {clientLogos.map((logo) => (
//             <Image key={logo.src} src={logo.src} alt="Client logo" width={logo.width} height={logo.height} />
//           ))}
//         </div>
//       </Container>
//     </section>
//   );
// }

export function LogoStrip() {
  return null;
}
