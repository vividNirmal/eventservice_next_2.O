"use client"
import React, { useState } from 'react';
import { Upload, X, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ImageUploadPage() {
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e, imageKey) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({
          ...prev,
          [imageKey]: {
            file,
            preview: reader.result,
            name: file.name
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

  const updateAllImages = () => {
    const uploadedImages = Object.values(images).filter(img => img !== null);
    
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image!');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      alert(`✓ Successfully updated ${uploadedImages.length} image(s)!`);
    }, 1500);
  };

  const ImageUploadBox = ({ imageKey, index }) => {
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
            className="grow flex flex-col items-center justify-center cursor-pointer rounded-xl group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <p className="mt-6 text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              Upload Image {index}
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

  const uploadedCount = Object.values(images).filter(img => img !== null).length;

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
          {/* First Row - 2 Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ImageUploadBox imageKey="image1" index="1" />
            <ImageUploadBox imageKey="image2" index="2" />
            <ImageUploadBox imageKey="image3" index="3" />
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
                Update All Images
              </>
            )}
          </Button>
        </div>

        {/* Mobile Stats */}
        <div className="md:hidden text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg">
            <div className="text-xl font-bold text-blue-600">{uploadedCount}</div>
            <div className="text-xs text-gray-600">/ 3 uploaded</div>
          </div>
        </div>
      </div>
    </>
  );
}