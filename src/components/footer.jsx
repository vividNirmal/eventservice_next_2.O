"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { userGetRequest } from "@/service/viewService";

export default function Footer() {
  const [playIcon, setPlayIcon] = useState("/assets/images/play-icon.svg"); // default
  const [cityList, setCityList] = useState([]);
  const [loader, setLoader] = useState(false);

  // API call simulation (replace with your actual API endpoint)
  useEffect(() => {
    const fetchCities = async () => {
      setLoader(true);
      try {
        const res = await userGetRequest("get-homepage-cities-data");
        setCityList(res?.data?.cities || []);
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoader(false);
      }
    };
    fetchCities();
  }, []);

  const linkRedirect = (name) =>
    name.replace(/\s+/g, "-").toLowerCase();

  return (
    <>
      {/* Video Section */}
      <div className="w-full relative after:pt-[56.25%] lg:after:pt-[37%] after:block">
        <video
          crossOrigin="anonymous"
          aria-label="Video"
          preload="auto"
          controlsList="nodownload"
          x-webkit-airplay="allow"
          className="w-full h-full max-w-full object-cover object-center absolute top-0 left-0"
          poster="assets/images/foot-video-banner.webp"
        >
          <source src="/videos/movie.mp4" type="video/mp4" />
        </video>
        <Image
          src={playIcon}
          alt="play icon"
          width={64}
          height={64}
          className="lg:w-auto sm:w-16 w-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Footer */}
      <footer className="bg-[#131641] pb-5 sm:pb-8 lg:pb-11">
        {/* Top Title */}
        <div className="bg-[#D9D9D9] py-2 lg:py-3.5 px-4">
          <h3 className="text-primaryBlueColor font-semibold text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-[40px] leading-10 text-center">
            All ACROSS INDIA
          </h3>
        </div>

        {/* City List */}
        <div className="container mx-auto px-4">
          <ul
            className={`flex flex-wrap gap-y-4 pt-4 ln-link-wrap ${
              loader ? "loading" : ""
            }`}
          >
            {cityList.map((item, index) => (
              <li key={index} className="w-2/4 sm:w-1/3 lg:w-1/5">
                <Link
                  href={`/${linkRedirect(item.name)}`}
                  className="pl-7 bg-no-repeat text-sm sm:text-base whitespace-nowrap text-ellipsis overflow-hidden w-40 lg:w-52 block lg:text-lg text-white font-medium"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}
