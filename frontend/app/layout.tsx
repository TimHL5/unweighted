import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unweighted - Smart Workout Planning",
  description: "Get a personalized workout plan based on your goals, schedule, and fitness level",
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
