import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://autojade.com.br"),
  title: "Autojade",
  description: "Simplifique processos do seu negócio e melhore sua presença digital. Desenvolvemos módulos de automação sob medida, sites profissionais e conteúdos visuais digitais.",
  keywords: [
    "Autojade",
    "Módulos de Automação",
    "Automação de Processos",
    "Desenvolvimento Web",
    "Landing Page",
    "Criativos de Anúncios",
    "Conteúdo Visual Digital",
    "Inteligência Artificial",
    "Eficiência Empresarial"
  ],
  authors: [{ name: "Autojade" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://autojade.com.br",
    title: "Autojade",
    description: "Simplifique processos do seu negócio e melhore sua presença digital. Desenvolvemos módulos de automação sob medida, sites profissionais e conteúdos visuais digitais.",
    siteName: "Autojade",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Autojade - Automação & Web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autojade",
    description: "Módulos de automação e desenvolvimento de landing pages sob medida.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Autojade",
    "url": "https://autojade.com.br",
    "logo": "https://autojade.com.br/logo.jpg",
    "description": "Desenvolvemos módulos de automação sob medida, sites de alta conversão e conteúdo visual digital focado no crescimento de empresas.",
    "sameAs": [
      "https://www.instagram.com/autojade_ia/",
      "https://www.youtube.com/@autojade_ia"
    ]
  };

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
