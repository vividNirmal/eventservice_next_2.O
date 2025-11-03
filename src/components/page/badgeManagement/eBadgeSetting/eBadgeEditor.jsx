"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { X, Trash2, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import QRCode from "qrcode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const availableFields = [
  { id: "first_name", name: "First Name", type: "text" },
  { id: "last_name", name: "Last Name", type: "text" },
  { id: "email", name: "Email", type: "email" },
  { id: "contact_no", name: "Contact Number", type: "tel" },
  { id: "company_name", name: "Company Name", type: "text" },
  { id: "qrCode", name: "QR Code", type: "qrcode" },
  { id: "date", name: "Select any date", type: "date" },
  { id: "badgeCategory", name: "Badge Category", type: "category" },
];

const defaultStyleSettings = {
  position: "left",
  marginLeft: "0mm",
  marginTop: "0mm",
  fontFamily: "Arial",
  fontSize: "12pt",
  fontColor: "#000",
  fontStyle: "normal",
  textFormat: "default",
  height: "20mm",
  width: "20mm",
  categoryId: null,
};
const renderField = async (field, props, selectedCategory, fixedPosition) => {
  // Skip rendering badge category field - it only applies colors
  if (field.type === "category") {
    return null;
  }

  const el = document.createElement("div");
  el.id = `field-${field.id}`;
  el.innerText = field.name;

  // Use absolute positioning when fixedPosition is enabled
  el.style.position = fixedPosition ? "absolute" : "relative";
  el.style.marginLeft = props.marginLeft;
  el.style.marginTop = props.marginTop;
  
  // When fixed position is enabled, use margins as absolute positioning
  if (fixedPosition) {
    el.style.left = props.marginLeft;
    el.style.top = props.marginTop;
    el.style.marginLeft = "0";
    el.style.marginTop = "0";
  }
  
  el.style.textAlign = props.position;
  el.style.fontFamily = props.fontFamily;
  el.style.fontSize = props.fontSize;
  el.style.color = selectedCategory?.textColor || props.fontColor;
  el.style.fontWeight = props.fontStyle === "bold" ? "bold" : "normal";
  el.style.textTransform =
    props.textFormat === "uppercase"
      ? "uppercase"
      : props.textFormat === "lowercase"
      ? "lowercase"
      : props.textFormat === "capitalize"
      ? "capitalize"
      : "none";

  if (field.type === "qrcode") {
    el.innerText = "";

    const qrWrapper = document.createElement("div");
    qrWrapper.style.display = "flex";
    qrWrapper.style.justifyContent =
      props.position === "left"
        ? "flex-start"
        : props.position === "center"
        ? "center"
        : "flex-end";
    
    // Don't apply margins to wrapper when using fixed position
    if (!fixedPosition) {
      qrWrapper.style.marginLeft = props.marginLeft;
      qrWrapper.style.marginTop = props.marginTop;
    }

    // ✅ Create an <img> to hold the QR code
    const qrImg = document.createElement("img");
    qrImg.style.width = props.width;
    qrImg.style.height = props.height;

    // ✅ Generate QR code as base64 image
    QRCode.toDataURL("Sample QR Data", { width: parseInt(props.width), margin: 1 })
      .then((url) => {
        qrImg.src = url;
      })
      .catch((err) => console.error("QR generation error:", err));

    qrWrapper.appendChild(qrImg);
    el.appendChild(qrWrapper);
  }

  return el;
};

