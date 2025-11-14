"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getRequest } from '@/service/viewService';

const CompanyImageContext = createContext();

export const useCompanyImages = () => {
  const context = useContext(CompanyImageContext);
  if (!context) {
    throw new Error('useCompanyImages must be used within a CompanyImageProvider');
  }
  return context;
};

export const CompanyImageProvider = ({ children }) => {
  const [companyImages, setCompanyImages] = useState({
    logo: null,
    exhibitor_dashboard_banner: null,
    attandess_dashboard_banner: null,
    company_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch company images only when needed
  const fetchCompanyImages = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate calls
    if (isLoading || (isInitialized && !forceRefresh)) return;

    const companyId = typeof window !== "undefined"
      ? localStorage.getItem("companyId")
      : null;

    // IMPORTANT: Validate BEFORE setting loading
    if (!companyId || companyId === "undefined") {
      console.warn("No valid companyId found in localStorage");
      return;
    }

    try {
      setIsLoading(true);

      const response = await getRequest(`get-company-logo/${companyId}`);

      if (response?.status === 1 && response?.data?.images) {
        setCompanyImages(response.data.images);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error fetching company images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isInitialized]);

  // Initialize on mount if companyId exists
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId && !isInitialized) {
      fetchCompanyImages();
    }
  }, [fetchCompanyImages, isInitialized]);

  // Update specific image
  const updateCompanyImage = useCallback((imageKey, imageUrl) => {
    setCompanyImages(prev => ({
      ...prev,
      [imageKey]: imageUrl
    }));
  }, []);

  // Update all images at once
  const updateAllCompanyImages = useCallback((newImages) => {
    setCompanyImages(prev => ({
      ...prev,
      ...newImages
    }));
  }, []);

  // Get appropriate banner based on user type
  const getBannerForUserType = useCallback((userType) => {
    if (userType === 'Exhibitor') {
      return companyImages.exhibitor_dashboard_banner;
    } else if (userType === 'Event Attendees') {
      return companyImages.attandess_dashboard_banner;
    }
    return null;
  }, [companyImages.exhibitor_dashboard_banner, companyImages.attandess_dashboard_banner]);

  const value = {
    companyImages,
    isLoading,
    isInitialized,
    fetchCompanyImages,
    updateCompanyImage,
    updateAllCompanyImages,
    getBannerForUserType,
    logo: companyImages.logo,
    exhibitorBanner: companyImages.exhibitor_dashboard_banner,
    attendeeBanner: companyImages.attandess_dashboard_banner,
    companyName: companyImages.company_name
  };

  return (
    <CompanyImageContext.Provider value={value}>
      {children}
    </CompanyImageContext.Provider>
  );
};