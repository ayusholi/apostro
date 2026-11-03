import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";

/** Workspace typefaces: Plex for dense UI text and references, Newsreader for
    page and matter titles, giving them the feel of a legal document. */
export const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ws-sans",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ws-mono",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ws-serif",
  display: "swap",
});

export const workspaceFontVariables = `${plexSans.variable} ${plexMono.variable} ${newsreader.variable}`;
