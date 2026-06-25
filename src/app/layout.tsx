import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Infinity Traders | Premium Footwear & Lifestyle Distributor",
  description: "Dhanbad's premier multi-brand distributor. Experience modern design and performance footwear, activewear recovery slides, and premium apparel. Serving pan-India.",
  keywords: "Infinity Traders, footwear, shoes, sneakers, slippers, slides, apparel, lifestyle, ENA athletics, India, Dhanbad, activewear",
  openGraph: {
    title: "Infinity Traders | Footwear & Lifestyle",
    description: "Premium performance running shoes, recovery slides, and active apparel.",
    type: "website",
    locale: "en_IN",
    siteName: "Infinity Traders"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#f4f3ef] text-black antialiased">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <CartDrawer />
            <main className="flex-1 flex flex-col pt-24">
              {children}
            </main>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
