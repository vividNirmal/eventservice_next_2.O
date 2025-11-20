"use client";
import { useEffect, useState } from "react";
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
});

export default function AboutSectionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const companyId = localStorage.getItem("companyId") || "";

        const payload = {
          title: values.title,
          description: values.description,
          companyId,
        };

        const response = await postRequest("save-about-section", payload);

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
          });
        } else {
          formik.resetForm();
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
      <CardHeader>
        <CardTitle>About Section</CardTitle>
        <CardDescription>
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
