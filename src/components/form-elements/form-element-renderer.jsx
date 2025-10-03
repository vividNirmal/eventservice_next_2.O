"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DraggableElement } from "../form-builder/element-sidebar";

/**
 * Form Element Renderer Component
 * Renders individual form elements based on their type
 */
export function FormElementRenderer({
  element,
  preview = false,
  value,
  onChange,
  error,
}) {
  const { type, label, name, placeholder, required, options, description } =
    element;
  // For preview mode, we don't need actual functionality
  const handleChange = (newValue) => {
    if (onChange && !preview) {
      onChange(name, newValue);
    }
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
    );
  };

  const renderDescription = () => {
    if (!description) return null;

    return <p className="text-xs text-gray-500 mt-1">{description}</p>;
  };

  const renderError = () => {
    if (!error || preview) return null;

    return <p className="text-xs text-red-500 mt-1">{error}</p>;
  };

  const renderElement = () => {
    switch (type) {
      case "text":
      case "phone":
      case "company":
      case "job_title":
      case "address":
      case "website":
      case "industry":
        return (
          <Input
            id={name}
            name={name}
            type="text"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
            autoComplete="off"
            data-form-type="other"
          />
        );

      case "email":
        return (
          <Input
            id={name}
            name={name}
            type="email"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
            autoComplete="off"
            data-form-type="other"
          />
        );

      case "number":
        return (
          <Input
            id={name}
            name={name}
            type="number"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "currency":
        return (
          <Input
            id={name}
            name={name}
            type="number"
            step="0.01"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "time":
        return (
          <Input
            id={name}
            name={name}
            type="time"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
            rows={4}
          />
        );

      case "select":
      case "country":
      case "experience":
      case "registration_type":
        return (
          <Select
            value={value ?? ""}
            onValueChange={handleChange}
            disabled={preview}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={value ?? ""}
            onValueChange={handleChange}
            disabled={preview}
            className="flex flex-col space-y-2"
          >
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                />
                <Label htmlFor={`${name}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
      case "session_preference":
      case "dietary":
      case "accessibility":
        const selectedValues = Array.isArray(value) ? value : [];

        return (
          <div className="flex flex-col space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${name}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (preview) return;

                    const newValues = checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v) => v !== option.value);
                    handleChange(newValues);
                  }}
                  disabled={preview}
                />
                <Label htmlFor={`${name}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "file":
      case "photo":
      case "logo":
        return (
          <Input
            id={name}
            name={name}
            type="file"
            accept={type === "photo" || type === "logo" ? "image/*" : undefined}
            onChange={(e) => handleChange(e.target.files[0])}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "date":
        return (
          <Input
            id={name}
            name={name}
            type="date"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "heading":
        const HeadingTag = element.headingLevel || "h2";
        return (
          <HeadingTag className="text-lg font-semibold text-gray-900 mb-2">
            {element.content || label}
          </HeadingTag>
        );

      case "paragraph":
        return (
          <p className="text-gray-700 leading-relaxed">
            {element.content || "Add your paragraph content here."}
          </p>
        );

      case "divider":
        return <Separator className="my-4" />;

      // Additional Basic Inputs
      case "password":
        return (
          <Input
            id={name}
            name={name}
            type="password"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "url":
        return (
          <Input
            id={name}
            name={name}
            type="url"
            placeholder={placeholder || "https://example.com"}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "search":
        return (
          <Input
            id={name}
            name={name}
            type="search"
            placeholder={placeholder || "Search..."}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      // Additional Professional & Location Fields
      case "department":
      case "skills":
      case "education":
      case "city":
      case "state":
      case "zipcode":
        return (
          <Input
            id={name}
            name={name}
            type="text"
            placeholder={placeholder}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      // Additional Event Specific Fields
      case "emergency_contact":
      case "tshirt_size":
      case "transportation":
        return (
          <Select
            value={value ?? ""}
            onValueChange={handleChange}
            disabled={preview}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      // Advanced Date/Time Elements
      case "datetime":
        return (
          <Input
            id={name}
            name={name}
            type="datetime-local"
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "range":
        return (
          <Input
            id={name}
            name={name}
            type="range"
            min={element.min || 0}
            max={element.max || 100}
            step={element.step || 1}
            value={value ?? (element.min || 0)}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "color":
        return (
          <Input
            id={name}
            name={name}
            type="color"
            value={value ?? "#000000"}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={`w-20 h-10 ${error ? "border-red-500" : ""}`}
          />
        );

      case "hidden":
        return (
          <input
            type="hidden"
            name={name}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      // Media uploads
      case "video":
        return (
          <Input
            id={name}
            name={name}
            type="file"
            accept="video/*"
            onChange={(e) => handleChange(e.target.files?.[0])}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      case "audio":
        return (
          <Input
            id={name}
            name={name}
            type="file"
            accept="audio/*"
            onChange={(e) => handleChange(e.target.files?.[0])}
            disabled={preview}
            className={error ? "border-red-500" : ""}
          />
        );

      // Advanced Elements
      case "signature":
        return (
          <div className="border border-gray-300 rounded p-4 bg-white">
            <canvas
              id={name}
              width="400"
              height="150"
              className="border border-gray-200 rounded cursor-crosshair w-full h-32"
              style={{ touchAction: "none" }}
              onMouseDown={(e) => {
                if (preview) return;
                const canvas = e.target;
                const rect = canvas.getBoundingClientRect();
                const ctx = canvas.getContext("2d");
                let isDrawing = false;

                const startDrawing = (x, y) => {
                  isDrawing = true;
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                };

                const draw = (x, y) => {
                  if (!isDrawing) return;
                  ctx.lineWidth = 2;
                  ctx.lineCap = "round";
                  ctx.strokeStyle = "#000";
                  ctx.lineTo(x, y);
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo(x, y);
                };

                const stopDrawing = () => {
                  isDrawing = false;
                  handleChange(canvas.toDataURL());
                };

                startDrawing(e.clientX - rect.left, e.clientY - rect.top);

                const mouseMoveHandler = (e) => {
                  draw(e.clientX - rect.left, e.clientY - rect.top);
                };

                const mouseUpHandler = () => {
                  document.removeEventListener("mousemove", mouseMoveHandler);
                  document.removeEventListener("mouseup", mouseUpHandler);
                  stopDrawing();
                };

                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
              }}
            />
            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={() => {
                  if (preview) return;
                  const canvas = document.getElementById(name);
                  const ctx = canvas.getContext("2d");
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  handleChange("");
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
                disabled={preview}
              >
                Clear
              </button>
              <span className="text-xs text-gray-400">Sign above</span>
            </div>
          </div>
        );

      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleChange(star)}
                disabled={preview}
                className={`text-2xl ${
                  (value ?? 0) >= star ? "text-yellow-400" : "text-gray-300"
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}
          </div>
        );

      case "toggle":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value ?? false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={preview}
              className="toggle-switch"
            />
            <Label htmlFor={name} className="text-sm">
              {value ? "On" : "Off"}
            </Label>
          </div>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${name}-${option.value}`}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      handleChange([...currentValues, option.value]);
                    } else {
                      handleChange(
                        currentValues.filter((v) => v !== option.value)
                      );
                    }
                  }}
                  disabled={preview}
                />
                <Label htmlFor={`${name}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case "richtext":
        return (
          <Textarea
            id={name}
            name={name}
            placeholder={placeholder || "Enter rich text content..."}
            value={value ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            disabled={preview}
            className={error ? "border-red-500" : ""}
            rows={6}
          />
        );

      case "captcha":
        const captchaCode = React.useMemo(() => {
          return Math.random().toString(36).substring(2, 8).toUpperCase();
        }, []);

        return (
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="bg-white border border-gray-400 px-4 py-2 rounded font-mono text-lg tracking-wider select-none">
                {captchaCode}
              </div>
              <Input
                id={name}
                name={name}
                type="text"
                placeholder="Enter the code above"
                value={value ?? ""}
                onChange={(e) => handleChange(e.target.value)}
                disabled={preview}
                className={`flex-1 ${error ? "border-red-500" : ""}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter the verification code shown above
            </p>
          </div>
        );

      default:
        return (
          <DraggableElement  element={element} index={element._id}/>
        );
    }
  };

  // For content elements (heading, paragraph, divider), don't show label/description
  if (["heading", "paragraph", "divider"].includes(type)) {
    return <div className="w-full">{renderElement()}</div>;
  }

  return (
    <div className="w-full space-y-2 bg-gray-50 group-hover:bg-white p-2.5 rounded-lg transition-colors duration-300 ease-in">
      {renderLabel()}
      {renderElement()}
      {renderDescription()}
      {renderError()}
    </div>
  );
}
