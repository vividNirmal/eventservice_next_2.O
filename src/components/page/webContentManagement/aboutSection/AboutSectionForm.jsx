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
  description: Yup.string().required("Description is required"),
});

export default function AboutSectionForm() {
  const [aboutSection, setAboutSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAboutSection();
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
        if (response.data.aboutSection) {
          setAboutSection(response.data.aboutSection);
          formik.setValues({
            title: response.data.aboutSection.title || "",
            description: response.data.aboutSection.description || "",
          });
        } else {
          // No about section exists yet
          setAboutSection(null);
          formik.resetForm();
        }
      } else {
        toast.error(response.message || "Failed to fetch about section");
      }
    } catch (error) {
      console.error("Failed to fetch about section:", error);
      toast.error("Failed to fetch about section");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const companyId = localStorage.getItem("companyId") || "";
        
        const payload = {
          title: values.title,
          description: values.description,
          companyId: companyId
        };

        const response = await postRequest("save-about-section", payload);

        if (response.status === 1) {
          toast.success(response.message || "About section saved successfully!");
          // Refresh the data
          await fetchAboutSection();
        } else {
          toast.error(response.message || "Failed to save about section");
        }
      } catch (error) {
        console.error("Failed to save about section details:", error);
        toast.error("Failed to save about section details.");
      } finally {
        setSaving(false);
      }
    },
  });

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
                <p className="text-red-500 text-sm">{formik.errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Content *</Label>
              <ReactQuill
                id="description"
                name="description"
                theme="snow"
                value={formik.values.description}
                onChange={(value) => formik.setFieldValue("description", value)}
                onBlur={() => formik.setFieldTouched("description", true)}
                modules={textEditormodule.modules}
                className="min-h-48 [&>.ql-container.ql-snow]:min-h-32"
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.description}</p>
              )}
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