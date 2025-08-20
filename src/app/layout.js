import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { CartDrawerProvider } from "@/components/CartButton";
import { Toaster } from "react-hot-toast";
// إشعارات: تمت إزالتها

export const metadata = {
  title: "SHAMS TEX | اسعار شمس تكس",
  description: "SHAMS TEX | اسعار شمس تكس",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#A08558" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <CartDrawerProvider>
          {/* إشعارات محذوفة */}
          <NavBar />
          <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Cairo, sans-serif', direction: 'rtl' } }} />
          {children}
        </CartDrawerProvider>
      </body>
    </html>
  );
}
