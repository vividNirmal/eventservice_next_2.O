"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { UploadCloud, X, Trash2, Plus } from "lucide-react";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
});

export default function DataSectionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [badges, setBadges] = useState([]);
  const [newBadge, setNewBadge] = useState({
    image: "",
    value: "",
    label: "",
    imagePreview: "",
  });
  const [badgeErrors, setBadgeErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const companyId = localStorage.getItem("companyId") || "";

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("companyId", companyId);

        // Append existing badges (without files)
        const existingBadges = badges.map(badge => ({
          image: badge.image,
          value: badge.value,
          label: badge.label,
          _id: badge._id
        }));
        formData.append("existingBadges", JSON.stringify(existingBadges));

        // Append badge images
        badges.forEach((badge, index) => {
          if (badge.imageFile) {
            formData.append(`badgeImages`, badge.imageFile);
            formData.append(`badgeImageIndexes`, index.toString());
          }
        });

        const response = await postRequest("save-data-section", formData);

        if (response.status === 1) {
          toast.success(response.message || "Data section saved successfully!");
          await fetchDataSection();
        } else {
          toast.error(response.message || "Failed to save data section");
        }
      } catch (error) {
        console.error("Failed to save data section:", error);
        toast.error("Failed to save data section.");
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchDataSection = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      const response = await getRequest(`get-data-section/${companyId}`);

      if (response.status === 1) {
        const section = response.data.dataSection;

        if (section) {
          formik.setValues({
            title: section.title || "",
          });
        
          const badgesWithPreviews = (section.badges || []).map(badge => ({
            ...badge,
            imagePreview: badge.imageUrl || badge.image, // Use imageUrl from API for preview
            imageFile: undefined // No file initially for existing badges
          }));
        
          setBadges(badgesWithPreviews);
            //   setBadges(section.badges || []);
        } else {
          formik.resetForm();
          setBadges([]);
        }
      } else {
        toast.error(response.message || "Failed to fetch data section");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch data section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSection();
  }, []);

  const handleBadgeImageUpload = (file, isNewBadge = false, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isNewBadge) {
        setNewBadge(prev => ({
          ...prev,
          imagePreview: reader.result,
          imageFile: file,
        }));
      } else if (index !== undefined) {
        const updatedBadges = [...badges];
        updatedBadges[index] = {
          ...updatedBadges[index],
          imagePreview: reader.result,
          imageFile: file,
        };
        setBadges(updatedBadges);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateNewBadge = () => {
    const errors = {};
    
    if (!newBadge.imagePreview && !newBadge.image) {
      errors.image = "Image is required";
    }
    if (!newBadge.value || newBadge.value.trim() === "") {
      errors.value = "Value is required";
    }
    if (!newBadge.label || newBadge.label.trim() === "") {
      errors.label = "Label is required";
    }

    setBadgeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBadge = () => {
    if (!validateNewBadge()) {
      toast.error("Please fill all badge fields");
      return;
    }

    setBadges([...badges, newBadge]);
    setNewBadge({ image: "", value: "", label: "", imagePreview: "" });
    setBadgeErrors({});
    formik.setFieldTouched("title", true);
    toast.success("Badge added");
  };

  const handleRemoveBadge = (index) => {
    const updatedBadges = badges.filter((_, i) => i !== index);
    setBadges(updatedBadges);
    formik.setFieldTouched("title", true);
    toast.success("Badge removed");
  };

  const handleRemoveNewBadgeImage = () => {
    setNewBadge(prev => ({
      ...prev,
      imagePreview: "",
      imageFile: undefined,
    }));
  };

  const handleRemoveBadgeImage = (index) => {
    const updatedBadges = [...badges];
    updatedBadges[index] = {
      ...updatedBadges[index],
      imagePreview: "",
      imageFile: undefined,
      image: "",
    };
    setBadges(updatedBadges);
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
        <CardTitle>Data Section</CardTitle>
        <CardDescription className={"hidden"}>
          Manage your company's data section with title and badges. Only title is required.
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
                  placeholder="Enter data section title"
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

            {/* Badges Section */}
            <div className="space-y-2">
              <Label>Badges {badges.length > 0 && `(${badges.length})`}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Existing Badges */}
                {badges.map((badge, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 z-10"
                        onClick={() => handleRemoveBadge(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="space-y-3">
                        {/* Badge Image */}
                        <div>
                          <Label className="text-xs">Image</Label>
                          <label
                            htmlFor={`badge-image-${index}`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            {badge.imagePreview || badge.imageUrl || badge.image ? (
                              <div className="relative group w-full h-full flex items-center justify-center p-2">
                                <img
                                  src={badge.imagePreview || badge.imageUrl || badge.image}
                                  alt={badge.label}
                                  className="max-h-full max-w-full object-contain rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveBadgeImage(index);
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
                              id={`badge-image-${index}`}
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleBadgeImageUpload(file, false, index);
                              }}
                            />
                          </label>
                        </div>

                        {/* Badge Value */}
                        <div>
                          <Label className="text-xs">Value</Label>
                          <Input
                            placeholder="Enter value"
                            value={badge.value}
                            onChange={(e) => {
                              const updatedBadges = [...badges];
                              updatedBadges[index] = { ...badge, value: e.target.value };
                              setBadges(updatedBadges);
                            }}
                          />
                        </div>

                        {/* Badge Label */}
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input
                            placeholder="Enter label"
                            value={badge.label}
                            onChange={(e) => {
                              const updatedBadges = [...badges];
                              updatedBadges[index] = { ...badge, label: e.target.value };
                              setBadges(updatedBadges);
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Badge Card */}
                <Card className="border-dashed border-2 hover:border-gray-400 transition-colors">
                  <CardContent className="p-4 h-full">
                    <div className="space-y-3">
                      {/* New Badge Image */}
                      <div>
                        <Label className="text-xs">Image *</Label>
                        <label
                          htmlFor="new-badge-image"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          {newBadge.imagePreview ? (
                            <div className="relative group w-full h-full flex items-center justify-center p-2">
                              <img
                                src={newBadge.imagePreview}
                                alt="New badge"
                                className="max-h-full max-w-full object-contain rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveNewBadgeImage();
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
                            id="new-badge-image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBadgeImageUpload(file, true);
                            }}
                          />
                        </label>
                        {badgeErrors.image && (
                          <p className="text-red-500 text-xs mt-1">{badgeErrors.image}</p>
                        )}
                      </div>

                      {/* New Badge Value */}
                      <div>
                        <Label htmlFor="new-badge-value" className="text-xs">Value *</Label>
                        <Input
                          id="new-badge-value"
                          placeholder="Enter badge value"
                          value={newBadge.value || ""}
                          onChange={(e) => setNewBadge({ ...newBadge, value: e.target.value })}
                          className={badgeErrors.value ? "border-red-500" : ""}
                        />
                        {badgeErrors.value && (
                          <p className="text-red-500 text-xs mt-1">{badgeErrors.value}</p>
                        )}
                      </div>

                      {/* New Badge Label */}
                      <div>
                        <Label htmlFor="new-badge-label" className="text-xs">Label *</Label>
                        <Input
                          id="new-badge-label"
                          placeholder="Enter badge label"
                          value={newBadge.label || ""}
                          onChange={(e) => setNewBadge({ ...newBadge, label: e.target.value })}
                          className={badgeErrors.label ? "border-red-500" : ""}
                        />
                        {badgeErrors.label && (
                          <p className="text-red-500 text-xs mt-1">{badgeErrors.label}</p>
                        )}
                      </div>

                      {/* Add Badge Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddBadge}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Badge
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
                  "Save Data Section"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}