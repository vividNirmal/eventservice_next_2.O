// src/contexts/ThemeContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("theme1");
  const [availableThemes, setAvailableThemes] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Define theme configurations
  const themes = {
    theme1: {
      name: "Theme 1",
      hasSidebar: true,
      route: "/dashboard/dashboard",
    },
    theme2: {
      name: "Theme 2",
      hasSidebar: false,
      route: "/dashboard/event-host", // Different route for theme 2
    },
  };

  useEffect(() => {
    const loginUser = localStorage.getItem("loginuser");
    if (loginUser) {
      const userData = JSON.parse(loginUser);
      setUserEmail(userData.email);

      if (userData.email === "admin@gmail.com") {
        // Admin sees both themes
        setAvailableThemes(["theme1", "theme2"]);
        const savedTheme = localStorage.getItem("selectedTheme") || "theme1";
        setCurrentTheme(savedTheme);
      } else if (userData.email === "demoadmin@gmail.com") {
        // Demo admin only sees theme2 with no option to change
        setAvailableThemes([]);
        setCurrentTheme("theme2");
      } else {
        // Other users only see theme1
        setAvailableThemes([]);
        setCurrentTheme("theme1");
      }
    }
  }, []);

  useEffect(() => {
    if (userEmail === "demoadmin@gmail.com" && currentTheme === "theme2") {
      router.replace(themes.theme2.route); // "/admin/user-list"
    }
  }, [userEmail, currentTheme]);

  const changeTheme = (themeKey) => {
    if (availableThemes.includes(themeKey)) {
      setCurrentTheme(themeKey);
      localStorage.setItem("selectedTheme", themeKey);

      // Redirect to appropriate route based on theme
      const newRoute = themes[themeKey].route;
      router.push(newRoute);
    }
  };

  const getThemeConfig = () => themes[currentTheme];

  const value = {
    currentTheme,
    availableThemes,
    themes,
    userEmail,
    changeTheme,
    getThemeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
