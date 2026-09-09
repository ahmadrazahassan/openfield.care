import type { Metadata, Viewport } from "next";
import { DM_Sans, Open_Sans, Montserrat_Alternates } from "next/font/google";
import { SITE } from "@/content/site";
import { BRAND } from "@/content/assets";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const montserratAlt = Montserrat_Alternates({
  variable: "--font-montserrat-alt",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.legalName }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_GB",
    images: [
      {
        url: BRAND.ogDefault,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [BRAND.ogDefault],
  },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: BRAND.icon512, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: BRAND.appleTouchIcon, sizes: "180x180" }],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f1f1f1",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser extensions inject attributes into <html> and <body> before React
    // hydrates (bis_skin_checked, bis_register, __processed_*). Those are not
    // ours and cannot be prevented from the app, so the warning is suppressed
    // on these two elements only -- real mismatches inside the tree still
    // report normally.
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${dmSans.variable} ${openSans.variable} ${montserratAlt.variable}`}
    >
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only-focusable focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:m-0 focus-visible:h-auto focus-visible:w-auto focus-visible:overflow-visible focus-visible:rounded-pill focus-visible:bg-ink focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:text-page focus-visible:[clip-path:none]"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
