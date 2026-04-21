import type { Metadata } from "next";
import { Manrope, Geist } from "next/font/google";
import { Providers } from "@/context/Providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CredBack",
  description: "Quản lý chi tiêu và gợi ý thẻ tín dụng thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className={`${manrope.className} min-h-full flex flex-col transition-colors duration-500`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
