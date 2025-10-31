"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";
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
import QRCode from "qrcode";

const availableFields = [
  { id: "firstName", name: "First Name", type: "text" },
  { id: "lastName", name: "Last Name", type: "text" },
  { id: "email", name: "Email", type: "email" },
  { id: "contact", name: "Contact Number", type: "tel" },
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

const EBadgeEditor = ({ params }) => {
  const router = useRouter();
  const previewRef = useRef(null);
  const parsedValue = params?.value ? JSON.parse(params.value) : {};
  const settingId = parsedValue.id;

  const [eventId, setEventId] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [badgeCategories, setBadgeCategories] = useState([]);

  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [fieldProperties, setFieldProperties] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const currentFieldProperties = selectedFieldId
    ? fieldProperties[selectedFieldId]
    : defaultStyleSettings;

  const currentField = selectedFields.find((f) => f.id === selectedFieldId);

  // Get the badge category field and its selected category
  const badgeCategoryField = selectedFields.find((f) => f.id === "badgeCategory");
  const selectedCategoryId = badgeCategoryField 
    ? fieldProperties["badgeCategory"]?.categoryId 
    : null;
  const selectedCategory = badgeCategories.find((cat) => cat._id === selectedCategoryId);

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
        setSelectedFields(data.fields || []);
        setFieldProperties(data.fieldProperties || {});
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

  // ─── Handle Add/Remove Fields ───────────────────────────────
  const handleAddField = (fieldId) => {
    const field = availableFields.find((f) => f.id === fieldId);
    if (field && !selectedFields.find((f) => f.id === fieldId)) {
      setSelectedFields([...selectedFields, field]);
      setFieldProperties({
        ...fieldProperties,
        [fieldId]: fieldProperties[fieldId] || { ...defaultStyleSettings },
      });

      setSelectedFieldId(fieldId); // Auto-select the newly added field
    }
  };

  const handleRemoveField = (fieldId) => {
    const updatedFields = selectedFields.filter((f) => f.id !== fieldId);
    setSelectedFields(updatedFields);

    if (selectedFieldId === fieldId) {
      setSelectedFieldId(updatedFields[0]?.id || null);
    }

    const updatedProperties = { ...fieldProperties };
    delete updatedProperties[fieldId];
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

  const activeTemplate = templates.find((t) => t._id === selectedTemplate);

  // ─── Render Preview ─────────────────────────────────────────
  useEffect(() => {
    const previewContainer = previewRef.current;
    if (!previewContainer) return;

    const container = previewContainer.querySelector("#badgeContent");
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

    const renderField = (field, props) => {
      // Skip rendering badge category field - it only applies colors
      if (field.type === "category") {
        return null;
      }

      const el = document.createElement("div");
      el.id = `field-${field.id}`;
      el.innerText = field.name;

      el.style.position = "relative";
      el.style.marginLeft = props.marginLeft;
      el.style.marginTop = props.marginTop;
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
        qrWrapper.style.marginLeft = props.marginLeft;
        qrWrapper.style.marginTop = props.marginTop;

        const qrCanvas = document.createElement("canvas");
        qrCanvas.style.width = props.width;
        qrCanvas.style.height = props.height;

        QRCode.toCanvas(
          qrCanvas,
          "Sample QR Data",
          { width: parseInt(props.width), margin: 1 },
          (error) => {
            if (error) console.error("QR generation error:", error);
          }
        );

        qrWrapper.appendChild(qrCanvas);
        el.appendChild(qrWrapper);
      }

      return el;
    };

    for (let i = 0; i < selectedFields.length; i++) {
      const field = selectedFields[i];
      const props = fieldProperties[field.id] || defaultStyleSettings;

      // Handle firstName + lastName combination
      if (field.id === "firstName") {
        const nextField = selectedFields[i + 1];
        if (nextField?.id === "lastName") {
          const wrapper = document.createElement("div");
          wrapper.style.display = "flex";
          wrapper.style.gap = "8px";
          wrapper.style.marginTop = props.marginTop;
          wrapper.style.marginLeft = props.marginLeft;

          const firstEl = renderField(field, props);
          const lastProps =
            fieldProperties[nextField.id] || defaultStyleSettings;
          const lastEl = renderField(nextField, lastProps);

          if (firstEl) wrapper.appendChild(firstEl);
          if (lastEl) wrapper.appendChild(lastEl);
          container.appendChild(wrapper);
          i++; // Skip next iteration since we already processed lastName
          continue;
        }
      }

      // Handle standalone lastName (if not preceded by firstName)
      if (field.id === "lastName") {
        const prevField = selectedFields[i - 1];
        if (prevField?.id !== "firstName") {
          const el = renderField(field, props);
          if (el) container.appendChild(el);
        }
        continue;
      }

      // Regular field rendering
      const el = renderField(field, props);
      if (el) container.appendChild(el);
    }
  }, [selectedFields, fieldProperties, activeTemplate, selectedFieldId, selectedCategory]);

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 bg-white shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Badge Setting</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white"
            >
              {isSaving ? "Saving..." : "Save Setting"}
            </Button>
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
            <Label className="text-sm font-semibold mb-2 block">
              Add Fields
            </Label>
            <Select onValueChange={handleAddField}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select field to add" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-4 space-y-2">
              {selectedFields.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFieldId(f.id)}
                  className={`flex justify-between items-center p-2 rounded-md border cursor-pointer ${
                    selectedFieldId === f.id
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  <span className="text-sm">{f.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveField(f.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Center Panel - Preview */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto p-6">
            <div
              ref={previewRef}
              dangerouslySetInnerHTML={{
                __html:
                  activeTemplate?.htmlContent || 
                  '<div style="padding: 40px; text-align: center; color: #999;">No template selected</div>',
              }}
            />
          </div>

          {/* Right Panel - Style Editor */}
          <div className="w-1/4 border-l bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              <h2 className="text-md font-semibold text-gray-900">
                {currentField?.name || "No field selected"}
              </h2>

              {selectedFieldId ? (
                <>
                  {/* Badge Category Selector */}
                  {currentField?.type === "category" && (
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
                                  style={{ backgroundColor: cat.backgroundColor }}
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
                                    <span className="text-gray-600">Priority:</span>
                                    <span className="font-medium">{cat.priority}</span>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-gray-600">Background:</span>
                                    <span className="font-medium">{cat.backgroundColor}</span>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-gray-600">Text Color:</span>
                                    <span className="font-medium">{cat.textColor}</span>
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
                        ℹ️ This category will apply background and text colors to the entire badge.
                      </div>
                    </div>
                  )}

                  {/* Show common properties for non-category fields */}
                  {currentField?.type !== "category" && (
                    <>
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
                      {currentField?.type === "qrcode" ? (
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
                                <SelectItem value="uppercase">Uppercase</SelectItem>
                                <SelectItem value="lowercase">Lowercase</SelectItem>
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
