"use client";
import * as React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CustomCombobox } from "./customcombox";

// Options for the new select fields
const EVENT_ENTRY_EXIT_DEVICES = [
  { id: 1, name: "Face Scan", value: "Face Scan" },
  { id: 2, name: "QR", value: "QR" },
  { id: 3, name: "Face Scanner + QR", value: "Face Scanner + QR" }
];

const INSTANT_REGISTER_OPTIONS = [
  { id: 1, name: "Basic Entry (Name & Mobile Entry)", value: "Basic Entry " },
  { id: 2, name: " Face Verify (Name, Mobile & Face Entry)", value: "Face Verify Entry " }
];

// Validation schema
const validationSchema = Yup.object({
  company_name: Yup.string().required("Company Name is required"),
  event_slug: Yup.string().required("Event Slug is required"),
  event_description: Yup.string().required("Event Description is required"),
  google_map_url: Yup.string().url("Must be a valid URL"),
  organizer_name: Yup.string().required("Organizer Name is required"),
  organizer_email: Yup.string()
    .email("Invalid email")
    .required("Organizer Email is required"),
  organizer_phone: Yup.string().required("Organizer Phone is required"),
  event_entry_exit_device: Yup.array().min(1, "Select at least one device"),
  instant_register: Yup.array().required("Instant Register option is required"),
});

