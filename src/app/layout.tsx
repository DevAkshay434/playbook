import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SoftPro CS Field Playbook",
  description: "Internal customer service playbook for SoftPro Water Systems / Quality Water Treatment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
