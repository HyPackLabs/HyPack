import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { Geist, Geist_Mono } from "next/font/google";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HyPack — Build and share Hytale modpacks",
  description:
    "Create, share, and export Hytale modpacks from CurseForge without the hassle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      ui={ui}
      appearance={clerkAppearance}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/modpacks"
      signUpFallbackRedirectUrl="/modpacks"
      signInForceRedirectUrl="/modpacks"
      signUpForceRedirectUrl="/modpacks"
      afterSignOutUrl="/"
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#080808] font-sans text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
