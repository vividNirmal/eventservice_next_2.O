"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { userGetRequest } from "@/service/viewService";

export default function Homepage() {
  const router = useRouter();
  const params = useParams();
  const [blogList, setBlogList] = useState([]);
  const [paramCity, setParamCity] = useState("");

  useEffect(() => {
    if (params?.city) {
      setParamCity(params.city);
    }
  }, [params]);

  // Fetch blogs (replace `/api/event-blog-listing` with real endpoint)
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await userGetRequest("event-blog-listing");
        setBlogList(res?.data?.blogs || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  const blogDetail = (item) => {
    if (paramCity) {
      router.push(`/blog/${paramCity}/${item.blog_slug}`);
    } else {
      router.push(`/blog/bagaha/${item.blog_slug}`);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-32 bg-no-repeat bg-cover bg-bottom ln-hero-section" style={{
            backgroundImage: "url('assets/images/hero-bg.webp')",
        }}>
        <div className="container mx-auto px-4 text-center">
          <span className="block text-base xl:text-[42px] xl:leading-snug font-semibold text-white">
            Networking Events
          </span>
          <h1 className="text-primary font-black text-2xl sm:text-3xl lg:text-5xl xl:text-[55px] xl:leading-snug max-w-[865px] mx-auto">
            Elevate Your Event With Seamless Networking
          </h1>
          <p className="font-semibold text-lg lg:text-[29px] lg:leading-snug max-w-[1043px] mx-auto mb-5 lg:mb-8 text-white">
            Enhance your event experience with effortless and efficient
            networking opportunities using our event management software.
          </p>
          <Link
            href="#"
            className="xl:text-[28px] xl:leading-[42px] font-bold px-7 py-3 bg-primary text-white rounded-lg inline-block hover:bg-white hover:text-primary transition-all duration-200 ease-linear"
          >
            BOOK A DEMO
          </Link>
        </div>
      </section>

      {/* Blog List Section */}
      <section className="py-20 lg:py-32 relative z-10">
        <div className="container mx-auto px-4">
          <div
            className={`grid grid-cols-2 lg:grid-cols-3 justify-between gap-y-10 gap-x-5 md:gap-11 xl:gap-12 ln-event-card-wrap ${
              blogList.length <= 3 ? "ln-3box" : "ln-4box"
            }`}
          >
            {blogList.map((item, idx) => (
              <div
                key={idx}
                className="ln-card-box relative max-w-[352px] mx-auto sm:max-w-full xl:max-w-[352px] 2xl:max-w-full cursor-pointer"
                onClick={() => blogDetail(item)}
              >
                {/* Example card structure – adjust based on your <app-event-card> template */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.title}
                    width={352}
                    height={200}
                    className="w-full h-[200px] object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
