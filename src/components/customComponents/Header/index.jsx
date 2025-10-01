"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils'; 

export default function Header({ sidebarVisible = true }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setProfileOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!sidebarVisible) return null;

  return (
    <header className="mt-4 w-full max-w-[calc(100%_-_32px)] sticky top-4 rounded-xl bg-white flex items-center justify-end shadow-[0_0_6px_0_rgba(0,0,0,0.12)] mx-auto px-4 py-3.5">
      <div
        className="w-9 h-9 rounded-full bg-[#131641] flex justify-center items-center text-white relative cursor-pointer"
        onClick={toggleProfile}
        ref={menuRef}
      >
        <span className="bg-[#28c76f] w-2.5 h-2.5 rounded-full border border-solid border-white absolute -bottom-px -right-px" />
      </div>

      <div
        className={cn(
          'flex flex-col bg-white rounded-lg shadow-xl overflow-hidden max-w-fit absolute top-full z-[1] transition-all duration-200 ease-linear',
          profileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        <a
          href="/dashboard/change-password"
          className="block w-full font-medium text-xs 2xl:text-sm py-1.5 2xl:py-2 px-3 hover:bg-gray-200"
        >
          Change Password
        </a>
        <button
          type="button"
          className="block w-full font-medium text-xs 2xl:text-sm py-1.5 2xl:py-2 px-3 hover:bg-gray-200"
        >
          UserName
        </button>
      </div>
    </header>
  );
}
