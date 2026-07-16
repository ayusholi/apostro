import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";

export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cinzel",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const fontVariables = `${cinzel.variable} ${cormorant.variable} ${inter.variable}`;
