"use client";

import { handleSetListingType } from "@/redux/listinDynamicrouter/Listing";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function StandAloneWrapper({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(handleSetListingType(null));
  }, [pathname]);

  return children;
}
