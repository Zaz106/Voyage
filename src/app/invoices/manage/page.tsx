import type { Metadata } from "next";
import InvoiceDashboard from "@/components/sections/Invoices/InvoiceDashboard";

export const metadata: Metadata = {
  title: "Manage Invoices | Voyage",
  description: "View and manage all your invoices.",
};

export default function ManageInvoicesPage() {
  return (
    <main>
      <InvoiceDashboard />
    </main>
  );
}
