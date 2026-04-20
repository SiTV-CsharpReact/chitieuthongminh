import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/context/Providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Chi tiêu thông minh",
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
      className="h-full antialiased"
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
