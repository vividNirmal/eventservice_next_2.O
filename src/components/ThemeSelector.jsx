// src/components/ThemeSelector.jsx
"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ThemeSelector = () => {
  const { currentTheme, availableThemes, themes, changeTheme, userEmail } = useTheme();

  // Only show selector for admin@gmail.com
  if (userEmail !== 'admin@gmail.com' || availableThemes.length < 2) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Palette className="h-4 w-4" />
          {themes[currentTheme]?.name || 'Select Theme'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableThemes.map((themeKey) => (
          <DropdownMenuItem 
            key={themeKey}
            onClick={() => changeTheme(themeKey)}
            className={`flex items-center gap-3 ${
              currentTheme === themeKey ? 'bg-accent' : ''
            }`}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 border-gray-300"
            />
            <span>{themes[themeKey].name}</span>
            {currentTheme === themeKey && (
              <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;