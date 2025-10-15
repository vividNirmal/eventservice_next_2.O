"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Type,
  Mail,
  Hash,
  Calendar,
  File,
  ListCollapse,
  SquareCheck,
  Disc2,
  Code,
  PencilRuler,
  Search,
  Phone,
  Link,
  Lock,
  GripVertical,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { getApiWithParam } from "@/service/viewService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createRandom5CharAlphanum, generateId } from "@/lib/form-utils";

// icon pass as per field type
export const fieldTypeIcons = {
  text: Type,
  email: Mail,
  url: Link,
  password: Lock,
  phone: Phone,
  number: Hash,
  date: Calendar,
  file: File,
  select: ListCollapse,
  radio: Disc2,
  checkbox: SquareCheck,
  textarea: PencilRuler,
  html: Code,
};

// Draggable Element
export function DraggableElement({ element, index }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${element?._id}`,
    data: element,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: "transform 0ms",
      }
    : undefined;

  const Icon = fieldTypeIcons[element.fieldType] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group p-2 2xl:p-3 bg-white border border-solid rounded-md 2xl:rounded-lg",
        "cursor-grab active:cursor-grabbing",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200 ease-in-out",
        "hover:border-blue-400 hover:bg-blue-50",
        isDragging ? "opacity-40 scale-95 rotate-2 shadow-xl border-blue-500" : ""
      )}
    >
      <div className="flex items-center space-x-1 2xl:space-x-2">
        <div className="flex-shrink-0">
          <Icon className="size-4 2xl:size-5 text-gray-600 group-hover:text-blue-600 transition-all duration-200 ease-in" />
        </div>
        <div className="flex-1 min-w-0 border-l border-solid border-gray-200 pl-2">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {element.fieldTitle}
          </p>
        </div>
        <GripVertical className="size-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// NEW: Draggable Create Field Component
export function DraggableCreateField({ fieldType, icon: Icon, label, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-create-${fieldType}`,
    data: {
      fieldTitle: createRandom5CharAlphanum(),
      fieldName: "",
      fieldOptions: [],
      fieldType: fieldType,
      isPrimary: false,
      isRequired: false,
      placeHolder: `Please Enter ${label}`,
      specialCharactor: false,
      _id: generateId(), // Generate unique ID for drag
      isNewField: true, // Flag to identify it's a newly created field
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: "transform 0ms",
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only trigger onClick if not dragging
        if (!isDragging) {
          onClick();
        }
      }}
      className={cn(
        "bg-white border border-solid border-zinc-300 rounded-lg cursor-grab active:cursor-grabbing",
        "flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]",
        "transition-all duration-200",
        isDragging ? "opacity-40 scale-95 rotate-2 shadow-xl border-blue-500" : "hover:border-blue-400"
      )}
    >
      <Icon className="size-5" />
      <h3 className="text-xs font-medium text-center">{label}</h3>
    </div>
  );
}

/**
 * Element Group Component
 */
function ElementGroup({ elements, searchTerm }) {
  const filteredElements = elements.filter((element) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      element.fieldName.toLowerCase().includes(searchLower) ||
      element.fieldType.toLowerCase().includes(searchLower) ||
      element.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(searchLower)
      )
    );
  });

  if (filteredElements.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mb-5">
      {filteredElements.map((element, index) => (
        <div key={index}>
          <DraggableElement key={index} element={element} index={index} />
        </div>
      ))}
    </div>
  );
}

/**
 * Element Sidebar Component
 */
export function ElementSidebar({ form, onCreateelemet, currentPageIndex }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [defaultElement, setDefaultElement] = useState([]);

  // Make sidebar droppable but reject all drops
  const { setNodeRef: setSidebarRef, isOver } = useDroppable({
    id: "sidebar-droppable",
    data: {
      type: "sidebar",
      accepts: [],
    },
  });

  useEffect(() => {
    elementFtch();
  }, []);

  const elementFtch = async () => {
    try {
      const element = await getApiWithParam(
        "get-default-userType",
        `${form?.userType}`
      );
      if (element.status == 1) {
        setDefaultElement(element.data.field);
      }
    } catch (err) {
      console.error("🚨 Error fetching form:", err);
      toast.error("Failed to load form");
    }
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return null;

    const searchLower = searchTerm.toLowerCase();
    return defaultElement.filter(
      (element) =>
        element.fieldName.toLowerCase().includes(searchLower) ||
        element.fieldType.toLowerCase().includes(searchLower) ||
        element.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchLower)
        )
    );
  }, [searchTerm, defaultElement]);

  function handelecreateElement(inputtype) {
    onCreateelemet(inputtype);
  }

  return (
    <div
      ref={setSidebarRef}
      className={cn(
        "w-60 xl:w-80 bg-gray-50 border-r border-gray-200 relative z-10 flex flex-col transition-all duration-200",
        isOver && "bg-red-50 border-red-300"
      )}
    >
      <Card className="border-0 rounded-none 2xl:p-4 grow">
        <CardHeader className="px-0">
          <CardTitle className="text-sm font-semibold text-gray-700">
            Form Elements
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input
              placeholder="Search elements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="!pl-10 h-9 2xl:h-11 2xl:text-base"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col grow">
          {searchResults ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-2">
                {searchResults.map((element, index) => (
                  <DraggableElement key={index} element={element} index={index} />
                ))}
              </div>
              {searchResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No elements found matching "{searchTerm}"
                </p>
              )}
            </div>
          ) : (
            <>
              <ElementGroup elements={defaultElement} searchTerm={searchTerm} />
              <Accordion
                type="single"
                className="mt-auto bg-gray-50 p-2 pb-4 rounded-lg"
                collapsible
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger
                    className={
                      "hover:no-underline text-sm font-semibold text-gray-700 pt-2 pb-0"
                    }
                  >
                    Create a field
                  </AccordionTrigger>
                  <AccordionContent className={"pt-4 pb-0"}>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Now these are draggable AND clickable */}
                      <DraggableCreateField
                        fieldType="text"
                        icon={Type}
                        label="Single Input"
                        onClick={() => handelecreateElement("text")}
                      />
                      <DraggableCreateField
                        fieldType="select"
                        icon={ListCollapse}
                        label="Dropdown"
                        onClick={() => handelecreateElement("select")}
                      />
                      <DraggableCreateField
                        fieldType="checkbox"
                        icon={SquareCheck}
                        label="Checkbox"
                        onClick={() => handelecreateElement("checkbox")}
                      />
                      <DraggableCreateField
                        fieldType="radio"
                        icon={Disc2}
                        label="Radio Group"
                        onClick={() => handelecreateElement("radio")}
                      />
                      <DraggableCreateField
                        fieldType="textarea"
                        icon={PencilRuler}
                        label="Text Editor"
                        onClick={() => handelecreateElement("textarea")}
                      />
                      <DraggableCreateField
                        fieldType="file"
                        icon={File}
                        label="File"
                        onClick={() => handelecreateElement("file")}
                      />
                      <DraggableCreateField
                        fieldType="html"
                        icon={Code}
                        label="HTML"
                        onClick={() => handelecreateElement("html")}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </CardContent>
      </Card>

      {/* Visual feedback when dragging over sidebar */}
      {isOver && (
        <div className="absolute inset-0 bg-red-100 opacity-50 pointer-events-none flex items-center justify-center z-50">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
            ❌ Cannot drop here
          </div>
        </div>
      )}
    </div>
  );
}