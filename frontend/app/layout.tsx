import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unweighted - Stop Dieting Alone",
  description: "Transform weight loss from a solo struggle into a supported journey with AI-powered coaching and human accountability. Join 1,000+ members building sustainable habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
