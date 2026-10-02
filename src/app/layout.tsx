import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";
import { ColdStartProvider } from "@/components/common/cold-start-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { TooltipProvider, GlobalTooltipSuppressor } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AppNavigationShell } from "@/components/common/app-navigation-shell";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-canvas text-ink font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <ColdStartProvider>
                <TooltipProvider delayDuration={150}>
                  <GlobalTooltipSuppressor />
                  <AppNavigationShell>{children}</AppNavigationShell>
                  <Toaster />
                </TooltipProvider>
              </ColdStartProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
