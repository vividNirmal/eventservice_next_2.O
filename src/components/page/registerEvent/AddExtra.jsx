"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "@/styles/quill.css";

// Dynamically import ReactQuill to ensure it's client-side only
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
});

const initialFormData = {
  reason_for_visiting: [""],
  company_activity: [""],
  sort_des_about_event: "",
  getting_show_location: "",
};

export default function AddExtra({ isOpen, onClose, onSubmit, eventData = null, loading = false,fetchEvents }) {
  const [formData, setFormData] = useState(initialFormData);
  const [fetching, setFetching] = useState(false);

  

  const [errors, setErrors] = useState({});

 useEffect(() => {
  setFormData({
    reason_for_visiting: eventData?.visitReason?.length
      ? eventData.visitReason.map(r => r.reason)
      : [""],
    company_activity: eventData?.company_visit?.length
      ? eventData.company_visit.map(c => c.company_activity)
      : [""],
    sort_des_about_event: eventData?.sort_des_about_event || "",
    getting_show_location: eventData?.getting_show_location || "",
  });
  setErrors({});
}, [eventData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.reason_for_visiting.some(val => val.trim())) {
      newErrors.reason_for_visiting = "Reasons for Visiting is required";
    }
    if (!formData.company_activity.some(val => val.trim())) {
      newErrors.company_activity = "Company Main Activity is required";
    }
    if (!formData.sort_des_about_event.trim()) {
      newErrors.sort_des_about_event = "Site Visitor is required";
    }
    if (!formData.getting_show_location || formData.getting_show_location.replace(/<(.|\n)*?>/g, '').trim() === "") {
      newErrors.getting_show_location = "Getting To The Show is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        if (typeof loading === 'function') loading(true);

        const formdata = new FormData();

        formData.company_activity.forEach(val => {
          if (val) formdata.append("company_activity[]", val);
        });
        formData.reason_for_visiting.forEach(val => {
          if (val) formdata.append("reason_for_visiting[]", val);
        });

        formdata.append("sort_des_about_event", formData.sort_des_about_event);

        formdata.append("event_id", eventData?._id || "");

        // formdata.append("getting_show_location", formData.getting_show_location);

        const response = await postRequest("update-extra-event-details", formdata);

        if (response.status === 1) {
          toast.success("Success", { description: "Extra event details updated successfully" });
          onSubmit(response);
          fetchEvents();
        } else {
          setErrors({ api: response.message || 'Failed to update extra event details.' });
          toast.error("Error", { description: response.message || 'Failed to update extra event details.' });
        }
      } catch (error) {
        setErrors({ api: 'An unexpected error occurred.' });
        toast.error("Error", { description: 'An unexpected error occurred.' });
      } finally {
        if (typeof loading === 'function') loading(false);
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{"Update Event"}</SheetTitle>
        </SheetHeader>
        {fetching ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div className="space-y-2">
            <Label htmlFor="reason_for_visiting">Reasons for Visiting</Label>
            {formData.reason_for_visiting.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <Input
                  id={`reason_for_visiting_${idx}`}
                  placeholder="Enter reason for visiting"
                  value={val}
                  onChange={e => {
                    const updated = [...formData.reason_for_visiting];
                    updated[idx] = e.target.value;
                    handleInputChange("reason_for_visiting", updated);
                  }}
                />
                {formData.reason_for_visiting.length > 1 && (
                  <button
                    type="button"
                    className="p-2 text-red-500 hover:bg-red-100 rounded"
                    onClick={() => {
                      const updated = formData.reason_for_visiting.filter((_, i) => i !== idx);
                      handleInputChange("reason_for_visiting", updated);
                    }}
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                {idx === formData.reason_for_visiting.length - 1 && (
                  <button
                    type="button"
                    className="p-2 text-green-600 hover:bg-green-100 rounded"
                    onClick={() => handleInputChange("reason_for_visiting", [...formData.reason_for_visiting, ""])}
                    aria-label="Add"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            ))}
            {errors.reason_for_visiting && <p className="text-sm text-red-500">{errors.reason_for_visiting}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_activity">Company Main Activity</Label>
            {formData.company_activity.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <Input
                  id={`company_activity_${idx}`}
                  placeholder="Enter company activity"
                  value={val}
                  onChange={e => {
                    const updated = [...formData.company_activity];
                    updated[idx] = e.target.value;
                    handleInputChange("company_activity", updated);
                  }}
                />
                {formData.company_activity.length > 1 && (
                  <button
                    type="button"
                    className="p-2 text-red-500 hover:bg-red-100 rounded"
                    onClick={() => {
                      const updated = formData.company_activity.filter((_, i) => i !== idx);
                      handleInputChange("company_activity", updated);
                    }}
                    aria-label="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                {idx === formData.company_activity.length - 1 && (
                  <button
                    type="button"
                    className="p-2 text-green-600 hover:bg-green-100 rounded"
                    onClick={() => handleInputChange("company_activity", [...formData.company_activity, ""])}
                    aria-label="Add"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
            ))}
            {errors.company_activity && <p className="text-sm text-red-500">{errors.company_activity}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_des_about_event">Site Visitor</Label>
            <Input
              id="sort_des_about_event"
              placeholder="Enter site visitor"
              value={formData.sort_des_about_event}
              onChange={(e) => handleInputChange("sort_des_about_event", e.target.value)}
            />
            {errors.sort_des_about_event && <p className="text-sm text-red-500">{errors.sort_des_about_event}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="getting_show_location">Getting To The Show</Label>
            {/* <ReactQuill
              id="getting_show_location"
              theme="snow"
              value={formData.getting_show_location}
              onChange={(value) => handleInputChange("getting_show_location", value)}
              className="w-full min-h-[200px] flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
            /> */}

            <ReactQuill
                id="getting_show_location"
                name="getting_show_location"
                theme="snow"
                value={formData.getting_show_location}
                onChange={(value) => handleInputChange("getting_show_location", value)}
                // modules={textEditormodule.modules}
                className="w-full min-h-[200px] flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-xl [&>.ql-container.ql-snow]:rounded-b-xl [&>.ql-container.ql-snow]:flex-grow"
              />
            {errors.getting_show_location && (
              <p className="text-sm text-red-500">{errors.getting_show_location}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {/* <Button type="button" variant="secondary" onClick={() => {
              setFormData(initialFormData);
              setErrors({});
            }}>
              Clear
            </Button> */}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventData ? "Update Extra" : "Add Extra"}
            </Button>
          </div>
        </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
