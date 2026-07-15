import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import ClientShell from "@/components/ClientShell";

export const metadata: Metadata = {
  title: "Pulse360 - AI Digital Health Companion",
  description: "Anonymous digital health companion for young people in Rwanda and across Africa. Confidential counseling, reproductive health information, and clinic routing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Leaflet CSS for mapping out of the box */}
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          <ClientShell>
            {children}
          </ClientShell>
        </AppProvider>
      </body>
    </html>
  );
}
