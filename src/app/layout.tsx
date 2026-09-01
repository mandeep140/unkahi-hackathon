import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { FloatingHelp } from "@/components/FloatingHelp";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "unkahi — a quiet check-in",
  description: "A gentle, private space to notice how you are doing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${atkinson.variable}`}>
      <body className="bg-ambient min-h-full flex flex-col bg-background text-foreground text-[17px] leading-relaxed">
        <NavBar />
        <main className="flex-1 w-full max-w-2xl mx-auto px-5 sm:px-6 py-10 sm:py-14 animate-fade-up">
          {children}
        </main>
        <footer className="w-full max-w-2xl mx-auto px-5 sm:px-6 py-8 text-sm text-muted border-t border-border/80 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
          <span>unkahi</span>
          <span>Everything here stays on this device, at your pace.</span>
        </footer>
        <FloatingHelp />
      </body>
    </html>
  );
}
