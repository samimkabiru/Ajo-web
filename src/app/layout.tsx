import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { ColdStartProvider } from "@/components/common/cold-start-provider";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ajo — Digital Rotating Savings Circles",
  description: "Save together, collect in turns. Digital ajo, esusu, and adashe for Nigeria.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0E4F3C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink font-body">
        <QueryProvider>
          <AuthProvider>
            <ColdStartProvider>
              {children}
            </ColdStartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
