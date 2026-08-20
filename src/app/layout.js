import { Geist, Geist_Mono, Outfit, Press_Start_2P } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Vila Guaracy - Portal de Avaliações",
  description: "O portal inteligente de avaliação. Simples. Forte. Escalável.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${pressStart2P.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
