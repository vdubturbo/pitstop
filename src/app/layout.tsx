import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pitstop",
  description: "Find clean bathrooms on your road trip",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} antialiased bg-zinc-950 flex items-center justify-center h-dvh overflow-hidden`}>
        <div className="w-full max-w-[390px] h-dvh max-h-[844px] overflow-hidden relative shadow-2xl shadow-black/50 rounded-[40px] border border-zinc-800">
          {children}
        </div>
      </body>
    </html>
  );
}
