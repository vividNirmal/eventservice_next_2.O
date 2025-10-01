"use client";

import { usePathname } from "next/navigation";
import UserHeader from "../userHeader";
import Footer from "../footer";

export default function LayoutClientWrapper({ children }) {
  const pathname = usePathname();
  const shouldHide = pathname.startsWith("/dashboard");

  return (
    <>
      {!shouldHide && <UserHeader />}
      <section className="">
        <div className="">
          {children}
        </div>
        {!shouldHide && <Footer />}
      </section>
    </>
  );
}
