"use client";
import React, { useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2, File, Upload, Image as ImageIcon, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const ExhibitorFormParticularSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  description,
  submitButtonText,
}) => {
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const validationSchema = Yup.object({
    item_name: Yup.string()
      .required("Item name is required")
      .max(200, "Item name must not exceed 200 characters")
      .trim(),
    disclaimer: Yup.string().max(500, "Disclaimer must not exceed 500 characters").trim(),
    purachase_limit_per_order: Yup.number()
      .min(0, "Purchase limit cannot be negative")
      .integer("Purchase limit must be a whole number"),
    national_price: Yup.number()
      .min(0, "National price cannot be negative")
      .typeError("National price must be a number"),
    international_price: Yup.number()
      .min(0, "International price cannot be negative")
      .typeError("International price must be a number"),
    material_number: Yup.number()
      .min(0, "Material number cannot be negative")
      .integer("Material number must be a whole number"),
    zones: Yup.array().of(Yup.string()),
    venue: Yup.array().of(Yup.string()),
    status: Yup.string().oneOf(["active", "inactive"]).default("active"),
  });

  const formik = useFormik({
    initialValues: {
      item_name: initialData?.item_name || "",
      disclaimer: initialData?.disclaimer || "",
      purachase_limit_per_order: initialData?.purachase_limit_per_order || 0,
      national_price: initialData?.national_price || 0,
      international_price: initialData?.international_price || 0,
      material_number: initialData?.material_number || 0,
      zones: initialData?.zones || [],
      venue: initialData?.venue || [],
      image: initialData?.image || "",
      imageFile: null,
      imagePreview: initialData?.image ? `${process.env.NEXT_PUBLIC_API_URL}${initialData.image}` : "",
      documents: initialData?.documents || [],
      newDocuments: [],
      status: initialData?.status || "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      
      // Append basic fields
      formData.append("item_name", values.item_name.trim());
      formData.append("disclaimer", values.disclaimer.trim());
      formData.append("purachase_limit_per_order", values.purachase_limit_per_order);
      formData.append("national_price", values.national_price);
      formData.append("international_price", values.international_price);
      formData.append("material_number", values.material_number);
      formData.append("status", values.status);
      
      // Append arrays
      values.zones.forEach(zone => formData.append("zones[]", zone));
      values.venue.forEach(venue => formData.append("venue[]", venue));
      
      // Handle image
      if (values.imageFile) {
        formData.append("image", values.imageFile);
      } else if (values.image) {
        formData.append("existingImage", values.image);
      }
      
      // Handle documents
      values.documents.forEach((doc, index) => {
        if (!doc._id && !doc.deleted) {
          // New document
          formData.append(`documents[${index}][name]`, doc.name);
          if (doc.file) {
            formData.append(`documents[${index}][file]`, doc.file);
          }
        } else if (doc._id && !doc.deleted) {
          // Existing document
          formData.append(`documents[${index}][_id]`, doc._id);
          formData.append(`documents[${index}][name]`, doc.name);
          formData.append(`documents[${index}][path]`, doc.path);
        }
      });

      // Mark deleted documents
      values.documents.forEach((doc, index) => {
        if (doc.deleted && doc._id) {
          formData.append(`deletedDocuments[]`, doc._id);
        }
      });

      await onSubmit(formData);
    },
    enableReinitialize: true,
  });

  // Handle image upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        formik.setFieldValue("imageFile", file);
        formik.setFieldValue("imagePreview", e.target.result);
        formik.setFieldValue("image", ""); // Clear existing image path if new file is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    formik.setFieldValue("imageFile", null);
    formik.setFieldValue("imagePreview", "");
    formik.setFieldValue("image", "");
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newDocs = files.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        file: file,
        path: URL.createObjectURL(file),
        isNew: true
      }));
      
      formik.setFieldValue("documents", [...formik.values.documents, ...newDocs]);
    }
    
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const removeDocument = (index) => {
    const updatedDocs = [...formik.values.documents];
    
    if (updatedDocs[index]._id) {
      // Existing document - mark for deletion
      updatedDocs[index] = {
        ...updatedDocs[index],
        deleted: true
      };
    } else {
      // New document - remove completely
      updatedDocs.splice(index, 1);
    }
    
    formik.setFieldValue("documents", updatedDocs);
  };

  const restoreDocument = (index) => {
    const updatedDocs = [...formik.values.documents];
    delete updatedDocs[index].deleted;
    formik.setFieldValue("documents", updatedDocs);
  };

  const updateDocumentName = (index, name) => {
    const updatedDocs = [...formik.values.documents];
    const isExisting = updatedDocs[index]._id;
    
    updatedDocs[index] = { 
      ...updatedDocs[index], 
      name,
      nameChanged: isExisting
    };
    formik.setFieldValue("documents", updatedDocs);
  };

  const downloadDocument = (doc) => {
    if (doc.path && !doc.path.startsWith('blob:')) {
      // Existing document - open in new tab
      window.open(`${process.env.NEXT_PUBLIC_API_URL}${doc.path}`, '_blank');
    } else if (doc.path && doc.path.startsWith('blob:')) {
      // New uploaded file - create download link
      const link = document.createElement('a');
      link.href = doc.path;
      link.download = doc.fileName || doc.name;
      link.click();
    }
  };

  // Handle zone/venue input
  const handleArrayInput = (field, value) => {
    if (value.trim()) {
      formik.setFieldValue(field, [...formik.values[field], value.trim()]);
    }
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = formik.values[field].filter((_, i) => i !== index);
    formik.setFieldValue(field, updatedArray);
  };

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const displayDocuments = formik.values.documents?.filter(doc => !doc.deleted) || [];

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-2xl flex flex-col">
        <SheetHeader className="border-b border-gray-200">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="flex flex-col grow h-60">
          <div className="p-4 pt-0 flex flex-col gap-4 grow overflow-y-auto">
            
            {/* Item Name */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="item_name">Item Name *</Label>
              <div className="relative pb-3.5">
                <Input
                  id="item_name"
                  name="item_name"
                  value={formik.values.item_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter item name"
                  className={cn(
                    formik.touched.item_name && formik.errors.item_name
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.item_name && formik.errors.item_name && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.item_name}
                  </p>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="disclaimer">Disclaimer</Label>
              <div className="relative pb-3.5">
                <Textarea
                  id="disclaimer"
                  name="disclaimer"
                  value={formik.values.disclaimer}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter disclaimer text"
                  rows={3}
                  className={cn(
                    formik.touched.disclaimer && formik.errors.disclaimer
                      ? "border-red-500"
                      : ""
                  )}
                />
                {formik.touched.disclaimer && formik.errors.disclaimer && (
                  <p className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formik.errors.disclaimer}
                  </p>
                )}
              </div>
            </div>

            {/* Pricing and Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="purachase_limit_per_order">Purchase Limit</Label>
                <Input
                  id="purachase_limit_per_order"
                  name="purachase_limit_per_order"
                  type="number"
                  min="0"
                  value={formik.values.purachase_limit_per_order}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="material_number">Material Number</Label>
                <Input
                  id="material_number"
                  name="material_number"
                  type="number"
                  min="0"
                  value={formik.values.material_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="national_price">National Price (₹)</Label>
                <Input
                  id="national_price"
                  name="national_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formik.values.national_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="international_price">International Price ($)</Label>
                <Input
                  id="international_price"
                  name="international_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formik.values.international_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            {/* Zones */}
            <div className="flex flex-col gap-2">
              <Label>Zones</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter zone and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayInput('zones', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    handleArrayInput('zones', input.value);
                    input.value = '';
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formik.values.zones.map((zone, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                    {zone}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('zones', index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Venue */}
            <div className="flex flex-col gap-2">
              <Label>Venue</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter venue and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayInput('venue', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    handleArrayInput('venue', input.value);
                    input.value = '';
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formik.values.venue.map((venue, index) => (
                  <div key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm flex items-center gap-1">
                    {venue}
                    <button
                      type="button"
                      onClick={() => removeArrayItem('venue', index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Item Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50">
                {formik.values.imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto max-w-md">
                      <img
                        src={formik.values.imagePreview}
                        alt="Item preview"
                        className="w-full h-48 object-contain rounded-lg border"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => imageInputRef.current?.click()}
                          className="bg-white/90 hover:bg-white shadow-sm"
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="bg-white/90 hover:bg-white shadow-sm"
                        >
                          <X className="h-4 w-4 text-black" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-center text-sm text-green-600">
                      Image uploaded successfully!
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-blue-100 p-4 rounded-full">
                        <ImageIcon className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        Upload Item Image
                      </p>
                      <p className="text-xs text-gray-500">
                        Recommended size: 1MB
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Upload className="h-4 w-4" />
                      Choose Image
                    </Button>
                  </div>
                )}
                
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Supporting Documents */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Supporting Documents</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => docInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Documents
                </Button>
              </div>

              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                ref={docInputRef}
                onChange={handleDocumentUpload}
                className="hidden"
              />

              <div className="space-y-4">
                {displayDocuments.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <File className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No supporting documents added</p>
                      <p className="text-sm mt-2">Click "Add Documents" to upload files</p>
                    </CardContent>
                  </Card>
                ) : (
                  displayDocuments.map((doc, index) => {
                    const originalIndex = formik.values.documents.findIndex(d => d === doc);
                    return (
                      <Card key={originalIndex} className="relative">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              #{originalIndex + 1}
                            </span>
                            {doc.isNew ? 'New Document' : 'Existing Document'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`doc-name-${originalIndex}`}>Document Name</Label>
                            <Input
                              id={`doc-name-${originalIndex}`}
                              type="text"
                              value={doc.name}
                              onChange={(e) => updateDocumentName(originalIndex, e.target.value)}
                              placeholder="Enter document name"
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <File className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {doc.name || doc.fileName || 'Untitled Document'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.file ? `New upload - Size: ${(doc.file.size / 1024 / 1024).toFixed(2)}MB` : 
                                  doc.path ? 'Existing document' : 'New document'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {(doc.path) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadDocument(doc)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(originalIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {formik.values.documents?.filter(doc => doc.deleted).length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    {formik.values.documents.filter(doc => doc.deleted).length} document(s) marked for deletion. 
                    They will be removed when you save.
                  </p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between border rounded-md p-3">
              <Label htmlFor="status" className="text-sm">
                Active Status
              </Label>
              <Switch
                id="status"
                name="status"
                checked={formik.values.status === "active"}
                onCheckedChange={(checked) =>
                  formik.setFieldValue("status", checked ? "active" : "inactive")
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ExhibitorFormParticularSheet;