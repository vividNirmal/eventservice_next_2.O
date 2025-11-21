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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-5 text-center">

        {/* TITLE */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-black mb-10">
          {title}
        </h2>

        {/* CONTACT PERSON NAME */}
        <h3 className="text-xl md:text-2xl font-semibold text-black mb-4">
          {name}
        </h3>

        {/* CONTACT DETAILS */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg text-zinc-700">

          {/* EMAIL ONE */}
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <a 
              href={`mailto:${email_one}`} 
              className="hover:text-black"
            >
              {email_one}
            </a>
          </div>

          {/* SEPARATOR */}
          <span className="hidden md:block text-zinc-600">|</span>

          {/* EMAIL TWO */}
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <a 
              href={`mailto:${email_two}`} 
              className="hover:text-black"
            >
              {email_two}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
