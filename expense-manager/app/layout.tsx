import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlatSplit • 4-Person Flat Expense Manager",
  description: "Mobile-first four-person roommate expense tracking, net balance calculation, greedy debt simplification, and settlement manager.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
