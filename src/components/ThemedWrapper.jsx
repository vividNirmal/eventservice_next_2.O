// src/components/ThemedWrapper.jsx
"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect } from 'react';

const ThemedWrapper = ({ children }) => {
  const { getThemeConfig } = useTheme();
  
//   useEffect(() => {
//     const themeConfig = getThemeConfig();
//     if (themeConfig) {
//       // Apply CSS custom properties for theming
//       const root = document.documentElement;
//       root.style.setProperty('--theme-primary', themeConfig.colors.primary);
//       root.style.setProperty('--theme-background', themeConfig.colors.background);
//       root.style.setProperty('--theme-card-bg', themeConfig.colors.cardBg);
//       root.style.setProperty('--theme-text', themeConfig.colors.text);
//       root.style.setProperty('--theme-border', themeConfig.colors.border);
      
//       // Add theme class to body
//       document.body.className = `theme-${themeConfig.layout}`;
//     }
//   }, [getThemeConfig]);

  const themeConfig = getThemeConfig();
  
  if (!themeConfig) {
    return <div className="bg-[#f7f7f7]">{children}</div>;
  }

  return (
    <div 
      className="min-h-screen transition-all duration-300"
    >
      {children}
    </div>
  );
};

export default ThemedWrapper;