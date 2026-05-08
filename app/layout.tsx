import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://arriendoseguro.cl"
  ),
  title: {
    default: "ArriendoSeguro — Arriendos sin estrés para Chile",
    template: "%s | ArriendoSeguro",
  },
  description:
    "La plataforma chilena que digitaliza la relación entre propietarios y arrendatarios. Contratos legales con IA, cobro automático, inventario certificado y ArriendoScore.",
  keywords: [
    "arriendo",
    "arrendamiento",
    "Chile",
    "propietario",
    "arrendatario",
    "contrato arriendo",
    "cobro arriendo online",
    "ArriendoScore",
  ],
  authors: [{ name: "ArriendoSeguro" }],
  creator: "ArriendoSeguro SpA",
  publisher: "ArriendoSeguro SpA",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://arriendoseguro.cl",
    siteName: "ArriendoSeguro",
    title: "ArriendoSeguro — Arriendos sin estrés para Chile",
    description:
      "Plataforma SaaS chilena para gestionar arriendos de forma legal, segura y digital.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ArriendoSeguro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArriendoSeguro — Arriendos sin estrés para Chile",
    description:
      "Contratos legales, cobro automático e inventario certificado. Para Chile, hecho en Chile.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-neutral-50`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1E3A5F",
              color: "#ffffff",
              border: "1px solid #1E40AF",
            },
          }}
        />
      </body>
    </html>
  );
}
