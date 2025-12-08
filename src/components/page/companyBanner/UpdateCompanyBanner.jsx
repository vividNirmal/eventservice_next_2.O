"use client"
import React, { useState, useEffect } from 'react';
import { Upload, X, Save, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { postRequest, getRequest } from '@/service/viewService';

export default function ImageUploadPage() {
  const [images, setImages] = useState({
    logo: null,
    exhibitor_dashboard_banner: null,
    attandess_dashboard_banner: null,
    company_login_banner: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing images on component mount
  useEffect(() => {
    fetchCompanyImages();
  }, []);

  const fetchCompanyImages = async () => {
    try {
      setIsLoading(true);
      const companyId = localStorage.getItem("companyId");
      
      if (!companyId) {
        toast.error('Company ID not found in local storage');
        return;
      }

      const response = await getRequest(`get-company-logo/${companyId}`);
      
      // Handle the nested response structure
      if (response && response.data && response.data.images) {
        const companyImages = response.data.images;
        
        // Set existing images with preview URLs
        const updatedImages = {
          logo: null,
          exhibitor_dashboard_banner: null,
          attandess_dashboard_banner: null,
          company_login_banner: null
        };

        // Map the API response to our state
        if (companyImages.logo) {
          updatedImages.logo = {
            file: null,
            preview: companyImages.logo,
            name: `Current logo`,
            isExisting: true
          };
        }
        if (companyImages.exhibitor_dashboard_banner) {
          updatedImages.exhibitor_dashboard_banner = {
            file: null,
            preview: companyImages.exhibitor_dashboard_banner,
            name: `Current exhibitor banner`,
            isExisting: true
          };
        }
        if (companyImages.attandess_dashboard_banner) {
          updatedImages.attandess_dashboard_banner = {
            file: null,
            preview: companyImages.attandess_dashboard_banner,
            name: `Current attendee banner`,
            isExisting: true
          };
        }
        if (companyImages.company_login_banner) {
          updatedImages.company_login_banner = {
            file: null,
            preview: companyImages.company_login_banner,
            name: `Current login banner`,
            isExisting: true
          };
        }
        
        setImages(updatedImages);
      } else {
        console.warn("No images found in response:", response);
      }
    } catch (error) {
      console.error("Error fetching company images:", error);
      toast.error('Failed to load existing images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e, imageKey) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          [imageKey]: {
            file,
            preview: reader.result,
            name: file.name,
            isExisting: false
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageKey) => {
    setImages(prev => ({
      ...prev,
      [imageKey]: null
    }));
  };

  const updateAllImages = async () => {
    const uploadedImages = Object.entries(images)
      .filter(([key, img]) => img !== null && !img.isExisting);
    
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one new image or make changes!');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      const companyId = localStorage.getItem("companyId");
      
      if (!companyId) {
        toast.error('Company ID not found');
        return;
      }

      // Append only new images to FormData
      uploadedImages.forEach(([key, imageData]) => {
        formData.append(key, imageData.file);
      });
      
      formData.append('company_id', companyId);

      const response = await postRequest(`update-company-logo`, formData);
      
      if (response && response.status === 1) {
        toast.success(response.message || 'Images updated successfully!');
        // Refresh the images to get updated URLs
        await fetchCompanyImages();
      } else {
        toast.error(response?.message || 'Upload failed');
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      toast.error(error?.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const ImageUploadBox = ({ imageKey, title }) => {
    const image = images[imageKey];

    return (
      <Card className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400">
        {image ? (
          // Preview Mode
          <div className="relative h-96 rounded-xl overflow-hidden">
            <img
              src={image.preview}
              alt={image.name}
              className="w-full h-full rounded-xl object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-medium truncate mb-2">
                  {image.name}
                </p>
                <div className="flex items-center gap-2">
                  <label htmlFor={`upload-${imageKey}`} className="flex-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-white/90 hover:bg-white text-gray-900"
                      asChild
                    >
                      <span>
                        <Upload className="w-3 h-3 mr-2" />
                        Change
                      </span>
                    </Button>
                  </label>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeImage(imageKey)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <input
              id={`upload-${imageKey}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, imageKey)}
            />
            <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
              <Check className="w-4 h-4" />
            </div>
          </div>
        ) : (
          // Upload Mode
          <label
            htmlFor={`upload-${imageKey}`}
            className="h-96 flex flex-col items-center justify-center cursor-pointer rounded-xl group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <p className="mt-6 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {title}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Click or drag to upload
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, WEBP (Max 10MB)
            </p>
            <input
              id={`upload-${imageKey}`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, imageKey)}
            />
          </label>
        )}
      </Card>
    );
  };

  const uploadedCount = Object.values(images).filter(img => img !== null && !img.isExisting).length;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading company images...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4 flex flex-col gap-1.5 items-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-4 py-1 text-xs font-semibold shadow-lg">company Image Management System</span>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">Upload Banner and logo</h2>            
        </div>

        {/* Upload Grid */}
        <div className="flex flex-col mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ImageUploadBox imageKey="logo" title={'Company Logo'} />
            <ImageUploadBox imageKey="exhibitor_dashboard_banner" title={'Exhibitor Banner'} />
            <ImageUploadBox imageKey="attandess_dashboard_banner" title={'Attendee Banner'} />
            <ImageUploadBox imageKey="company_login_banner" title={'Company Login Banner'} />
          </div>
        </div>

        {/* Update Button */}
        <div className="flex justify-center pb-2">
          <Button
            onClick={updateAllImages}
            disabled={isUploading || uploadedCount === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-5 text-base font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Update Images
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}