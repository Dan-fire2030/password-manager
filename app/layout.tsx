import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ServiceWorkerProvider, OfflineIndicator, PWAInstallPrompt } from "@/components/pwa/service-worker-provider";

export const metadata: Metadata = {
  title: "パスマネ",
  description: "セキュアなパスワード管理アプリ",
  keywords: ["パスワード", "管理", "セキュリティ", "PWA", "認証"],
  authors: [{ name: "パスマネ開発チーム" }],
  creator: "パスマネ",
  publisher: "パスマネ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "パスマネ",
  },
  openGraph: {
    type: "website",
    siteName: "パスマネ",
    title: "パスマネ - セキュアなパスワード管理",
    description: "セキュアなパスワード管理アプリ",
  },
  twitter: {
    card: "summary",
    title: "パスマネ",
    description: "セキュアなパスワード管理アプリ",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "パスマネ",
    "application-name": "パスマネ",
    "msapplication-TileColor": "#3b82f6",
    "theme-color": "#3b82f6",
  },
  icons: {
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/icons/favicon.ico"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ServiceWorkerProvider>
          <OfflineIndicator />
          {children}
          <PWAInstallPrompt />
          <Toaster richColors position="top-center" />
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
