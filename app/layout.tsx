import "./globals.css";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Rental Tracker - Property & Rent Management",
  description: "Track your rental properties, tenants, and payments with ease",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className="flex min-h-screen flex-col bg-neutral-base text-slate-800 dark:text-slate-100 antialiased dark:bg-slate-950">
        <NavHeader />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
