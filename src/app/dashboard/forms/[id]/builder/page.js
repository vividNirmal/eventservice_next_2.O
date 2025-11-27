"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// import { FormBuilder } from "@/components/form-builder/form-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPut } from "@/lib/api";
import { generateId } from "@/lib/form-utils";
import { getRequest } from "@/service/viewService";
import { Textarea } from "@/components/ui/textarea";
import { FormBuilder } from "@/components/form-builder/form-builder";
import { PreviewConfirmationModal } from "@/components/form-builder/components/PreviewConfirmationModal";

/**
 * Form Builder Page Component
 */
export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id;

  const [form, setForm] = useState({
    id: formId,
    formName: "",
    userType: "",
    elements: [],
    pages: [],
    settings: {
      submitText: "Submit",
      confirmationMessage: "Thank you for your submission!",
      allowMultipleSubmissions: false,
      requireAuth: false,
    },
    isAdminForm: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  // const [originalForm, setOriginalForm] = useState(null);
  const [initialFormJson, setInitialFormJson] = useState(null);
  const [openPageModal, setOpenPageModal] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState("preview"); // "preview" or "exit"
  const [confirmationSaving, setConfirmationSaving] = useState(false);

  // Auto-save debounce timer
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  useEffect(() => {
    fetchForm();

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [formId]);

  const fetchForm = async () => {
    if (!formId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getRequest(`/forms/${formId}`);
      if (response.status === 1 && response.data) {
        const formData = response.data.form;

        // Ensure elements array exists and has proper structure
        const elements = formData.formFields || [];

        const newFormState = {
          id: formData._id,
          formName: formData.formName || "",
          userType: formData.userType || "",
          pages: formData.pages || [],
          elements: elements.map((element, index) => ({
            ...element,
            id: element.id || generateId(),
            position: index,
          })),
          settings: formData.settings || {
            submitText: "Submit",
            confirmationMessage: "Thank you for your submission!",
            allowMultipleSubmissions: false,
            requireAuth: false,
          },
          isAdminForm: formData.isAdminForm || false,
          createdAt: formData.createdAt,
          updatedAt: formData.updatedAt,
        };

        setForm(newFormState);
        // setOriginalForm(formData);
        setInitialFormJson(JSON.stringify(newFormState)); // Store initial JSON for comparison
      } else {
        console.log("❌ API Response error or no data:", response);
      }
    } catch (error) {
      console.error("🚨 Error fetching form:", error);
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialFormJson) return false;
    const currentFormJson = JSON.stringify(form);
    return currentFormJson !== initialFormJson;
  };

  const handleFormChange = (updatedForm) => {
    setForm(updatedForm);

    // Auto-save after 2 seconds of inactivity
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      autoSaveForm(updatedForm);
    }, 2000);

    setAutoSaveTimer(timer);
  };

  const autoSaveForm = async (formData) => {
    if (!formData.formName.trim() || (!formData.isAdminForm && !formData.userType)) {
      return; // Don't auto-save if required fields are missing
    }

    try {
      setAutoSaving(true);

      const payload = {
        formName: formData.formName,
        ...(formData.isAdminForm ? {} : { userType: formData.userType }), // Conditionally include userType
        formFields: formData.elements,
        settings: formData.settings,
      };

      // await apiPut(`/forms/${formId}`, payload);

      setForm((prev) => ({
        ...prev,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    if (!form.formName.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    if (!form.isAdminForm && !form.userType) {
      toast.error("Please select a user type");
      return;
    }

    try {
      setSaving(true);

      // Prepare the form data for API
      const formData = {
        formName: form.formName,
        isAdminForm: form.isAdminForm,
        ...(form.isAdminForm ? {} : { userType: form.userType }), // Conditionally include userType
        pages: form.pages,
        settings: form.settings,
      };

      const response = await apiPut(`/forms/${formId}`, formData);

      if (response.status === 1) {
        toast.success("Form saved successfully");
        const updatedForm = {
          ...form,
          updatedAt: new Date().toISOString(),
        };
        setForm(updatedForm);
        // Update initial JSON after successful save
        setInitialFormJson(JSON.stringify(updatedForm));
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async (mode) => {
    if (!form.formName.trim()) {
      toast.error("Please enter a form title");
      return;
    }

    if (!form.isAdminForm && !form.userType) {
      toast.error("Please select a user type");
      return;
    }

    try {
      setConfirmationSaving(true);

      const formData = {
        formName: form.formName,
        isAdminForm: form.isAdminForm,
        ...(form.isAdminForm ? {} : { userType: form.userType }),
        pages: form.pages,
        settings: form.settings,
      };

      const response = await apiPut(`/forms/${formId}`, formData);

      if (response.status === 1) {
        toast.success("Form saved successfully");
        const updatedForm = {
          ...form,
          updatedAt: new Date().toISOString(),
        };
        // Update initial JSON after successful save
        setInitialFormJson(JSON.stringify(updatedForm));
        setShowConfirmationModal(false);
        
        // Continue with the action
        if (mode === "preview") {
          router.push("preview");
        } else if (mode === "exit") {
          router.back();
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setConfirmationSaving(false);
    }
  };

  const handlePreview = () => {
    if (hasUnsavedChanges()) {
      setConfirmationMode("preview");
      setShowConfirmationModal(true);
    } else {
      router.push("preview");
    }
  };

  const handleGoBack = () => {
    if (hasUnsavedChanges()) {
      setConfirmationMode("exit");
      setShowConfirmationModal(true);
    } else {
      router.back();
    }
  };

  const handleCreatePage = async () => {
    if (!pageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }
    try {
      const response = await apiPut(`/forms/add-page/${formId}`, {
        pageName: pageName,
        description: pageDescription,
      });
      if (response.status === 1) {
        toast.success("Page created successfully");
        setOpenPageModal(false);
        setPageName("");
        setPageDescription("");
      }
    } catch (error) {
      console.error("🚨 Error creating page:", error);
    }
  };

  if (loading) {
    // console.log("⏳ Loading state is true, showing loading screen");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 2xl:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className={
                "!p-2 size-9 bg-gray-50 border border-solid border-gray-200 group hover:border-blue-500 hover:bg-blue-500 transition-all duration-200 ease-in"
              }
            >
              <ArrowLeft className="size-full text-gray-600 group-hover:text-white transition-all duration-200 ease-in" />
              {/* Back to Forms */}
            </Button>
            <div className="pl-3 border-l border-solid border-gray-300 text-sm text-gray-600 flex items-center gap-3">
              {/* <h1 className="text-base 2xl:text-lg font-semibold text-gray-900">Form Builder</h1> */}
              <span>{form.formName || "New Form"}</span>
              {hasUnsavedChanges() && (
                <span className="text-orange-600 text-xs">
                  • Unsaved changes
                </span>
              )}
              {/* {autoSaving && (
                <span className="ml-2 text-blue-600 text-xs">
                  • Auto-saving...
                </span>
              )} */}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* <FormPreview
              form={form}
              trigger={
              }
            /> */}
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Form"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      {/* <div className="px-4 py-4 bg-white border-b border-gray-200">
        <Card className="gap-0 xl:gap-3 2xl:p-5">
          <CardHeader className={'px-0'}>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className='md:col-span-3'>
                <Label htmlFor="formName">Form Name</Label>
                <Input id="formName" className="h-10 2xl:h-11" value={form.formName} onChange={(e) => handleFormSettingsChange('formName', e.target.value)} placeholder="Enter form name" />
              </div>
              <div>
                <Label htmlFor="userType">User Type</Label>
                <Select value={form.userType} onValueChange={(value) => handleFormSettingsChange('userType', value)}>
                  <SelectTrigger className="w-full h-10 2xl:h-11">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Form Builder */}
      <div className="flex-1 h-20 grow flex flex-col">
        <FormBuilder 
          form={form} 
          onFormChange={handleFormChange}
        />
      </div>

      <Dialog open={openPageModal} onOpenChange={setOpenPageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="Enter page name"
              />
            </div>

            <div>
              <Label htmlFor="pageDescription">Description</Label>
              <Textarea
                id="pageDescription"
                value={pageDescription}
                onChange={(e) => setPageDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenPageModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePage}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Confirmation Modal */}
      <PreviewConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onContinueWithoutSave={() => {
          setShowConfirmationModal(false);
          if (confirmationMode === "preview") {
            router.push("preview");
          } else {
            router.back();
          }
        }}
        onContinueWithSave={() => handleSaveAndContinue(confirmationMode)}
        isSaving={confirmationSaving}
        mode={confirmationMode}
      />
    </div>
  );
}

