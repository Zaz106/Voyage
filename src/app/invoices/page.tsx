import React from "react";
import type { Metadata } from "next";
import InvoiceHero from "@/components/sections/Invoices/InvoiceHero";
import InvoiceForm from "@/components/sections/Invoices/InvoiceForm";

export const metadata: Metadata = {
  title: "Create Invoice | Voyage",
  description: "Generate and share professional invoices with your clients.",
};

export default function InvoicesPage() {
  return (
    <main>
      <InvoiceHero />
      <InvoiceForm />
    </main>
  );
}
