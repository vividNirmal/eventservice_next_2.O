"use client";

import React from "react";
import { Phone, Mail } from "lucide-react";

export default function ContactPart({ companyData }) {
  // if (!companyData) return null;

  const title =
    "CONTACT US FOR VISITORS OR SHOW RELATED QUERIES";

  const name = companyData?.owner_name || "Contact Person";
  const email_one = companyData?.email_one || "info@example.com";
  const email_two = companyData?.email_two || "info@example.com";

  return (
    <section className="py-8 md:py-12 xl:py-16 bg-white">
      <div className="container mx-auto px-5 text-center">
        <div className="text-center mb-8 xl:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">{title}</h2>
          <div class="w-24 h-1 bg-gradient-to-r from-[#1f75ff] to-[#61daff] mx-auto mt-4 rounded-full"></div>
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-black mb-4">{name}</h3>
        <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-6 text-sm md:text-base lg:text-lg text-zinc-700">
          <div className="flex items-center gap-2">
            <Mail className="size-4 lg:size-5" />
            <a href={`mailto:${email_one}`} className="hover:text-black">{email_one}</a>
          </div>
          <span className="hidden md:block text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <Mail className="size-4 lg:size-5" />
            <a href={`mailto:${email_two}`} className="hover:text-black">{email_two}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
