"use client";
import { useEffect, useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { textEditormodule } from "@/lib/constant";
import { UploadCloud, X } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string()
    .required("Description is required")
    .test('is-empty', 'Content is required', (value) => {
      if (!value) return false;
      
      // Remove HTML tags and check if there's actual text content
      const textContent = value.replace(/<[^>]*>/g, '').trim();
      return textContent.length > 0;
    }),
  image: Yup.mixed().required("Image is required"),
});

export default function AboutSectionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const companyId = localStorage.getItem("companyId") || "";

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("companyId", companyId);

        // Only append image if it's a new file
        if (values.image && typeof values.image !== "string") {
          formData.append("image", values.image);
        }

        const response = await postRequest("save-about-section", formData);

        if (response.status === 1) {
          toast.success(response.message || "About section saved successfully!");
          await fetchAboutSection(); // refresh
        } else {
          toast.error(response.message || "Failed to save about section");
        }
      } catch (error) {
        console.error("Failed to save about section:", error);
        toast.error("Failed to save about section.");
      } finally {
        setSaving(false);
      }
    },
  });

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        formik.setFieldValue("image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    formik.setFieldValue("image", null);
  }, [formik]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const fetchAboutSection = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      const response = await getRequest(`get-about-section/${companyId}`);

      if (response.status === 1) {
        const sec = response.data.aboutSection;

        if (sec) {
          formik.setValues({
            title: sec.title || "",
            description: sec.description || "",
            image: sec.image || null,
          });
          // Set image preview from URL
          if (sec.imageUrl) {
            setImagePreview(sec.imageUrl);
          }
        } else {
          formik.resetForm();
          setImagePreview(null);
        }
      } else {
        toast.error(response.message || "Failed to fetch about section");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch about section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutSection();
  }, []);

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
        <CardTitle>About Section</CardTitle>
        <CardDescription className={"hidden"}>
          Manage your company's about section. This content will be displayed on your website.
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
                  placeholder="Enter about section title"
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

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>About Image *</Label>
              <div className="relative pb-3.5">
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {imagePreview ? (
                    <div className="relative group w-full h-full flex items-center justify-center p-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain border rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, GIF (Max 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
                {formik.touched.image && formik.errors.image && (
                  <p className="text-red-500 text-sm mt-1 absolute">
                    {formik.errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Content *</Label>
              <div className="relative">
                <ReactQuill
                  id="description"
                  name="description"
                  theme="snow"
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue("description", value)}
                  onBlur={() => formik.setFieldTouched("description", true)}
                  modules={textEditormodule.modules}
                  className="w-full min-h-64 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-md [&>.ql-container.ql-snow]:rounded-b-md [&>.ql-container.ql-snow]:flex-grow"
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-red-500 text-sm mt-1 absolute">{formik.errors.description}</p>
                )}
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
                ) : "Save About Section"}
              </Button>
            </div>

          </div>
        </form>
      </CardContent>
    </Card>
  );
}
