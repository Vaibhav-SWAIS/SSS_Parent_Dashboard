import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dock Scheduling Optimization",
  description: "Warehouse Dock Scheduling Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
