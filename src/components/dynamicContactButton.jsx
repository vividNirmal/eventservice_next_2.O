"use client";

import { useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GetQuotesForm } from "@/components/modal/getQuotesForm";
import { ChatBot } from "@/components/modal/chatBot";

export default function DynamicContactButton() {
  const staticdata = useSelector((state) => state.setting.staticData);

  const phoneNumber = staticdata?.site_data?.phone_number || "";

  // Default fallback buttons
  const defaultButtons = ["Quote", "Call", "Chat", "Whatsapp"];

  // Get ordered button list from API or use default
  const buttonList = useMemo(() => {
    const sequence = staticdata?.sidebar_button_sequence;
    if (sequence) {
      return sequence
        .split(/[\s,]+/)
        .map((btn) => btn.trim())
        .filter(Boolean);
    }
    return defaultButtons;
  }, [staticdata]);

  // Button rendering
  const renderButton = (label) => {
    const lowerLabel = label.toLowerCase();

    switch (lowerLabel) {
      case "quote":
        return (
          <div key="Quote">
            <GetQuotesForm />
          </div>
        );z
      case "call":
        return (
          <Button key="call" variant="outline" className="min-w-24 text-white bg-blue-700 hover:bg-blue-800 hover:text-white focus:ring-4 focus:ring-blue-300 focus:outline-none border border-solid border-blue-700 hover:scale-103 active:scale-95 active:shadow-none">
            <a href={`tel:${phoneNumber}`} className="">Call</a>
          </Button>
        );
      case "chat":
        return (
          <div key="chat">
            <ChatBot />
          </div>
        );
      case "whatsapp":
        return (
          <Button key="whatsapp" variant="outline" className="min-w-24 text-white bg-green-700 hover:bg-green-800 hover:text-white focus:ring-4 focus:ring-green-300 hover:scale-103 active:scale-95 active:shadow-none">
            <a href={`https://wa.me/${phoneNumber}`} target="_blank">Whatsapp</a>
          </Button>
        );
      default:
        return null;
    }
  };

  // Prevent flashing: only show after staticdata is available (optional)
  if (!staticdata) return null;

  return (
    <div className="bg-white md:bg-transparent flex items-center gap-1 md:gap-2 justify-center max-w-full md:max-w-fit w-full [&>div>button]:w-full fixed z-30 md:py-0 py-2.5 bottom-0 md:bottom-auto md:top-[30%] right-0 md:right-3 md:-rotate-90 md:origin-bottom-right px-2.5">
      {buttonList.map((btn) => renderButton(btn))}
    </div>
  );
}
