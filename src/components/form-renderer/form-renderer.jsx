'use client';

import React, { useState } from 'react';
import { FormElementRenderer } from '../form-elements/form-element-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { validateForm } from '@/lib/form-validation';
import { toast } from 'sonner';
import { Camera, UploadIcon, CheckCircle2 } from 'lucide-react';
import FaceScanner from '../page/scanner/mediabutton/faceScanner/FaceScanner';

/**
 * Form Renderer Component
 * Renders a complete form for end users to fill out
 */
export function FormRenderer({ 
  form ={}, 
  onSubmit, 
  loading = false, 
  faceScannerPermission = false,
  eventHasFacePermission = false 
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Face scanner states
  const [faceImage, setFaceImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceScannerPopup, setFaceScannerPopup] = useState(false);
  const [stopScanner, setStopScanner] = useState(true);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Face scanner handlers
  const handleFaceCapture = () => {
    setFaceScannerPopup(true);
    setStopScanner(true);
  };

  const handleFaceImage = (capturedImageData) => {
    console.log('Face image captured:', typeof capturedImageData, capturedImageData?.substring ? capturedImageData.substring(0, 50) + '...' : capturedImageData);
    setCapturedImage(capturedImageData);
    setFaceImage(capturedImageData); // Store the base64 string directly
    setFaceScannerPopup(false);
    setStopScanner(false);
    toast.success("Face captured successfully!");
  };

  const onEventImageSelected = (event) => {
    const inputElement = event.target;
    const allowedExtensions = ["image/png", "image/jpeg", "image/jpg"];

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];

      if (!allowedExtensions.includes(file.type)) {
        toast.error("Only PNG and JPG files are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Image file uploaded:', file.name, file.size, 'bytes');
        setCapturedImage(e.target.result);
        setFaceImage(file); // Store the File object
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const onCameraError = (error) => {
    console.error("Camera error:", error);
    toast.error("Camera access failed. Please check permissions.");
    setFaceScannerPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Include face image in form data if available
    const submissionData = { ...formData };
    if (faceScannerPermission && eventHasFacePermission && faceImage) {
      if (typeof faceImage === 'string') {
        // If it's a base64 string (from camera capture)
        submissionData.face_image = {
          image: faceImage,
          type: 'base64'
        };
      } else if (faceImage instanceof File) {
        // If it's a File object (from file upload)
        submissionData.face_image = faceImage;
      }
      console.log('Face image added to submission:', submissionData.face_image);
    }

    // Validate form
    const validation = validateForm(submissionData, form.elements);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(submissionData);
      
      // Only reset form if submission was successful
      // The parent component will handle the success/error state
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputElements = form.elements?.filter(
    el => !['divider', 'heading', 'paragraph'].includes(el.type)
  );

  const hasRequiredFields = inputElements?.some(el => el.required);

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {form.title}
          </CardTitle>
          {form.description && (
            <p className="text-gray-600 text-sm mt-2">
              {form.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.elements
              ?.sort((a, b) => a.position - b.position)
              .map((element) => (
                <div key={element.id}>
                  <FormElementRenderer
                    element={element}
                    value={formData[element.name]}
                    onChange={handleFieldChange}
                    error={errors[element.name]?.[0]}
                  />
                </div>
              ))}

            {/* Face Scanner Section - Added after form elements */}
            {faceScannerPermission && eventHasFacePermission && (
              <div className="w-full mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Camera className="size-5 text-blue-600" />
                  Face Verification
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    type="button"
                    onClick={handleFaceCapture}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-auto shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Camera className="size-5 mr-2" />
                    Capture Face
                  </Button>
                  <Label
                    htmlFor="face_image_upload"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <UploadIcon className="size-5" />
                    Upload Image
                    <input
                      type="file"
                      id="face_image_upload"
                      className="opacity-0 absolute left-0 top-0 w-full h-full"
                      accept=".jpg, .jpeg, .png"
                      onChange={onEventImageSelected}
                    />
                  </Label>
                </div>
                {capturedImage && stopScanner && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-green-200">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="max-w-48 rounded-lg shadow-lg"
                    />
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                      <CheckCircle2 className="size-4" />
                      Image captured successfully
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Required fields notice */}
            {hasRequiredFields && (
              <div className="text-xs text-gray-500 mt-4">
                * Required fields
              </div>
            )}

            {/* Submit button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full"
              >
                {isSubmitting 
                  ? 'Submitting...' 
                  : form.settings?.submitText || 'Submit'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Face Scanner Dialog */}
      {faceScannerPopup && (
        <Dialog open={faceScannerPopup} onOpenChange={setFaceScannerPopup}>
          <DialogContent className="sm:max-w-[500px] p-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Face Verification</h3>
              <div className="space-y-4">
                <FaceScanner
                  allowScan={stopScanner}
                  onCameraError={onCameraError}
                  onFaceDetected={handleFaceImage}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFaceScannerPopup(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
