import React from "react";
import type { Metadata } from "next";
import GetStartedHero from "@/components/sections/GetStarted/GetStartedHero";
import GetStartedForm from "@/components/sections/GetStarted/GetStartedForm";

export const metadata: Metadata = {
  title: "Get Started | Voyage",
  description: "Tell us about your project. Fill out our smart project brief and we'll create the perfect digital solution for your business.",
};

export default function GetStartedPage() {
  return (
    <main>
      <GetStartedHero />
      <GetStartedForm />
    </main>
  );
}
