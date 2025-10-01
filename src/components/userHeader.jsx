"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function UserHeader() {
  const [showMobileView, setShowMobileView] = useState(false);
  const [headerLogo, setHeaderLogo] = useState("/assets/images/logo.png"); // default

  return (
    <header className="w-full bg-no-repeat bg-[center_top_32%] bg-cover py-4 xl:py-5 2xl:py-8 sticky top-0 left-0 after:bg-[#595959]/80 lg:after:bg-black/65 after:w-full after:h-full after:absolute after:top-0 after:left-0 after:z-[1] lg:before:w-full lg:before:h-full lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:blur-sm lg:before:bg-white/20 z-50 site-header relative">
      <div className="container mx-auto px-4 relative z-[2]">
        <div className="flex flex-wrap items-center">
          {/* Logo */}
          <Link
            href="/"
            className="border-[3px] md:border-[5px] border-solid border-primary max-w-[85px] sm:max-w-[115px] lg:max-w-[156px] py-px lg:py-0 px-3 content-center rounded-[7px]"
          >
            <Image
              src={headerLogo}
              alt="Logo"
              width={156}
              height={50}
              className="block max-w-full h-auto"
            />
          </Link>

          {/* Buttons: Become Sponsor / Partners */}
          <div className="lg:pl-6 lg:order-3 content-center ml-auto lg:ml-0">
            <ul className="flex flex-wrap gap-1.5 sm:gap-3 items-center">
              <li>
                <Link
                  href="#"
                  className="px-1.5 sm:px-3 block font-bold text-[9px] lg:text-[13px] leading-[16px] p-1.5 lg:p-3.5 rounded-[4px] bg-white text-primary hover:text-white hover:bg-primary transition-all duration-200 ease-linear"
                >
                  Become Sponsor
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="px-1.5 sm:px-3 block font-bold text-[9px] lg:text-[13px] leading-[16px] p-1.5 lg:p-3.5 rounded-[4px] bg-primary text-white hover:text-primary hover:bg-white transition-all duration-200 ease-linear"
                >
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile menu button */}
          <div className="lg:ml-auto content-center">
            <button
              type="button"
              className="w-7 h-7 block lg:hidden rounded-md bg-white p-1 ml-1.5 relative z-30"
              onClick={() => setShowMobileView(!showMobileView)}
            >
              {!showMobileView ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  className="block w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.25 4.5H15.75M2.25 8.99998H15.75M2.25 13.5H15.75"
                    stroke="#EB3BB3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="block size-4 mx-auto"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L11 11M1 11L11 1"
                    stroke="#EB3BB3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            {/* Navigation */}
            <nav
              className={`lg:static lg:inline-block fixed top-0 left-0 lg:w-auto w-full h-full lg:h-auto lg:bg-transparent bg-[#131641] lg:p-0 p-4 sm:p-10 pt-20 z-20 ${
                showMobileView ? "block" : "hidden"
              }`}
            >
              <ul className="flex lg:flex-row flex-col gap-4 lg:gap-3 lg:items-center">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About Us" },
                  { href: "/services", label: "Services" },
                  { href: "/visit", label: "Visit" },
                  { href: "/exibit", label: "Exibit" },
                  { href: "/login", label: "Login" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="lg:px-3 lg:py-0 p-4 block text-base xl:text-lg font-medium no-underline text-white leading-tight hover:text-primary transition-all duration-200 ease-linear"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
