"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { textEditormodule } from "@/lib/constant";
import { toast } from "sonner";
import { Loader2, UploadCloud, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { getRequest, postRequest } from "@/service/viewService";

// Dynamically import ReactQuill to ensure it's client-side only
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

function AddBlogPage({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blogImgPreview, setBlogImgPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      blog_title: "",
      description: "",
      blog_image: null,
    },
    validationSchema: Yup.object({
      blog_title: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("blog_title", values.blog_title);
        formData.append("description", values.description);

        if (values.blog_image instanceof File) {
          formData.append("blog_image", values.blog_image);
        }

        if (id) {
          formData.append("blog_id", id);
          const response = await postRequest("update-blog", formData);
          if (response.status == 1) {
            router.push("/dashboard/blog-list");
            toast.success("Blog updated successfully");
          }
        } else {
          const response = await postRequest("add-blog", formData);
          if (response.status == 1) {
            router.push("/dashboard/blog-list");
            toast.success("Blog added successfully");
          }
        }
      } catch (error) {
        toast.error("Failed to submit blog");
        console.error(error);
      }
    },
  });

  // File upload handlers (like Event Add Page)
  const handleFilesBlogImage = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setBlogImgPreview(null);
      formik.setFieldValue("blog_image", null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImgPreview({ src: reader.result, isNew: true, file });
        formik.setFieldValue("blog_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = useCallback(
    (event) => {
      event.preventDefault();
      handleFilesBlogImage(event.dataTransfer.files);
    },
    [handleFilesBlogImage]
  );

  const handleRemoveImage = useCallback(() => {
    setBlogImgPreview(null);
    formik.setFieldValue("blog_image", null);
  }, [formik]);

  const handleImageDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Fetch existing blog details when editing
  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`blog-details/${id}`);
      if (response.status === 1) {
        const blogData = response.data;
        formik.setValues({
          blog_title: blogData.blog_title,
          description: blogData.description,
          blog_image: null,
        });
        setBlogImgPreview({ src: blogData.blog_image, isNew: false });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-start">
        <div className="w-full relative">
          <h1 className="text-xl font-bold mb-4">
            {id ? `Edit Blog` : "Add Blog"}
          </h1>
          <div className="relative">
            {loading ? (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <form onSubmit={formik.handleSubmit} className="space-y-4 mt-6">
                {/* Blog Title */}
                <div className="space-y-2">
                  <Label htmlFor="blog_title">Name</Label>
                  <Input
                    id="blog_title"
                    name="blog_title"
                    placeholder="Enter Blog Title"
                    value={formik.values.blog_title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.blog_title && formik.errors.blog_title && (
                    <p className="text-sm text-red-500">
                      {formik.errors.blog_title}
                    </p>
                  )}
                </div>

                {/* Blog Image Upload */}
                <div className="w-full">
                  <Label className="mb-1 block text-slate-600">
                    Blog Image
                  </Label>
                  <label
                    htmlFor="blog_image"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`}
                    onDrop={handleImageDrop}
                    onDragOver={handleImageDragOver}
                  >
                    {blogImgPreview ? (
                      <div className="relative group w-full h-full flex items-center justify-center p-2">
                        <img
                          src={blogImgPreview.src || "/placeholder.svg"}
                          alt="Blog Preview"
                          className="max-w-full max-h-full object-contain border rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove image</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-xs text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                      </div>
                    )}
                    <input
                      id="blog_image"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFilesBlogImage(e.target.files)}
                      onBlur={formik.handleBlur}
                      name="blog_image"
                    />
                  </label>
                </div>

                {/* Blog Description */}
                <div>
                  <Label htmlFor="description"> Description </Label>
                  <ReactQuill
                    id="description"
                    name="description"
                    theme="snow"
                    value={formik.values.description}
                    onChange={(value) =>
                      formik.setFieldValue("description", value)
                    }
                    onBlur={formik.handleBlur}
                    modules={textEditormodule.modules}
                    className="w-full min-h-72"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit" disabled={formik.isSubmitting}>
                    {id ? "Update Blog" : "Add Blog"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AddBlogPage;
