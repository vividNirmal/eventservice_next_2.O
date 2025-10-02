"use client";
import * as React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Upload, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { getRequest, postRequest } from "@/service/viewService";
import { useRouter } from "next/navigation";
import Loader1 from "@/components/common/Loader";

// Validation schema
const validationSchema = Yup.object({
  company_name: Yup.string().required("Company Name is required"),
  event_slug: Yup.string().required("Event Slug is required"),
  event_description: Yup.string().required("Event Description is required"),
  dateRanges: Yup.array()
    .of(
      Yup.object({
        start_date: Yup.string().required("Start date is required"),
        end_date: Yup.string().required("End date is required"),
      })
    )
    .min(1, "At least one date range is required"),
  google_map_url: Yup.string().url("Must be a valid URL"),
  address: Yup.string().required("Address is required"),
  event_type: Yup.string().required("Event Type is required"),
  organizer_name: Yup.string().required("Organizer Name is required"),
  organizer_email: Yup.string()
    .email("Invalid email")
    .required("Organizer Email is required"),
  organizer_phone: Yup.string().required("Organizer Phone is required"),
});

const eventTypes = [
  "Conference",
  "Seminar",
  "Workshop",
  "Product Launch",
  "Charity Gala",
  "Webinar",
  "Networking Event",
  "Other",
];

