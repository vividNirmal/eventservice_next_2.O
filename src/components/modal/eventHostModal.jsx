import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import EventDetailsForm from "@/components/common/EventDetailsForm";
import { cn } from "@/lib/utils";

// Validation schemas - moved outside as regular constants
const eventDetailsSchema = Yup.object()
  .shape({
    eventName: Yup.string().required("Event name is required"),
    eventShortName: Yup.string().required("Event short name is required"),
    eventTimeZone: Yup.string().required("Time zone is required"),
    dateRanges: Yup.array()
      .of(
        Yup.object().shape({
          startDate: Yup.string().required("Start date is required"),
          startTime: Yup.string().required("Start time is required"),
          endDate: Yup.string().required("End date is required"),
          endTime: Yup.string().required("End time is required"),
        }).test("end-after-start", "End must be after start", function (value) {
          const { startDate, startTime, endDate, endTime } = value;
          if (!startDate || !startTime || !endDate || !endTime) return true;

          const start = new Date(`${startDate}T${startTime}:00`);
          const end = new Date(`${endDate}T${endTime}:00`);

          return end > start;
        })
      )
      .min(1, "At least one date range is required")
      .required("Date ranges are required"),
    // Keep legacy fields for backward compatibility
    startDate: Yup.string(),
    startTime: Yup.string(),
    endDate: Yup.string(),
    endTime: Yup.string(),
  });

const locationSchema = Yup.object().shape({
  location: Yup.string().required("Location is required"),
});