export default function EventDetailsForm({
  onSubmit,
  initialData = null,
  submitButtonText = "Save Event",
  showSubmitButton = true,
  formRef = null,
}) {
  const [imagePreviews, setImagePreviews] = React.useState(null);
  const [evenLogoPreviews, setEvenLogoPreviews] = React.useState(null);
  const [evenMapPreviews, setEvenMapPreviews] = React.useState(null);
  const [evenSponsorPreviews, setEvenSponsorPreviews] = React.useState(null);

  const formik = useFormik({
    initialValues: {
      company_name: initialData?.company_name || "",
      event_slug: initialData?.event_slug || "",
      event_description: initialData?.event_description || "",
      google_map_url: initialData?.google_map_url || "",
      event_image: null,
      event_logo: null,
      show_location_image: null,
      event_sponsor: null,
      organizer_name: initialData?.organizer_name || "",
      organizer_email: initialData?.organizer_email || "",
      organizer_phone: initialData?.organizer_phone || "",
      event_entry_exit_device: initialData?.event_entry_exit_device || [],
      instant_register: initialData?.instant_register || [],
      with_face_scanner: initialData?.with_face_scanner || false,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Check if face scanner devices are selected
      const hasFaceScanner = values.event_entry_exit_device.some(
        device => device === "Face Scan" || device === "Face Scanner + QR"
      );

      // Prepare submit values with with_face_scanner flag
      const submitValues = {
        ...values,
        with_face_scanner: hasFaceScanner ? true : false
      };

      if (onSubmit) {
        try {
          await onSubmit(submitValues, {
            imagePreviews,
            evenLogoPreviews,
            evenMapPreviews,
            evenSponsorPreviews,
          });
        } catch (error) {
          console.error("Error in parent onSubmit:", error);
          throw error;
        }
      } else {
        console.log("onSubmit prop is not provided");
      }
    },
  });

  // Update with_face_scanner when event_entry_exit_device changes
  React.useEffect(() => {
    const hasFaceScanner = formik.values.event_entry_exit_device.some(
      device => device === "Face Scan" || device === "Face Scanner + QR"
    );
    formik.setFieldValue("with_face_scanner", hasFaceScanner ? true : false);
  }, [formik.values.event_entry_exit_device]);

  // Initialize image previews when initialData changes
  React.useEffect(() => {
    if (initialData) {
      // Initialize image previews from existing URLs
      if (initialData.event_image && initialData.event_image !== "") {
        setImagePreviews({ src: initialData.event_image, isNew: false });
      }

      if (initialData.event_logo && initialData.event_logo !== "") {
        setEvenLogoPreviews({ src: initialData.event_logo, isNew: false });
      }

      if (
        initialData.show_location_image &&
        initialData.show_location_image !== ""
      ) {
        setEvenMapPreviews({
          src: initialData.show_location_image,
          isNew: false,
        });
      }

      if (initialData.event_sponsor && initialData.event_sponsor !== "") {
        setEvenSponsorPreviews({
          src: initialData.event_sponsor,
          isNew: false,
        });
      }
    }
  }, [initialData]);

  // File handling functions
  const handleFiles = React.useCallback(
    (files, setPreview, fieldName) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setPreview(null);
      formik.setFieldValue(fieldName, null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview({ src: reader.result, isNew: true, file });
        formik.setFieldValue(fieldName, file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = React.useCallback(
    (event, setPreview, fieldName) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files, setPreview, fieldName);
    },
    [handleFiles]
  );

  // File upload component
  const FileUpload = ({
    fieldName,
    preview,
    setPreview,
    label,
    accept = "image/*",
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={(e) => handleImageDrop(e, setPreview, fieldName)}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById(fieldName).click()}
      >
        <input
          type="file"
          id={fieldName}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files, setPreview, fieldName)}
          className="hidden"
        />
        {preview ? (
          <div className="relative">
            <img
              src={preview.src}
              alt="Preview"
              className="max-w-full h-32 object-cover mx-auto rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-0 right-0 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setPreview(null);
                formik.setFieldValue(fieldName, null);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium">Click to upload</span> or drag and
              drop
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <form
        id="event-details-form"
        ref={formRef}
        onSubmit={formik.handleSubmit}
        className="space-y-6"
      >
        {/* Company Information */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              name="company_name"
              value={formik.values.company_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.company_name && formik.errors.company_name
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.company_name && formik.errors.company_name && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.company_name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="event_slug">Event Slug *</Label>
            <Input
              id="event_slug"
              name="event_slug"
              value={formik.values.event_slug}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.event_slug && formik.errors.event_slug
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.event_slug && formik.errors.event_slug && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.event_slug}
              </p>
            )}
          </div>
        </div>

        {/* Event Description and Google Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="event_description">Event Description *</Label>
            <textarea
              id="event_description"
              name="event_description"
              value={formik.values.event_description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                formik.touched.event_description &&
                formik.errors.event_description
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.touched.event_description &&
              formik.errors.event_description && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.event_description}
                </p>
              )}
          </div>

          <div>
            <Label htmlFor="google_map_url">Google Map URL</Label>
            <Input
              id="google_map_url"
              name="google_map_url"
              type="url"
              value={formik.values.google_map_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.google_map_url && formik.errors.google_map_url
                  ? "border-red-500"
                  : ""
              }
              placeholder="https://maps.google.com/..."
            />
            {formik.touched.google_map_url && formik.errors.google_map_url && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.google_map_url}
              </p>
            )}
          </div>
        </div>

        {/* Organizer Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="organizer_name">Organizer Name *</Label>
            <Input
              id="organizer_name"
              name="organizer_name"
              value={formik.values.organizer_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.organizer_name && formik.errors.organizer_name
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.organizer_name && formik.errors.organizer_name && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.organizer_name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="organizer_email">Organizer Email *</Label>
            <Input
              id="organizer_email"
              name="organizer_email"
              type="email"
              value={formik.values.organizer_email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.organizer_email && formik.errors.organizer_email
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.organizer_email &&
              formik.errors.organizer_email && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.organizer_email}
                </p>
              )}
          </div>

          <div>
            <Label htmlFor="organizer_phone">Organizer Phone *</Label>
            <Input
              id="organizer_phone"
              name="organizer_phone"
              type="tel"
              value={formik.values.organizer_phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={
                formik.touched.organizer_phone && formik.errors.organizer_phone
                  ? "border-red-500"
                  : ""
              }
            />
            {formik.touched.organizer_phone &&
              formik.errors.organizer_phone && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.organizer_phone}
                </p>
              )}
          </div>
        </div>

        {/* Event Entry/Exit Device and Instant Register */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="pl-1 block mb-1 text-sm md:text-base capitalize text-slate-500">
              Event Entry/Exit Device *
            </Label>
            <CustomCombobox
              name="event_entry_exit_device"
              value={formik.values.event_entry_exit_device || []}
              onChange={(value) => formik.setFieldValue("event_entry_exit_device", value)}
              valueKey="value"
              labelKey="name"
              multiSelect={true}
              options={EVENT_ENTRY_EXIT_DEVICES}
              placeholder="Select Entry/Exit Device(s)"
              className="ln-autocomplete"
              search={false}
            />
            {formik.touched.event_entry_exit_device && formik.errors.event_entry_exit_device && (
              <div className="text-xs text-red-500 mt-1">
                {formik.errors.event_entry_exit_device}
              </div>
            )}
          </div>

          <div>
            <Label className="pl-1 block mb-1 text-sm md:text-base capitalize text-slate-500">
              Instant Register *
            </Label>
            <CustomCombobox
              name="instant_register"
              value={formik.values.instant_register || ""}
              onChange={(value) => formik.setFieldValue("instant_register", value)}
              valueKey="value"
              labelKey="name"
              multiSelect={true}
              options={INSTANT_REGISTER_OPTIONS}
              placeholder="Select Instant Register Option"
              className="ln-autocomplete"
              search={false}
            />
            {formik.touched.instant_register && formik.errors.instant_register && (
              <div className="text-xs text-red-500 mt-1">
                {formik.errors.instant_register}
              </div>
            )}
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            fieldName="event_image"
            preview={imagePreviews}
            setPreview={setImagePreviews}
            label="Event Banner Image"
          />

          <FileUpload
            fieldName="event_logo"
            preview={evenLogoPreviews}
            setPreview={setEvenLogoPreviews}
            label="Event Logo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUpload
            fieldName="show_location_image"
            preview={evenMapPreviews}
            setPreview={setEvenMapPreviews}
            label="Location Image"
          />

          <FileUpload
            fieldName="event_sponsor"
            preview={evenSponsorPreviews}
            setPreview={setEvenSponsorPreviews}
            label="Event Sponsor Image"
          />
        </div>

        {/* Submit Button */}
        {showSubmitButton && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
              className="flex items-center gap-2 !scale-100"
            >
              {formik.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}