export default function AddEvents({ id }) {
  const [faceScannerEnabled, setFaceScannerEnabled] = React.useState(false);
  const [imagePreviews, setImagePreviews] = React.useState(null);
  const [evenLogoPreviews, setEvenLogoPreviews] = React.useState(null);
  const [evenMapPreviews, setEvenMapPreviews] = React.useState(null);
  const [evenSponsorPreviews, setEvenSponsorPreviews] = React.useState(null);
  const [pageLoader,setPageLoader] =React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (id) {
      setPageLoader(true);
      const getEventDetails = async () => {
        const res = await getRequest(`get-event-details/${id}`);
        if (res?.error) {
          toast.error(res?.message);
          return;
        } else {
          const eventData = res?.data.user;
          formik.setValues({
            company_name: eventData?.company_name,
            event_slug: eventData?.event_slug,
            event_description: eventData?.event_description,
            
            google_map_url: eventData?.google_map_url,
            event_type: eventData?.event_type,
            organizer_name: eventData?.organizer_name,
            organizer_email: eventData?.organizer_email,
            organizer_phone: eventData?.organizer_phone,
            with_face_scanner: eventData?.with_face_scanner,
          });
          if (eventData.end_date && eventData.start_date) {
            const data = {
              start_date: eventData.start_date,
              end_date: eventData.end_date,
            };
            const result = data.start_date.map((start, i) => ({
              start_date: start,
              end_date: data.end_date[i],
            }));
            formik.setFieldValue("dateRanges", result || []);            
          }
          setFaceScannerEnabled(eventData?.with_face_scanner);
          setImagePreviews({src : eventData?.event_image,isNew: false,});
          setEvenLogoPreviews({src : eventData?.event_logo, isNew: false,});
          setEvenMapPreviews({src : eventData?.show_location_image, isNew: false, });
          setEvenSponsorPreviews({src : eventData?.event_sponsor, isNew: false, });
          setPageLoader(false);
        }
      };
      getEventDetails();
    }
  }, [id]);

  const formik = useFormik({
    initialValues: {
      company_name: "",
      event_title: "",
      event_slug: "",
      event_description: "",
      dateRanges: [{ start_date: "", end_date: "" }],
      google_map_url: "",
      address: "",
      event_type: "",
      event_image: null,
      event_logo: null,
      show_location_image: null,
      event_sponsor: null,
      organizer_name: "",
      organizer_email: "",
      organizer_phone: "",
      with_face_scanner: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        // Append all form fields
        Object.keys(values).forEach((key) => {
          if (key === "dateRanges") {
            const startDates = values[key].map((item) => item.start_date);
            const endDates = values[key].map((item) => item.end_date);
            startDates.forEach((element) => {
              formData.append("start_date[]", element);
            });
            endDates.forEach((element) => {
              formData.append("end_date[]", element);
            });
          } else if (key === "with_face_scanner") {
            formData.append(key, faceScannerEnabled.toString() ? 1 : 0);
          } else if (values[key] instanceof File) {
            formData.append(key, values[key]);
          } else if (values[key] !== null && values[key] !== "") {
            formData.append(key, values[key]);
          }
        });

        if (id) {
          formData.append("event_id", id);
          const res = await postRequest("update-event-details", formData);
          if (res?.status == 1) {
            router.push("/dashboard/events-list");
            toast.success( "List Update Successfull");
          } else {
            toast.error( "Get Error");
            return;
          }
        } else {
          const responce = await postRequest("save-event-details", formData);
          if (responce?.status == 1) {
            router.push("/dashboard/events-list");
            toast.success(responce?.message);
          } else {
            toast.error(responce?.message);
            return;
          }
        }        
      } catch (error) {
        console.error("Failed to create event:", error);
        toast.error("Failed to create event.");
      }
    },
  });
  //   Event Banner

  const handleFiles = React.useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setImagePreviews(null); // Clear existing preview
      formik.setFieldValue("event_image", null); // Clear existing file from formik

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("event_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDrop = React.useCallback(
    (event) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemoveImage = React.useCallback(() => {
    setImagePreviews(null); // Clear the preview
    formik.setFieldValue("event_image", null); // Clear the file from formik values
  }, [formik]);

  //   Event Logo
  const handleFilesEventLogo = React.useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setEvenLogoPreviews(null); // Clear existing preview
      formik.setFieldValue("event_logo", null); // Clear existing file from formik

      const reader = new FileReader();
      reader.onloadend = () => {
        setEvenLogoPreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("event_logo", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDropEvenLogo = React.useCallback(
    (event) => {
      event.preventDefault();
      handleFilesEventLogo(event.dataTransfer.files);
    },
    [handleFilesEventLogo]
  );

  const handleRemoveImageEventLogo = React.useCallback(() => {
    setEvenLogoPreviews(null); // Clear the preview
    formik.setFieldValue("event_logo", null); // Clear the file from formik values
  }, [formik]);

  //   event map
  const handleFilesEventMap = React.useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setEvenMapPreviews(null); // Clear existing preview
      formik.setFieldValue("show_location_image", null); // Clear existing file from formik

      const reader = new FileReader();
      reader.onloadend = () => {
        setEvenMapPreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("show_location_image", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDropEvenMap = React.useCallback(
    (event) => {
      event.preventDefault();
      handleFilesEventMap(event.dataTransfer.files);
    },
    [handleFilesEventMap]
  );

  const handleRemoveImageEventMap = React.useCallback(() => {
    setEvenMapPreviews(null); // Clear the preview
    formik.setFieldValue("show_location_image", null); // Clear the file from formik values
  }, [formik]);

  // Event Sponsor

  const handleFilesEventsponsor = React.useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      setEvenSponsorPreviews(null); // Clear existing preview
      formik.setFieldValue("event_sponsor", null); // Clear existing file from formik

      const reader = new FileReader();
      reader.onloadend = () => {
        setEvenSponsorPreviews({ src: reader.result, isNew: true, file });
        formik.setFieldValue("event_sponsor", file);
      };
      reader.readAsDataURL(file);
    },
    [formik]
  );

  const handleImageDropEvenSponsor = React.useCallback(
    (event) => {
      event.preventDefault();
      handleFilesEventsponsor(event.dataTransfer.files);
    },
    [handleFilesEventsponsor]
  );

  const handleRemoveImageEventsponsor = React.useCallback(() => {
    setEvenSponsorPreviews(null); // Clear the preview
    formik.setFieldValue("event_sponsor", null); // Clear the file from formik values
  }, [formik]);

  const handleImageDragOver = React.useCallback((event) => {
    event.preventDefault();
  }, []);

  const addDateRange = () => {
    const newDateRanges = [
      ...formik.values.dateRanges,
      { start_date: "", end_date: "" },
    ];
    formik.setFieldValue("dateRanges", newDateRanges);
  };

  const removeDateRange = (index) => {
    if (formik.values.dateRanges.length > 1) {
      const newDateRanges = formik.values.dateRanges.filter(
        (_, i) => i !== index
      );
      formik.setFieldValue("dateRanges", newDateRanges);
    }
  };
  const toggleFaceScanner = () => {
    setFaceScannerEnabled(!faceScannerEnabled);
    formik.setFieldValue("with_face_scanner", !faceScannerEnabled);
  };

  // Auto-generate slug from title
  // React.useEffect(() => {
  //   if (formik.values.event_title && !formik.touched.event_slug) {
  //     const slug = formik.values.event_title
  //       .toLowerCase()
  //       .replace(/[^a-z0-9]+/g, "-")
  //       .replace(/(^-|-$)/g, "");
  //     formik.setFieldValue("event_slug", slug);
  //   }
  // }, [formik.values.event_title]);

  React.useEffect(() => {
    if (formik.values.event_title && !formik.touched.event_slug) {
      let slug = formik.values.event_title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Remove hyphens and make sure the slug is 20 characters
      slug = slug.replace(/-/g, "");

      if (slug.length >= 20) {
        slug = slug.slice(0, 20);
      } else {
        slug = slug.padEnd(20, "0"); // Pad with zeros if less than 20 chars
      }

      formik.setFieldValue("event_slug", slug);
    }
  }, [formik.values.event_title]);

  return (
    <div className="bg-white rounded-2xl shadow-xl px-8 py-5 relative">
      <div>
        <h1 className="text-xl font-bold mb-4">Add New Event</h1>
      </div>
      {
        !pageLoader ? (
      <form onSubmit={formik.handleSubmit}>
        {/* Company Name, Show Title, Event Slug */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex flex-col">
            <label htmlFor="company_name" className="mb-1 2xl:text-sm font-medium text-gray-700">Company Name</label>
            <div className="w-full relative">
              <Input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="Company Name"
                value={formik.values.company_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
                  formik.touched.company_name && formik.errors.company_name
                    ? "border-red-500"
                    : ""
                }`}
              />
              {formik.touched.company_name && formik.errors.company_name && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.company_name}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="event_title"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Show Title
            </label>
            <div className="w-full relative">
              <Input
                id="event_title"
                name="event_title"
                type="text"
                placeholder="Show Title"
                value={formik.values.event_title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
                  formik.touched.event_title && formik.errors.event_title
                    ? "border-red-500"
                    : ""
                }`}
              />
              {formik.touched.event_title && formik.errors.event_title && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.event_title}
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="event_slug"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Event Slug
            </label>
            <div className="w-full relative">
              <Input
                id="event_slug"
                name="event_slug"
                type="text"
                placeholder="Event Slug"
                value={formik.values.event_slug}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
                  formik.touched.event_slug && formik.errors.event_slug
                    ? "border-red-500"
                    : ""
                }`}
              />
              {formik.touched.event_slug && formik.errors.event_slug && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.event_slug}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="event_description"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Event Description
            </label>
            <textarea
              name="event_description"
              id="event_description"
              placeholder="Event Description"
              rows={4}
              value={formik.values.event_description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y border-gray-300 ${
                formik.touched.event_description &&
                formik.errors.event_description
                  ? "border-red-500"
                  : ""
              }`}
            />
            {formik.touched.event_description &&
              formik.errors.event_description && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.event_description}
                </p>
              )}
          </div>
        </div>

        {/* Date Ranges */}
        <div className="flex flex-col gap-4 mb-4 w-full">
          {formik.values.dateRanges.map((dateRange, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-2 md:gap-4 items-end p-3 rounded-lg shadow-sm w-full bg-white"
            >
              <div className="w-full md:w-1/2 flex flex-col">
                <label
                  htmlFor={`start_date.${index}`}
                  className="mb-1 2xl:text-sm font-medium text-gray-700"
                >
                  Start Date & Time
                </label>
                <div className="w-full relative">
                  <Input
                    id={`start_date.${index}`}
                    name={`dateRanges.${index}.start_date`}
                    type="datetime-local"
                    placeholder="Event Start Date and Time"
                    value={dateRange.start_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
                      formik.touched.dateRanges?.[index]?.start_date &&
                      formik.errors.dateRanges?.[index]?.start_date
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.dateRanges?.[index]?.start_date &&
                    formik.errors.dateRanges?.[index]?.start_date && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.dateRanges[index].start_date}
                      </p>
                    )}
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col">
                <label
                  htmlFor={`end_date.${index}`}
                  className="mb-1 2xl:text-sm font-medium text-gray-700"
                >
                  End Date & Time
                </label>
                <div className="w-full relative">
                  <Input
                    id={`end_date.${index}`}
                    name={`dateRanges.${index}.end_date`}
                    type="datetime-local"
                    placeholder="Event End Date and Time"
                    value={dateRange.end_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${
                      formik.touched.dateRanges?.[index]?.end_date &&
                      formik.errors.dateRanges?.[index]?.end_date
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {formik.touched.dateRanges?.[index]?.end_date &&
                    formik.errors.dateRanges?.[index]?.end_date && (
                      <p className="text-sm text-red-500 mt-1">
                        {formik.errors.dateRanges[index].end_date}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex flex-row gap-2 mt-2 md:mt-0">
                {index === formik.values.dateRanges.length - 1 && (
                  <button
                    type="button"
                    onClick={addDateRange}
                    className="text-blue-600 hover:text-blue-800"
                    title="Add more date range"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
                {formik.values.dateRanges.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDateRange(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove date range"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          {formik.touched.dateRanges &&
            typeof formik.errors.dateRanges === "string" && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.dateRanges}
              </p>
            )}
        </div>

        {/* Location, Address, Event Type */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="google_map_url"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Location Google Map URL
            </label>
            <input
              id="google_map_url"
              name="google_map_url"
              placeholder="Google Map URL"
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border-gray-300 ${
                formik.touched.google_map_url && formik.errors.google_map_url
                  ? "border-red-500"
                  : ""
              }`}
              type="url"
              value={formik.values.google_map_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.google_map_url && formik.errors.google_map_url && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.google_map_url}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="address"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              id="address"
              name="address"
              placeholder="Event Address"
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border-gray-300 ${
                formik.touched.address && formik.errors.address
                  ? "border-red-500"
                  : ""
              }`}
              type="text"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.address}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="event_type"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Event Type
            </label>
            <select
              name="event_type"
              id="event_type"
              value={formik.values.event_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${
                formik.touched.event_type && formik.errors.event_type
                  ? "border-red-500"
                  : ""
              }`}
            >
              <option value="">Select Event Type</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {formik.touched.event_type && formik.errors.event_type && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.event_type}
              </p>
            )}
          </div>
        </div>

        {/* File Uploads Row 1 */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-[45%] flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Event Banner
              </span>
            </div>
            <label
              htmlFor="event_image"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.images && formik.errors.images
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDrop}
              onDragOver={handleImageDragOver}
            >
              {imagePreviews ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={imagePreviews.src || "/placeholder.svg"}
                    alt={`Banner Preview`}
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="event_image"
                type="file"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                onBlur={formik.handleBlur}
                name="event_image"
              />
            </label>
            {formik.touched.event_image && formik.errors.event_image && (
              <div className="text-red-500 text-xs mt-1">
                {typeof formik.errors.event_image === "string"
                  ? formik.errors.event_image
                  : "Invalid image file."}
              </div>
            )}
          </div>
          <div className="w-[45%] flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Event Logo
              </span>
            </div>
            <label
              htmlFor="event_logo"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.event_logo && formik.errors.event_logo
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDropEvenLogo}
              onDragOver={handleImageDragOver}
            >
              {evenLogoPreviews ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={evenLogoPreviews.src || "/placeholder.svg"}
                    alt={`Banner Preview`}
                    className="max-w-full max-h-full object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImageEventLogo}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="event_logo"
                type="file"
                className="hidden"
                onChange={(e) => handleFilesEventLogo(e.target.files)}
                onBlur={formik.handleBlur}
                name="event_logo"
              />
            </label>
            {formik.touched.event_logo && formik.errors.event_logo && (
              <div className="text-red-500 text-xs mt-1">
                {typeof formik.errors.event_logo === "string"
                  ? formik.errors.event_logo
                  : "Invalid image file."}
              </div>
            )}
          </div>
        </div>

        {/* File Uploads Row 2 */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-[45%] flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Event Map
              </span>
            </div>
            <label
              htmlFor="show_location_image"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.show_location_image &&
                formik.errors.show_location_image
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDropEvenMap}
              onDragOver={handleImageDragOver}
            >
              {evenMapPreviews ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={evenMapPreviews.src || "/placeholder.svg"}
                    alt={`Banner Preview`}
                    className="max-w-full max-h-full object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImageEventMap}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="show_location_image"
                type="file"
                className="hidden"
                onChange={(e) => handleFilesEventMap(e.target.files)}
                onBlur={formik.handleBlur}
                name="show_location_image"
              />
            </label>
            {formik.touched.show_location_image &&
              formik.errors.show_location_image && (
                <div className="text-red-500 text-xs mt-1">
                  {typeof formik.errors.show_location_image === "string"
                    ? formik.errors.show_location_image
                    : "Invalid image file."}
                </div>
              )}
          </div>
          <div className="w-[45%] flex-grow">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs 2xl:text-base font-normal text-slate-500 w-full block mb-1">
                Event Sponsor
              </span>
            </div>
            <label
              htmlFor="event_sponsor"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                formik.touched.event_sponsor && formik.errors.event_sponsor
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              onDrop={handleImageDropEvenSponsor}
              onDragOver={handleImageDragOver}
            >
              {evenSponsorPreviews ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={evenSponsorPreviews.src || "/placeholder.svg"}
                    alt={`Banner Preview`}
                    className="max-w-full max-h-full object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImageEventsponsor}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="event_sponsor"
                type="file"
                className="hidden"
                onChange={(e) => handleFilesEventsponsor(e.target.files)}
                onBlur={formik.handleBlur}
                name="event_sponsor"
              />
            </label>
            {formik.touched.event_sponsor && formik.errors.event_sponsor && (
              <div className="text-red-500 text-xs mt-1">
                {typeof formik.errors.event_sponsor === "string"
                  ? formik.errors.event_sponsor
                  : "Invalid image file."}
              </div>
            )}
          </div>
        </div>

        {/* Organizer Details */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="organizer_name"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Organizer Name
            </label>
            <input
              id="organizer_name"
              name="organizer_name"
              placeholder="Organizer Name"
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border-gray-300 ${
                formik.touched.organizer_name && formik.errors.organizer_name
                  ? "border-red-500"
                  : ""
              }`}
              type="text"
              value={formik.values.organizer_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.organizer_name && formik.errors.organizer_name && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.organizer_name}
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="organizer_email"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Organizer Email
            </label>
            <input
              id="organizer_email"
              name="organizer_email"
              placeholder="Organizer Email"
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border-gray-300 ${
                formik.touched.organizer_email && formik.errors.organizer_email
                  ? "border-red-500"
                  : ""
              }`}
              type="email"
              value={formik.values.organizer_email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.organizer_email &&
              formik.errors.organizer_email && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.organizer_email}
                </p>
              )}
          </div>

          <div className="flex-1 flex flex-col">
            <label
              htmlFor="organizer_phone"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              Organizer Phone
            </label>
            <input
              id="organizer_phone"
              name="organizer_phone"
              placeholder="Organizer Phone"
              className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full border-gray-300 ${
                formik.touched.organizer_phone && formik.errors.organizer_phone
                  ? "border-red-500"
                  : ""
              }`}
              type="text"
              value={formik.values.organizer_phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.organizer_phone &&
              formik.errors.organizer_phone && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.organizer_phone}
                </p>
              )}
          </div>
        </div>

        {/* Face Scanner Toggle */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="with_face_scanner"
              className="mb-1 2xl:text-sm font-medium text-gray-700"
            >
              With Face Scanner
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleFaceScanner}
                className={`relative inline-flex h-6 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-200 focus:outline-none ${
                  faceScannerEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
                aria-pressed={faceScannerEnabled}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                    faceScannerEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {faceScannerEnabled ? "On" : "Off"}
              </span>
            </div>
          </div>
          <div className="flex-1 flex flex-col"></div>
          <div className="flex-1 flex flex-col"></div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
          >
            {formik.isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>

        ):(
          <Loader2 className="h-10 w-10 mx-auto animate-spin" />
        )
      }
    </div>
  );
}
