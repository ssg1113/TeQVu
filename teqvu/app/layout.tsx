import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "../components/layout/AppWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeQVu — Your Quick View of What's Next in Tech",
  description: "Technology Intelligence, Emerging Tech Trends, Research, and Personalized Newsletter Platform",
  icons: {
    icon: [
      { url: '/logo-emblem.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "TeQVu — Your Quick View of What's Next in Tech",
    description: "Technology Intelligence, Emerging Tech Trends, Research, and Personalized Newsletter Platform",
    siteName: "TeQVu",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "TeQVu — Your Quick View of What's Next in Tech",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TeQVu — Your Quick View of What's Next in Tech",
    description: "Technology Intelligence, Emerging Tech Trends, Research, and Personalized Newsletter Platform",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