const EventModal = ({
  isOpen,
  onClose,
  editMode = false,
  initialData = null,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState(
    editMode ? "in-person" : ""
  );
  const [selectedEventFormat, setSelectedEventFormat] = useState(
    editMode ? (initialData?.event_type || "Conference") : ""
  );
  const [selectedCategories, setSelectedCategories] = useState(
    editMode ? (initialData?.eventCategory || ["Career-Fair"]) : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [eventDetailsData, setEventDetailsData] = useState(null);
  const eventDetailsFormRef = useRef(null);

  // Debug log when eventDetailsData changes
  useEffect(() => {
    console.log("=== DEBUG: eventDetailsData state changed ===");
    console.log("New eventDetailsData:", eventDetailsData);
  }, [eventDetailsData]);

  // Event type options
  const eventTypes = [
    {
      id: "virtual",
      title: "Virtual Event",
      icon: <Video className="w-12 h-12 text-blue-500" />,
      description: "Online event with video conferencing",
    },
    {
      id: "hybrid",
      title: "Hybrid Event",
      icon: <Building2 className="w-12 h-12 text-purple-500" />,
      description: "Combined online and in-person event",
    },
    {
      id: "in-person",
      title: "In-Person Event",
      icon: <Users className="w-12 h-12 text-green-500" />,
      description: "Physical venue event",
    },
  ];

  // Event categories
  const eventCategories = ["Career-Fair", "Webinar"];

  // Event format options (for step 2)
  const eventFormats = [
    "Conference",
    "Seminar",
    "Workshop",
    "Product Launch",
    "Charity Gala",
    "Webinar",
    "Networking Event",
    "Other",
  ];

  // Form for event details
  const eventDetailsForm = useFormik({
    initialValues: {
      event_id: initialData?._id || initialData?.event_id || "",
      eventName: initialData?.eventName || "",
      eventShortName: initialData?.eventShortName || "",
      eventTimeZone: initialData?.eventTimeZone || "",
      startDate: initialData?.startDate || "",
      startTime: initialData?.startTime || "",
      endDate: initialData?.endDate || "",
      endTime: initialData?.endTime || "",
      eventType: initialData?.eventType || null,
      location: initialData?.location || "",
      eventCategory: initialData?.eventCategory || [],
      company_name: initialData?.company_name || "",
      event_slug: initialData?.event_slug || "",
      event_description: initialData?.event_description || "",
      google_map_url: initialData?.google_map_url || "",
      organizer_name: initialData?.organizer_name || "",
      organizer_email: initialData?.organizer_email || "",
      organizer_phone: initialData?.organizer_phone || "",
      with_face_scanner: initialData?.with_face_scanner || null,
      dateRanges: (() => {
        // If we have dateRanges array in initialData, use it
        if (initialData?.dateRanges && Array.isArray(initialData.dateRanges) && initialData.dateRanges.length > 0) {
          return initialData.dateRanges.map(range => ({
            startDate: range.startDate || "",
            startTime: range.startTime || "", 
            endDate: range.endDate || "",
            endTime: range.endTime || ""
          }));
        }
        // Fallback to legacy fields if available
        if (initialData?.startDate && initialData?.startTime && initialData?.endDate && initialData?.endTime) {
          return [{
            startDate: initialData.startDate,
            startTime: initialData.startTime,
            endDate: initialData.endDate,
            endTime: initialData.endTime
          }];
        }
        // Default empty range for new events
        return [{
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: ""
        }];
      })(),
      event_image: initialData?.event_image || null,
      event_logo: initialData?.event_logo || null,
      show_location_image: initialData?.show_location_image || null,
      event_sponsor: initialData?.event_sponsor || null,
      face_scanner_enabled: initialData?.with_face_scanner === 1 ? true : false,
    },
    validationSchema: eventDetailsSchema,
    onSubmit: (values) => {
      setCurrentStep(4);
    },
    enableReinitialize: true,
  });

  // Form for location
  const locationForm = useFormik({
    initialValues: {
      location: initialData?.location || "",
    },
    validationSchema: locationSchema,
    onSubmit: (values) => {
      setCurrentStep(5); // Move to event details step
    },
    enableReinitialize: true,
  });


  // Updated useEffect to always start from step 1:
  useEffect(() => {
    if (isOpen) {
      if (editMode) {
        // Start from step 1 even in edit mode
        setCurrentStep(1);
        setSelectedEventType(initialData?.eventType || 'in-person');
        setSelectedEventFormat(initialData?.event_type || 'Conference');
        setSelectedCategories(initialData?.eventCategory || ['Career-Fair']);
      } else {
        // Reset for add mode
        setCurrentStep(1);
        setSelectedEventType('');
        setSelectedEventFormat('');
        setSelectedCategories([]);
      }
      setError(null);
    } else {
      // Reset when closing
      setCurrentStep(1);
      setSelectedEventType('');
      setSelectedEventFormat('');
      setSelectedCategories([]);
      setError(null);
    }
  }, [isOpen, editMode, initialData]);

  const handleEventTypeSelect = (type) => {
    setSelectedEventType(type);
  };

  const handleEventFormatSelect = (format) => {
    setSelectedEventFormat(format);
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleNext = () => {
    console.log("=== DEBUG: handleNext called ===");
    console.log("Current step:", currentStep);
    console.log("Selected event type:", selectedEventType);
    console.log("Selected event format:", selectedEventFormat);
    console.log("Selected categories:", selectedCategories);
    console.log("Event details form valid:", eventDetailsForm.isValid);
    console.log("Location form valid:", locationForm.isValid);
    console.log("Event details data:", eventDetailsData);

    if (currentStep === 1 && selectedEventType) {
      console.log("Moving from step 1 to step 2");
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedEventFormat && selectedCategories.length > 0) {
      console.log("Moving from step 2 to step 3");
      setCurrentStep(3);
    } else if (currentStep === 3) {
      console.log("Submitting event details form (step 3)");
      eventDetailsForm.handleSubmit();
    } else if (currentStep === 4) {
      console.log("Submitting location form (step 4)");
      locationForm.handleSubmit();
    }
    // Step 5 is now handled by the EventDetailsForm's own submit button
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const handleEventDetailsSubmit = async (values, extraData) => {
    console.log("=== DEBUG: handleEventDetailsSubmit called ===");
    console.log("Event details values:", values);
    console.log("Event details extraData:", extraData);
    console.log("Values type:", typeof values);
    console.log("ExtraData type:", typeof extraData);

    if (!values) {
      console.error("ERROR: values is null/undefined");
      setError("Form values are missing");
      return;
    }

    try {
      // Pass the data directly to handleFinalSubmit instead of relying on state
      console.log("Calling handleFinalSubmit with values and extraData");
      await handleFinalSubmit(values, extraData);
    } catch (error) {
      console.error("Error in handleEventDetailsSubmit:", error);
      throw error;
    }
  };

  const handleFinalSubmit = async (eventDetailsValues = null, eventDetailsExtraData = null) => {
    console.log("=== DEBUG: handleFinalSubmit called ===");
    console.log("Parameters received:");
    console.log("eventDetailsValues:", eventDetailsValues);
    console.log("eventDetailsExtraData:", eventDetailsExtraData);
    console.log("Passed eventDetailsValues:", eventDetailsValues);
    console.log("Passed eventDetailsExtraData:", eventDetailsExtraData);
    console.log("Current eventDetailsData state:", eventDetailsData);
    console.log("Current eventDetailsForm values:", eventDetailsForm.values);
    console.log("Current locationForm values:", locationForm.values);
    console.log("Current selectedEventType:", selectedEventType);
    console.log("Current selectedCategories:", selectedCategories);

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");

      // Combine form data from all steps
      const formData = new FormData();

      console.log("=== DEBUG: Building FormData ===");

      // Add event host form fields
      if (editMode && eventDetailsForm.values.event_id) {
        formData.append("event_id", eventDetailsForm.values.event_id);
        console.log("Added event_id:", eventDetailsForm.values.event_id);
      }

      if (companyId != undefined) {
        formData.append("company_id", companyId);
      }

      formData.append("eventName", eventDetailsForm.values.eventName);
      formData.append("eventShortName", eventDetailsForm.values.eventShortName);
      formData.append("eventTimeZone", eventDetailsForm.values.eventTimeZone);
      // Send dateRanges only - backend will handle legacy field population
      if (eventDetailsForm.values.dateRanges && eventDetailsForm.values.dateRanges.length > 0) {
        formData.append("dateRanges", JSON.stringify(eventDetailsForm.values.dateRanges));
      }
      formData.append("event_type", selectedEventFormat);
      formData.append("eventType", selectedEventType);
      formData.append("location", locationForm.values.location);

      console.log("Basic event fields added to FormData");
      console.log("event_type (selectedEventFormat):", selectedEventFormat);
      console.log("eventType (selectedEventType):", selectedEventType);

      // Handle eventCategory as array
      selectedCategories.forEach((category) => {
        formData.append("eventCategory[]", category);
      });
      console.log("Event categories added:", selectedCategories);

      // Use passed parameters if available, otherwise use state
      console.log("=== DEBUG: Checking eventDetailsValues ===");
      console.log("eventDetailsValues:", eventDetailsValues);
      console.log("Is eventDetailsValues truthy?", !!eventDetailsValues);
      console.log("Type of eventDetailsValues:", typeof eventDetailsValues);
      console.log("eventDetailsExtraData:", eventDetailsExtraData);
      console.log("eventDetailsData state:", eventDetailsData);

      const currentEventDetailsData = eventDetailsValues ?
        { values: eventDetailsValues, extraData: eventDetailsExtraData } :
        eventDetailsData;

      console.log("Using event details data:", currentEventDetailsData);
      console.log("currentEventDetailsData is truthy?", !!currentEventDetailsData);
      console.log("currentEventDetailsData.values exists?", !!currentEventDetailsData?.values);

      // Add event details form data (now required)
      if (currentEventDetailsData && currentEventDetailsData.values) {
        console.log("=== DEBUG: Adding event details data ===");
        const { values, extraData } = currentEventDetailsData;

        console.log("Event details values to add:", values);
        console.log("Event details extraData to add:", extraData);

        // Add event details fields
        formData.append("company_name", values.company_name || "");
        formData.append("event_slug", values.event_slug || "");
        formData.append("event_description", values.event_description || "");
        formData.append("google_map_url", values.google_map_url || "");
        formData.append("organizer_name", values.organizer_name || "");
        formData.append("organizer_email", values.organizer_email || "");
        formData.append("organizer_phone", values.organizer_phone || "");
        formData.append("with_face_scanner", extraData?.faceScannerEnabled ? 1 : 0);

        // Handle date ranges
        if (values.dateRanges && values.dateRanges.length > 0) {
          const startDates = values.dateRanges.map((item) => item.start_date);
          const endDates = values.dateRanges.map((item) => item.end_date);
          startDates.forEach((element) => {
            formData.append("start_date[]", element);
          });
          endDates.forEach((element) => {
            formData.append("end_date[]", element);
          });
          console.log("Start dates added:", startDates);
          console.log("End dates added:", endDates);
        }

        // Handle file uploads
        if (values.event_image) {
          formData.append("event_image", values.event_image);
        }
        if (values.event_logo) {
          formData.append("event_logo", values.event_logo);
        }
        if (values.show_location_image) {
          formData.append("show_location_image", values.show_location_image);
        }
        if (values.event_sponsor) {
          formData.append("event_sponsor", values.event_sponsor);
        }
      } else {
        throw new Error("Additional Event Details are required");
      }

      console.log("=== DEBUG: Final FormData contents ===");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const endpoint = editMode ? "update-event-host" : "save-event-host";

      const response = await postRequest(`${endpoint}`, formData);

      if (response.status == 1) {
        toast.success(
          editMode
            ? "Event updated successfully!"
            : "Event created successfully!"
        );

        // Call success callback to refresh parent component
        if (onSuccess) {
          onSuccess();
        }

        // Reset forms
        eventDetailsForm.resetForm();
        locationForm.resetForm();
        setSelectedEventType("");
        setSelectedEventFormat("");
        setSelectedCategories([]);
        setEventDetailsData(null);

        // Close modal
        onClose();
      } else {
        throw new Error(
          response.message || `Failed to ${editMode ? "update" : "create"} event`
        );
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to create event. Please try again.");
      console.error(`Error ${editMode ? "updating" : "creating"} event:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl 2xl:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center">
            {editMode ? "Edit Event" : "Welcome, Your Event Journey Begins Now!"}
          </DialogTitle>
          {!editMode && currentStep === 1 && (
            <p className="text-center text-gray-600 mt-2">An amazing event starts with one click! Choose your event type and let's roll.</p>
          )}
        </DialogHeader>

        {/* Step Progress Indicator */}
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {[
                { number: 1, label: "Type" },
                { number: 2, label: "Format & Category" },
                { number: 3, label: "Details" },
                { number: 4, label: "Location" },
                { number: 5, label: "Extra Details" }
              ].map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step number and label in a single row */}
                  <div onClick={() => handleStepClick(step.number)} className={cn("flex items-center space-x-2 cursor-pointer transition-all", step.number <= currentStep ? 'text-blue-600' : 'text-gray-500 opacity-70')}>
                    <div className={cn("size-10 shrink-0 rounded-full flex items-center justify-center text-sm font-medium transition-all hover:shadow-md",step.number <= currentStep ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')}>{step.number}</div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>

                  {/* Connector line between steps */}
                  {index < 4 && (
                    <div className="flex-1 mx-3">
                      <div
                        className={`h-1 rounded-full transition-all ${step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          {/* Step 1: Event Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 min-h-90">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {eventTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleEventTypeSelect(type.id)}
                    className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${selectedEventType === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">{type.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Event Format and Category Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 min-h-90">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Event Format</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {eventFormats.map((format) => (
                      <div
                        key={format}
                        onClick={() => handleEventFormatSelect(format)}
                        className={`p-3 border rounded-lg cursor-pointer text-sm text-center transition-all ${selectedEventFormat === format
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                      >
                        {format}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedEventFormat && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select Event Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                      {eventCategories.map((category) => (
                        <div
                          key={category}
                          onClick={() => handleCategoryToggle(category)}
                          className={`p-3 border rounded-lg cursor-pointer text-sm text-center transition-all ${selectedCategories.includes(category)
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Event Details */}
          {currentStep === 3 && (
            <div className="space-y-4 min-h-90">
              <h3 className="text-lg font-semibold">
                Basic Details of Event
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName" className="text-sm font-medium">
                    Event Name *
                  </Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    value={eventDetailsForm.values.eventName}
                    onChange={eventDetailsForm.handleChange}
                    onBlur={eventDetailsForm.handleBlur}
                    placeholder="Enter event name"
                    className="mt-1"
                  />
                  {eventDetailsForm.touched.eventName &&
                    eventDetailsForm.errors.eventName && (
                      <p className="text-red-500 text-xs mt-1">
                        {eventDetailsForm.errors.eventName}
                      </p>
                    )}
                </div>

                <div>
                  <Label
                    htmlFor="eventShortName"
                    className="text-sm font-medium"
                  >
                    Event Short Name *
                  </Label>
                  <Input
                    id="eventShortName"
                    name="eventShortName"
                    value={eventDetailsForm.values.eventShortName}
                    onChange={eventDetailsForm.handleChange}
                    onBlur={eventDetailsForm.handleBlur}
                    placeholder="Enter short name"
                    className="mt-1"
                  />
                  {eventDetailsForm.touched.eventShortName &&
                    eventDetailsForm.errors.eventShortName && (
                      <p className="text-red-500 text-xs mt-1">
                        {eventDetailsForm.errors.eventShortName}
                      </p>
                    )}
                </div>

                <div>
                  <Label
                    htmlFor="eventTimeZone"
                    className="text-sm font-medium"
                  >
                    Event Time Zone *
                  </Label>
                  <Select
                    value={eventDetailsForm.values.eventTimeZone}
                    onValueChange={(value) =>
                      eventDetailsForm.setFieldValue("eventTimeZone", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">EST (Eastern)</SelectItem>
                      <SelectItem value="PST">PST (Pacific)</SelectItem>
                      <SelectItem value="CST">CST (Central)</SelectItem>
                      <SelectItem value="IST">IST (India)</SelectItem>
                      <SelectItem value="GMT">GMT (London)</SelectItem>
                      <SelectItem value="CET">CET (Central Europe)</SelectItem>
                      <SelectItem value="AEST">AEST (Sydney)</SelectItem>
                    </SelectContent>
                  </Select>
                  {eventDetailsForm.touched.eventTimeZone &&
                    eventDetailsForm.errors.eventTimeZone && (
                      <p className="text-red-500 text-xs mt-1">
                        {eventDetailsForm.errors.eventTimeZone}
                      </p>
                    )}
                </div>

                {/* Multiple Date Ranges */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Event Date & Time *
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentRanges = eventDetailsForm.values.dateRanges;
                        eventDetailsForm.setFieldValue("dateRanges", [
                          ...currentRanges,
                          {
                            startDate: "",
                            startTime: "",
                            endDate: "",
                            endTime: ""
                          }
                        ]);
                      }}
                      className="text-xs"
                    >
                      + Add Date Range
                    </Button>
                  </div>

                  {eventDetailsForm.values.dateRanges.map((range, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">
                          Date Range {index + 1}
                        </h4>
                        {eventDetailsForm.values.dateRanges.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const updatedRanges = eventDetailsForm.values.dateRanges.filter(
                                (_, i) => i !== index
                              );
                              eventDetailsForm.setFieldValue("dateRanges", updatedRanges);
                            }}
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-medium">
                            Start Date & Time
                          </Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="relative">
                              <Input
                                type="date"
                                value={range.startDate}
                                onChange={(e) => {
                                  const updatedRanges = [...eventDetailsForm.values.dateRanges];
                                  updatedRanges[index].startDate = e.target.value;
                                  eventDetailsForm.setFieldValue("dateRanges", updatedRanges);
                                }}
                                className="text-xs"
                              />
                            </div>
                            <div className="relative">
                              <Input
                                type="time"
                                value={range.startTime}
                                onChange={(e) => {
                                  const updatedRanges = [...eventDetailsForm.values.dateRanges];
                                  updatedRanges[index].startTime = e.target.value;
                                  eventDetailsForm.setFieldValue("dateRanges", updatedRanges);
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">
                            End Date & Time
                          </Label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="relative">
                              <Input
                                type="date"
                                value={range.endDate}
                                onChange={(e) => {
                                  const updatedRanges = [...eventDetailsForm.values.dateRanges];
                                  updatedRanges[index].endDate = e.target.value;
                                  eventDetailsForm.setFieldValue("dateRanges", updatedRanges);
                                }}
                                className="text-xs"
                              />
                            </div>
                            <div className="relative">
                              <Input
                                type="time"
                                value={range.endTime}
                                onChange={(e) => {
                                  const updatedRanges = [...eventDetailsForm.values.dateRanges];
                                  updatedRanges[index].endTime = e.target.value;
                                  eventDetailsForm.setFieldValue("dateRanges", updatedRanges);
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Show validation errors for this specific range */}
                      {eventDetailsForm.errors.dateRanges && 
                       eventDetailsForm.errors.dateRanges[index] && (
                        <div className="mt-2 text-xs text-red-500">
                          {typeof eventDetailsForm.errors.dateRanges[index] === 'string' ? 
                            eventDetailsForm.errors.dateRanges[index] : 
                            Object.values(eventDetailsForm.errors.dateRanges[index] || {}).join(', ')
                          }
                        </div>
                      )}
                    </div>
                  ))}

                  {/* General dateRanges validation errors */}
                  {eventDetailsForm.touched.dateRanges &&
                    eventDetailsForm.errors.dateRanges &&
                    typeof eventDetailsForm.errors.dateRanges === 'string' && (
                      <p className="text-red-500 text-xs">
                        {eventDetailsForm.errors.dateRanges}
                      </p>
                    )}
                </div>

                {/* Validation error for date range */}
                {eventDetailsForm.errors && eventDetailsForm.errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {eventDetailsForm.errors.endDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <div className="space-y-6 min-h-90">
              <h3 className="text-lg font-semibold">
                Location of Event
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location *
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="location"
                      name="location"
                      value={locationForm.values.location}
                      onChange={locationForm.handleChange}
                      onBlur={locationForm.handleBlur}
                      placeholder="Choose Location"
                      className="pl-10"
                    />
                    <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  {locationForm.touched.location &&
                    locationForm.errors.location && (
                      <p className="text-red-500 text-xs mt-1">
                        {locationForm.errors.location}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Additional Event Details Form (Required) */}
          {currentStep === 5 && (
            <div className="space-y-3 min-h-90">
              <h6 className="text-md font-semibold">
                Additional Event Details *
              </h6>
              <p className="text-sm text-gray-600">
                Please complete all required fields to create your event.
              </p>
              <EventDetailsForm
                onSubmit={handleEventDetailsSubmit}
                initialData={initialData}
                submitButtonText={editMode ? "Update Event" : "Create Event"}
                showSubmitButton={true}
                formRef={eventDetailsFormRef}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || submitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep !== 5 && (
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  submitting ||
                  (currentStep === 1 && !selectedEventType) ||
                  (currentStep === 2 && (!selectedEventFormat || selectedCategories.length === 0)) ||
                  (currentStep === 3 && !eventDetailsForm.isValid) ||
                  (currentStep === 4 && !locationForm.isValid)
                }
                className="flex items-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Next
                {!submitting && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