const EBadgeEditor = ({ params }) => {
  const router = useRouter();
  const previewRef = useRef(null);
  const parsedValue = params?.value ? JSON.parse(params.value) : {};
  const settingId = parsedValue.id;

  const [eventId, setEventId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [badgeCategories, setBadgeCategories] = useState([]);
  const [fixedPosition, setFixedPosition] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fieldProperties, setFieldProperties] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [renderHtml, setRenderHtml] = useState("");

  // Multi-select state
  const [selectedForCombining, setSelectedForCombining] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get current field group
  const currentField = selectedFields.find(
    (f) => (f.combined_id || f.id) === selectedFieldId
  );

  // Find badge category and get selected category
  const badgeCategoryGroup = selectedFields.find((f) =>
    f.field?.some((field) => field.id === "badgeCategory")
  );
  const selectedCategoryId = badgeCategoryGroup
    ? fieldProperties[badgeCategoryGroup.combined_id || badgeCategoryGroup.id]
        ?.categoryId
    : null;
  const selectedCategory = badgeCategories.find(
    (cat) => cat._id === selectedCategoryId
  );

  const activeTemplate = templates.find((t) => t._id === selectedTemplate);

  // ─── Fetch Settings on Mount ────────────────────────────────
  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchTemplates();
      fetchBadgeCategories();
    }
  }, [eventId]);

  const fetchSettings = async () => {
    try {
      const res = await getRequest(`get-e-badge-setting-byId/${settingId}`);
      if (res.status === 1) {
        const data = res.data.setting;
        setEventId(data.eventId);
        setSelectedTemplate(data.templateId?._id || null);

        // Handle both old and new data structure
        let fields = data.fields || [];

        // Convert old structure to new if needed
        if (fields.length > 0 && !fields[0].field) {
          fields = fields.map((f) => ({
            id: f.id,
            field: [f],
          }));
        }

        setSelectedFields(fields);
        setFieldProperties(data.fieldProperties || {});
        
        // Load fixedPosition setting if available
        setFixedPosition(data.fixedPosition || false);
      } else {
        toast.error(res?.message || "Failed to fetch e-badge settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching settings");
    }
  };

  // const fetchTemplates = async () => {
  //   try {
  //     const res = await getRequest(`get-badge-template-by-eventid/${eventId}`);
  //     if (res.status === 1) {
  //       setTemplates(res.data.template || []);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const fetchTemplates = async () => {
    try {
      const res = await getRequest(`get-badge-template-by-eventid/${eventId}`);
      if (res.status === 1) {
        const templateList = res.data.template || [];
        setTemplates(templateList);

        // Auto-select first template if none selected
        if (templateList.length > 0 && !selectedTemplate) {
          setSelectedTemplate(templateList[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBadgeCategories = async () => {
    try {
      const res = await getRequest(`get-badge-category-by-eventId/${eventId}`);
      if (res.status === 1) {
        const sortedCategories = (res.data.categories || []).sort(
          (a, b) => a.priority - b.priority
        );
        setBadgeCategories(sortedCategories);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching badge categories");
    }
  };

  // ─── Handle checkbox selection in dropdown
  const handleCheckboxChange = (fieldId, checked) => {
    const field = availableFields.find((f) => f.id === fieldId);

    // If badge category is selected/deselected
    if (fieldId === "badgeCategory") {
      if (checked) {
        setSelectedForCombining(["badgeCategory"]);
      } else {
        setSelectedForCombining([]);
      }
      return;
    }

    // Normal selection logic
    if (checked) {
      setSelectedForCombining([...selectedForCombining, fieldId]);
    } else {
      setSelectedForCombining(
        selectedForCombining.filter((id) => id !== fieldId)
      );
    }
  };

  // Add fields (single or combined)
  const handleAddFields = () => {
    if (selectedForCombining.length === 0) {
      toast.error("Please select at least one field");
      return;
    }

    const fieldsToAdd = selectedForCombining
      .map((fieldId) => availableFields.find((f) => f.id === fieldId))
      .filter(Boolean);

    if (selectedForCombining.length === 1) {
      // Add as single field
      const field = fieldsToAdd[0];
      const newField = {
        id: field.id,
        field: [field],
      };

      setSelectedFields([...selectedFields, newField]);
      setFieldProperties({
        ...fieldProperties,
        [field.id]: { ...defaultStyleSettings },
      });
      setSelectedFieldId(field.id);
    } else {
      // Add as combined fields
      const combined_id = `combined_${Date.now()}`;
      const newCombinedGroup = {
        combined_id,
        field: fieldsToAdd,
      };

      setSelectedFields([...selectedFields, newCombinedGroup]);
      setFieldProperties({
        ...fieldProperties,
        [combined_id]: { ...defaultStyleSettings },
      });
      setSelectedFieldId(combined_id);
    }

    setSelectedForCombining([]);
    setIsDropdownOpen(false);
  };

  const handleRemoveField = (fieldGroupId) => {
    const updatedFields = selectedFields.filter(
      (f) => (f.combined_id || f.id) !== fieldGroupId
    );
    setSelectedFields(updatedFields);

    if (selectedFieldId === fieldGroupId) {
      setSelectedFieldId(
        updatedFields[0]?.combined_id || updatedFields[0]?.id || null
      );
    }

    const updatedProperties = { ...fieldProperties };
    delete updatedProperties[fieldGroupId];
    setFieldProperties(updatedProperties);
  };

  const handleStyleChange = (key, value) => {
    if (!selectedFieldId) return;
    setFieldProperties({
      ...fieldProperties,
      [selectedFieldId]: {
        ...fieldProperties[selectedFieldId],
        [key]: value,
      },
    });
  };

  // ─── Save Settings ───────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        templateId: selectedTemplate,
        fields: selectedFields,
        fieldProperties,
        fixedPosition,
      };
      const res = await postRequest(
        `update-e-badge-setting-properties/${settingId}`,
        payload
      );
      if (res.status === 1) {
        setSelectedFields(res?.data?.setting?.fields || []);
        setFieldProperties(res?.data?.setting?.fieldProperties);
        toast.success(res?.message || "E-Badge setting saved successfully");
      } else toast.error(res?.message || "Failed to save");
    } catch (err) {
      console.error(err);
      toast.error("Error saving setting");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => router.back();

  const currentFieldProperties = selectedFieldId
    ? fieldProperties[selectedFieldId] || defaultStyleSettings
    : defaultStyleSettings;

  // Check if field is already added
  const isFieldAlreadyAdded = (fieldId) => {
    return selectedFields.some((f) =>
      f.field?.some((innerField) => innerField.id === fieldId)
    );
  };

  // ─── Render Preview ─────────────────────────────────────────
  useEffect(() => {
    const renderPreview = async () => {
      const previewContainer = previewRef.current;
      if (!previewContainer || !activeTemplate) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(activeTemplate.htmlContent, "text/html");

      const container = doc.getElementById("badgeContent");
      if (!container) return;

      // Ensure container is visible and properly positioned
      container.style.visibility = "visible";
      container.style.position = "relative";
      container.style.width = "100%";
      container.style.height = "100%";

      // Apply category colors to the entire badge
      if (selectedCategory) {
        container.style.backgroundColor = selectedCategory.backgroundColor;
        container.style.color = selectedCategory.textColor;
      } else {
        // Reset to default if no category selected
        container.style.backgroundColor = "";
        container.style.color = "";
      }

      container.innerHTML = "";

      // Render fields sequentially to handle async QR code generation
      for (const fieldGroup of selectedFields) {
        const groupId = fieldGroup.combined_id || fieldGroup.id;
        const props = fieldProperties[groupId] || defaultStyleSettings;

        if (fieldGroup.combined_id && !fixedPosition) {
          // Combined fields - render in a flex container (only when not using fixed position)
          const wrapper = document.createElement("div");
          wrapper.style.display = "flex";
          wrapper.style.gap = "8px";
          wrapper.style.alignItems = "center";
          wrapper.style.marginTop = props.marginTop || "0mm";
          wrapper.style.marginLeft = props.marginLeft || "0mm";
          wrapper.style.justifyContent =
            props.position === "left"
              ? "flex-start"
              : props.position === "center"
              ? "center"
              : "flex-end";

          for (const field of fieldGroup.field) {
            const el = await renderField(field, props, selectedCategory, fixedPosition);
            if (el) {
              el.style.marginLeft = "0mm";
              el.style.marginTop = "0mm";
              wrapper.appendChild(el);
            }
          }

          container.appendChild(wrapper);
        } else if (fieldGroup.combined_id && fixedPosition) {
          // When using fixed position, render combined fields individually
          for (const field of fieldGroup.field) {
            const el = await renderField(field, props, selectedCategory, fixedPosition);
            if (el) container.appendChild(el);
          }
        } else {
          // Single field
          const field = fieldGroup.field?.[0];
          if (field) {
            const el = await renderField(field, props, selectedCategory, fixedPosition);
            if (el) container.appendChild(el);
          }
        }
      }

      setRenderHtml(doc.body.innerHTML);
    };

    const timeOut = setTimeout(() => {
      renderPreview();
    }, 100);

    return () => clearTimeout(timeOut);
  }, [
    selectedFields,
    fieldProperties,
    activeTemplate,
    selectedFieldId,
    selectedCategory,
    fixedPosition,
  ]);

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-white shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Badge Setting</h1>
          <div className="flex gap-2 items-center">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white"
            >
              {isSaving ? "Saving..." : "Save Setting"}
            </Button>
            
            {/* Fixed Position Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
              <Label htmlFor="fixed-position" className="text-sm font-medium cursor-pointer">
                Fixed Position
              </Label>
              <Switch
                id="fixed-position"
                checked={fixedPosition}
                onCheckedChange={setFixedPosition}
              />
            </div>
            
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-1/4 border-r bg-white overflow-y-auto p-4">
            <div className="mb-4">
              <Label className="text-sm font-semibold mb-3 block">
                Select Fields to Add
              </Label>

              {/* Field Selection Dropdown */}
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span>
                      {selectedForCombining.length > 0
                        ? `${selectedForCombining.length} field(s) selected`
                        : "Select fields"}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[350px] max-h-[400px] overflow-y-auto">
                  <div className="p-2">
                    {availableFields.map((field) => {
                      const isAlreadyAdded = isFieldAlreadyAdded(field.id);
                      const isSelected = selectedForCombining.includes(
                        field.id
                      );
                      const isBadgeCategory = field.id === "badgeCategory";
                      const hasBadgeCategorySelected =
                        selectedForCombining.includes("badgeCategory");
                      const anyNonCategorySelected = selectedForCombining.some(
                        (id) => id !== "badgeCategory"
                      );
                      const isDisabled =
                        isAlreadyAdded ||
                        // If badge category is already selected, disable all other fields
                        (hasBadgeCategorySelected && !isBadgeCategory) ||
                        // If any other field is selected, disable badge category
                        (anyNonCategorySelected && isBadgeCategory);
                      return (
                        <div
                          key={field.id}
                          className={`flex items-center gap-3 p-2 rounded transition-all ${
                            isDisabled
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-50 cursor-pointer"
                          } ${isSelected ? "bg-blue-50" : ""}`}
                        >
                          <Checkbox
                            id={field.id}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(field.id, checked)
                            }
                            disabled={isDisabled}
                          />
                          <label
                            htmlFor={field.id}
                            className={`text-sm flex-1 ${
                              isDisabled
                                ? "cursor-not-allowed"
                                : "cursor-pointer"
                            } select-none`}
                          >
                            <div className="font-medium">{field.name}</div>
                            <div className="text-xs text-gray-500">
                              {field.type}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      onClick={handleAddFields}
                      disabled={selectedForCombining.length === 0}
                      className="w-full"
                      size="sm"
                    >
                      Add Fields
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-2 block">
                Add Fields
              </Label>

              <div className="space-y-2">
                {selectedFields.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No fields added yet
                  </div>
                ) : (
                  selectedFields.map((fieldGroup) => {
                    const groupId = fieldGroup.combined_id || fieldGroup.id;
                    const isCombined = !!fieldGroup.combined_id;
                    const isBadgeCategory =
                      fieldGroup.field?.[0]?.id === "badgeCategory";
                    const displayName = isCombined
                      ? fieldGroup.field.map((f) => f.name).join(" + ")
                      : fieldGroup.field[0]?.name;

                    return (
                      <div
                        key={groupId}
                        onClick={() => setSelectedFieldId(groupId)}
                        className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedFieldId === groupId
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex-1 mr-2">
                          <div className="text-sm font-medium">
                            {displayName}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveField(groupId);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-6">
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{
                __html:
                  renderHtml ||
                  '<div style="padding: 40px; text-align: center; color: #999;">No template selected</div>',
              }}
            />
          </div>

          {/* Right Panel - Style Editor */}
          <div className="w-1/4 border-l bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="pb-3 border-b">
                <h2 className="text-md font-semibold text-gray-900">
                  {currentField?.combined_id
                    ? `${currentField.field.map((f) => f.name).join(" + ")}`
                    : currentField?.field?.[0]?.name || "No field selected"}
                </h2>
              </div>

              {selectedFieldId ? (
                <>
                  {/* Badge Category Selector */}
                  {currentField?.field?.some((f) => f.type === "category") ? (
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                        Select Category
                      </Label>
                      <Select
                        value={currentFieldProperties.categoryId || ""}
                        onValueChange={(value) =>
                          handleStyleChange("categoryId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {badgeCategories.map((cat) => (
                            <SelectItem key={cat._id} value={cat._id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{
                                    backgroundColor: cat.backgroundColor,
                                  }}
                                />
                                <span>{cat.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentFieldProperties.categoryId && (
                        <div className="mt-3 p-3 rounded border bg-gray-50">
                          {(() => {
                            const cat = badgeCategories.find(
                              (c) => c._id === currentFieldProperties.categoryId
                            );
                            return cat ? (
                              <div className="text-xs space-y-2">
                                <div>
                                  <span className="font-semibold block mb-1">
                                    Preview:
                                  </span>
                                  <div
                                    className="p-3 rounded text-center font-medium"
                                    style={{
                                      backgroundColor: cat.backgroundColor,
                                      color: cat.textColor,
                                    }}
                                  >
                                    Badge with {cat.name} category
                                  </div>
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Priority:
                                    </span>
                                    <span className="font-medium">
                                      {cat.priority}
                                    </span>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-gray-600">
                                      Background:
                                    </span>
                                    <span className="font-medium">
                                      {cat.backgroundColor}
                                    </span>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-gray-600">
                                      Text Color:
                                    </span>
                                    <span className="font-medium">
                                      {cat.textColor}
                                    </span>
                                  </div>
                                </div>
                                {cat.description && (
                                  <div className="pt-2 border-t text-gray-600">
                                    {cat.description}
                                  </div>
                                )}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        ℹ️ This category will apply background and text colors
                        to the entire badge.
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Common Properties for Non-Category Fields */}
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                          Position
                        </Label>
                        <Select
                          value={currentFieldProperties.position}
                          onValueChange={(value) =>
                            handleStyleChange("position", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                          Margin Left
                        </Label>
                        <Input
                          type="text"
                          value={currentFieldProperties.marginLeft}
                          onChange={(e) =>
                            handleStyleChange("marginLeft", e.target.value)
                          }
                          placeholder="0mm"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                          Margin Top
                        </Label>
                        <Input
                          type="text"
                          value={currentFieldProperties.marginTop}
                          onChange={(e) =>
                            handleStyleChange("marginTop", e.target.value)
                          }
                          placeholder="0mm"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                          Font Family
                        </Label>
                        <Select
                          value={currentFieldProperties.fontFamily}
                          onValueChange={(value) =>
                            handleStyleChange("fontFamily", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman">
                              Times New Roman
                            </SelectItem>
                            <SelectItem value="Courier">Courier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* QR Code specific */}
                      {currentField?.field?.some((f) => f.type === "qrcode") ? (
                        <>
                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Height
                            </Label>
                            <Input
                              type="text"
                              value={currentFieldProperties.height || "20mm"}
                              onChange={(e) =>
                                handleStyleChange("height", e.target.value)
                              }
                              placeholder="20mm"
                              className="w-full"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Width
                            </Label>
                            <Input
                              type="text"
                              value={currentFieldProperties.width || "20mm"}
                              onChange={(e) =>
                                handleStyleChange("width", e.target.value)
                              }
                              placeholder="20mm"
                              className="w-full"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Non-QR Fields Only */}
                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Font Size
                            </Label>
                            <Input
                              type="text"
                              value={currentFieldProperties.fontSize}
                              onChange={(e) =>
                                handleStyleChange("fontSize", e.target.value)
                              }
                              placeholder="12pt"
                              className="w-full"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Font Color
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={currentFieldProperties.fontColor}
                                onChange={(e) =>
                                  handleStyleChange("fontColor", e.target.value)
                                }
                                placeholder="#000"
                                className="flex-1"
                              />
                              <Input
                                type="color"
                                value={currentFieldProperties.fontColor}
                                onChange={(e) =>
                                  handleStyleChange("fontColor", e.target.value)
                                }
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Font Style
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                variant={
                                  currentFieldProperties.fontStyle === "bold"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleStyleChange("fontStyle", "bold")
                                }
                                className="flex-1"
                              >
                                Bold
                              </Button>
                              <Button
                                variant={
                                  currentFieldProperties.fontStyle === "normal"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleStyleChange("fontStyle", "normal")
                                }
                                className="flex-1"
                              >
                                Normal
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                              Text Format
                            </Label>
                            <Select
                              value={currentFieldProperties.textFormat}
                              onValueChange={(value) =>
                                handleStyleChange("textFormat", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="uppercase">
                                  Uppercase
                                </SelectItem>
                                <SelectItem value="lowercase">
                                  Lowercase
                                </SelectItem>
                                <SelectItem value="capitalize">
                                  Capitalize
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Select a field to edit its properties.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EBadgeEditor;
