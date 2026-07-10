import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import CookieConsent from "@/components/CookieConsent";
import InfinityPreloader from "@/components/InfinityPreloader";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL('https://infinitytraders.shop'),
  title: {
    default: "Infinity Traders | Premium Footwear & Lifestyle Distributor",
    template: "%s | Infinity Traders"
  },
  description: "Dhanbad's premier multi-brand distributor. Experience modern design and performance footwear, activewear recovery slides, and premium apparel. Serving pan-India.",
  keywords: ["Infinity Traders", "footwear", "shoes", "sneakers", "slippers", "slides", "apparel", "lifestyle", "ENA athletics", "India", "Dhanbad", "activewear"],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Infinity Traders | Premium Footwear & Lifestyle",
    description: "Premium performance running shoes, recovery slides, and active apparel.",
    url: "https://infinitytraders.shop",
    siteName: "Infinity Traders",
    images: [
      {
        url: "/categories/sneakers.jpg",
        width: 1200,
        height: 630,
        alt: "Infinity Traders - Premium Footwear & Apparel",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Traders | Footwear & Lifestyle",
    description: "Premium performance running shoes, recovery slides, and active apparel.",
    images: ["/categories/sneakers.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth bg-[#f4f3ef]">
      <body className="min-h-full flex flex-col bg-[#f4f3ef] text-black antialiased">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            strategy="afterInteractive"
          />
        )}
        <LanguageProvider>
          <CartProvider>
            <InfinityPreloader />
            <Header />
            <CartDrawer />
            <CookieConsent />
            <main className="flex-1 flex flex-col pt-24 bg-[#f4f3ef]">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
