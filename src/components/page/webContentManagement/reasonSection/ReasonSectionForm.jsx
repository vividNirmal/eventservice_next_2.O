"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { UploadCloud, X, Trash2, Plus } from "lucide-react";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required").trim().min(1).max(250),
  description: Yup.string().optional().trim().max(1000),
  image: Yup.string().required("Image is required"),
});

export default function ReasonSectionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [infoItems, setInfoItems] = useState([]);
  const [newInfo, setNewInfo] = useState({
    info_image: "",
    info_description: "",
    imagePreview: "",
    imageFile: null,
  });
  const [infoErrors, setInfoErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      image: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const companyId = localStorage.getItem("companyId") || "";

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description || "");
        formData.append("companyId", companyId);

        // Append main image
        if (imageFile) {
          formData.append("image", imageFile);
        } else if (values.image) {
          formData.append("existingImage", values.image);
        }

        // Append existing info items (without files)
        const existingInfo = infoItems.map(item => ({
          info_image: item.info_image,
          info_description: item.info_description,
          _id: item._id
        }));
        formData.append("existingInfo", JSON.stringify(existingInfo));

        // Append info images
        infoItems.forEach((item, index) => {
          if (item.imageFile) {
            formData.append(`infoImages`, item.imageFile);
            formData.append(`infoImageIndexes`, index.toString());
          }
        });

        const response = await postRequest("save-reason-section", formData);

        if (response.status === 1) {
          toast.success(response.message || "Reason section saved successfully!");
          await fetchReasonSection();
        } else {
          toast.error(response.message || "Failed to save reason section");
        }
      } catch (error) {
        console.error("Failed to save reason section:", error);
        toast.error("Failed to save reason section.");
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchReasonSection = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      const response = await getRequest(`get-reason-section-admin/${companyId}`);

      if (response.status === 1) {
        const section = response.data.reasonSection;

        if (section) {
          formik.setValues({
            title: section.title || "",
            description: section.description || "",
            image: section.image || "",
          });

          setImagePreview(section.imageUrl || section.image || "");
          setImageFile(null);

          const infoWithPreviews = (section.info || []).map(item => ({
            ...item,
            imagePreview: item.imageUrl || item.info_image,
            imageFile: undefined
          }));

          setInfoItems(infoWithPreviews);
        } else {
          formik.resetForm();
          setImagePreview("");
          setImageFile(null);
          setInfoItems([]);
        }
      } else {
        toast.error(response.message || "Failed to fetch reason section");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch reason section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasonSection();
  }, []);

  const handleMainImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
      formik.setFieldValue("image", "uploaded");
      formik.setFieldTouched("image", true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMainImage = () => {
    setImagePreview("");
    setImageFile(null);
    formik.setFieldValue("image", "");
    formik.setFieldTouched("image", true);
  };

  const handleInfoImageUpload = (file, isNewInfo = false, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isNewInfo) {
        setNewInfo(prev => ({
          ...prev,
          imagePreview: reader.result,
          imageFile: file,
        }));
      } else if (index !== undefined) {
        const updatedInfo = [...infoItems];
        updatedInfo[index] = {
          ...updatedInfo[index],
          imagePreview: reader.result,
          imageFile: file,
        };
        setInfoItems(updatedInfo);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateNewInfo = () => {
    const errors = {};
    
    const hasImage = newInfo.imagePreview || newInfo.info_image;
    const hasDescription = newInfo.info_description && newInfo.info_description.trim() !== "";

    // If one field is filled, both must be filled
    if (hasImage && !hasDescription) {
      errors.info_description = "Description is required when image is provided";
    }
    if (hasDescription && !hasImage) {
      errors.info_image = "Image is required when description is provided";
    }

    // If neither is filled, that's okay (optional)
    // If both are filled, validate them
    if (hasImage && hasDescription) {
      if (newInfo.info_description.trim().length < 1) {
        errors.info_description = "Description must be at least 1 character";
      }
      if (newInfo.info_description.trim().length > 1000) {
        errors.info_description = "Description must not exceed 1000 characters";
      }
    }

    setInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddInfo = () => {
    // Check if both fields are empty (which is allowed, just don't add)
    const hasImage = newInfo.imagePreview || newInfo.info_image;
    const hasDescription = newInfo.info_description && newInfo.info_description.trim() !== "";

    if (!hasImage && !hasDescription) {
      toast.error("Please provide both image and description");
      return;
    }

    if (!validateNewInfo()) {
      toast.error("Please fill both info fields");
      return;
    }

    setInfoItems([...infoItems, newInfo]);
    setNewInfo({ info_image: "", info_description: "", imagePreview: "", imageFile: null });
    setInfoErrors({});
    formik.setFieldTouched("title", true);
    // toast.success("Info item added");
  };

  const handleRemoveInfo = (index) => {
    const updatedInfo = infoItems.filter((_, i) => i !== index);
    setInfoItems(updatedInfo);
    formik.setFieldTouched("title", true);
    // toast.success("Info item removed");
  };

  const handleRemoveNewInfoImage = () => {
    setNewInfo(prev => ({
      ...prev,
      imagePreview: "",
      imageFile: null,
    }));
  };

  const handleRemoveInfoImage = (index) => {
    const updatedInfo = [...infoItems];
    updatedInfo[index] = {
      ...updatedInfo[index],
      imagePreview: "",
      imageFile: undefined,
      info_image: "",
    };
    setInfoItems(updatedInfo);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="px-0">
        <CardTitle>Reason Section</CardTitle>
        <CardDescription className={"hidden"}>
          Manage your company's reason section with title, image, description and info items.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <div className="relative">
                <Input
                  id="title"
                  name="title"
                  type="text"
                  maxLength={250}
                  placeholder="Enter reason section title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.title && formik.errors.title ? "border-red-500" : ""}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-red-500 text-sm absolute">{formik.errors.title}</p>
                )}
              </div>
            </div>

            {/* Main Image */}
            <div className="space-y-2">
              <Label>Main Image *</Label>
              <label
                htmlFor="main-image"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {imagePreview ? (
                  <div className="relative group w-full h-full flex items-center justify-center p-4">
                    <img
                      src={imagePreview}
                      alt="Main preview"
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveMainImage();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-12 h-12 mb-3 text-gray-500" />
                    <p className="text-sm text-gray-500">Upload main image</p>
                  </div>
                )}
                <input
                  id="main-image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMainImageUpload(file);
                  }}
                />
              </label>
              {formik.touched.image && formik.errors.image && (
                <p className="text-red-500 text-sm">{formik.errors.image}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                maxLength={1000}
                placeholder="Enter description (optional)"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                rows={4}
                className={formik.touched.description && formik.errors.description ? "border-red-500" : ""}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm">{formik.errors.description}</p>
              )}
            </div>

            {/* Info Items Section */}
            <div className="space-y-2">
              <Label>Info Items {infoItems.length > 0 && `(${infoItems.length})`}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Existing Info Items */}
                {infoItems.map((item, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 z-10"
                        onClick={() => handleRemoveInfo(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="space-y-3">
                        {/* Info Image */}
                        <div>
                          <Label className="text-xs">Image</Label>
                          <label
                            htmlFor={`info-image-${index}`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            {item.imagePreview || item.imageUrl || item.info_image ? (
                              <div className="relative group w-full h-full flex items-center justify-center p-2">
                                <img
                                  src={item.imagePreview || item.imageUrl || item.info_image}
                                  alt="Info preview"
                                  className="max-h-full max-w-full object-contain rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveInfoImage(index);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                                <p className="text-xs text-gray-500">Upload image</p>
                              </div>
                            )}
                            <input
                              id={`info-image-${index}`}
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleInfoImageUpload(file, false, index);
                              }}
                            />
                          </label>
                        </div>

                        {/* Info Description */}
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            placeholder="Enter description"
                            value={item.info_description}
                            rows={3}
                            maxLength={1000}
                            onChange={(e) => {
                              const updatedInfo = [...infoItems];
                              updatedInfo[index] = { ...item, info_description: e.target.value };
                              setInfoItems(updatedInfo);
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Info Card */}
                <Card className="border-dashed border-2 hover:border-gray-400 transition-colors">
                  <CardContent className="p-4 h-full">
                    <div className="space-y-3">
                      {/* New Info Image */}
                      <div>
                        <Label className="text-xs">Image</Label>
                        <label
                          htmlFor="new-info-image"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          {newInfo.imagePreview ? (
                            <div className="relative group w-full h-full flex items-center justify-center p-2">
                              <img
                                src={newInfo.imagePreview}
                                alt="New info"
                                className="max-h-full max-w-full object-contain rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveNewInfoImage();
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                              <p className="text-xs text-gray-500">Upload image</p>
                            </div>
                          )}
                          <input
                            id="new-info-image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleInfoImageUpload(file, true);
                            }}
                          />
                        </label>
                        {infoErrors.info_image && (
                          <p className="text-red-500 text-xs mt-1">{infoErrors.info_image}</p>
                        )}
                      </div>

                      {/* New Info Description */}
                      <div>
                        <Label htmlFor="new-info-description" className="text-xs">Description</Label>
                        <Textarea
                          id="new-info-description"
                          placeholder="Enter description"
                          value={newInfo.info_description || ""}
                          rows={3}
                          maxLength={1000}
                          onChange={(e) => setNewInfo({ ...newInfo, info_description: e.target.value })}
                          className={infoErrors.info_description ? "border-red-500" : ""}
                        />
                        {infoErrors.info_description && (
                          <p className="text-red-500 text-xs mt-1">{infoErrors.info_description}</p>
                        )}
                      </div>

                      {/* Add Info Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddInfo}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Info Item
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !formik.dirty}
                className="min-w-32"
                size="lg"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Reason Section"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}