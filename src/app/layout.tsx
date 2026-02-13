import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trips — Travel Journal",
  description:
    "A curated collection of travel itineraries, routes, and recommendations.",
  openGraph: {
    title: "Trips — Travel Journal",
    description:
      "A curated collection of travel itineraries, routes, and recommendations.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        {/* {process.env.NODE_ENV === "development" && (
          <>
            <script src="https://cdn.jsdelivr.net/npm/eruda" />
            <script dangerouslySetInnerHTML={{ __html: "eruda.init();" }} />
          </>
        )} */}
      </body>
    </html>
  );
}
