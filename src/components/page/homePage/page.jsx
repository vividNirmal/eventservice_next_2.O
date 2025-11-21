"use client"

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { userGetRequest } from "@/service/viewService";
import AboutPart from "./common/aboutPart";
import HeroSlider from "./common/heroSlider";

export default function Homepage() {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [aboutData, setAboutData] = useState(null);
  const [subdomain, setSubdomain] = useState("");

  // Get subdomain from hostname
  useEffect(() => {
    const getSubdomainFromHost = (hostname) => {
      const parts = hostname.toLowerCase().split('.');
      const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

      if (isLocalhost) {
        return parts.length > 1 && parts[0] !== 'www' ? parts[0] : null;
      }

      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
      
      if (rootDomain) {
        const rootParts = rootDomain.split('.');
        const domainMatch = parts.slice(-rootParts.length).join('.') === rootDomain;
        
        if (domainMatch && parts.length > rootParts.length) {
          const sub = parts[0];
          return sub !== 'www' ? sub : null;
        }
      } else {
        if (parts.length > 2) {
          const sub = parts[0];
          return sub !== 'www' ? sub : null;
        }
      }

      return null;
    };

    const detectedSubdomain = getSubdomainFromHost(window.location.hostname);
    setSubdomain(detectedSubdomain);
  }, []);

  // Fetch all data when subdomain is available
  useEffect(() => {
    if (!subdomain) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch company details by subdomain
        const companyResponse = await userGetRequest(`company/subdomain/${subdomain}`);
        
        if (companyResponse?.status === 1 && companyResponse?.data?.company) {
          setCompanyData(companyResponse.data.company);
          const companyId = companyResponse.data.company._id;

          // Fetch hero section
          const heroResponse = await userGetRequest(`get-hero-section/${companyId}`);
          if (heroResponse?.status === 1 && heroResponse?.data?.heroSection) {
            // Extract the hero array from the response
            setHeroData(heroResponse.data.heroSection.hero);
          }

          // Fetch about section
          const aboutResponse = await userGetRequest(`get-about-section/${companyId}`);
          if (aboutResponse?.status === 1) {
            setAboutData(aboutResponse.data.aboutSection);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subdomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="w-full bg-white py-2 shadow-lg relative z-10">
        <div className="container mx-auto px-5">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-fit">
              <Link href={'/'} className="block w-fit">
                <img 
                  src={companyData?.logo || "/clean-show.png"} 
                  className="max-w-3xs block w-full" 
                  alt="logo" 
                />
              </Link>
            </div>
            <div className="w-2/4 grow">
              <nav className="flex flex-row items-center justify-end">
                <ul className="flex flex-wrap items-center justify-end gap-4">
                  <li>
                    <Link href={'/'} className="block text-zinc-700 hover:text-black text-base font-semibold">Exhibitors</Link>
                  </li>
                  <li>
                    <Link href={'/'} className="block text-zinc-700 hover:text-black text-base font-semibold">Visitor</Link>
                  </li>
                  <li className="ml-6">
                    <Link href={'/'} className="btn-donate">Login</Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Slider */}
      <HeroSlider heroData={heroData} />

      {/* About Section */}
      <AboutPart aboutData={aboutData} />
    </>
  );
}