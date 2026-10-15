import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nalapad CRM — School Admission Management",
  description: "Complete school admission CRM for Nalapad — manage enquiries, follow-ups, walk-ins, registrations, and admissions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
