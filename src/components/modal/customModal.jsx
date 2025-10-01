"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const CustomModal = ({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-lg w-full ${width} mx-4 relative`}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 p-1 rounded-full focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        {title && (
          <div className="px-6 pt-6 pb-2 border-b border-zinc-100">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
