import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import SideNav from "@/components/SideNav";

const geologica = Geologica({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geologica",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Avrora — corporate merch",
  description: "Корпоративный мерч. Вдохновляйся, сохраняй, выбирай.",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Avrora",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={geologica.variable}>
      <body className="min-h-dvh bg-bg text-ink font-sans">
        <SideNav />
        <main className="pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0 md:pl-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
