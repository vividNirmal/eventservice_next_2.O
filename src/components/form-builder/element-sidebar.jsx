"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Type,
  Mail,
  Hash,
  FileText,
  ChevronDown,
  Circle,
  CheckSquare,
  Upload,
  Calendar,
  Minus,
  Heading1,
  AlignLeft,
  Search,
  Phone,
  MapPin,
  Globe,
  Building,
  User,
  Camera,
  Link,
  Clock,
  DollarSign,
  Star,
  Shield,
  Users,
  Briefcase,
  Award,
  EyeOff,
  Palette,
  ToggleLeft,
  BookOpen,
  MessageSquare,
  PenTool,
  Video,
  Mic,
  Settings,
  Car,
  Lock,
  ListCollapse,
  SquareCheck,
  Disc2,
  Code,
  ReceiptText,
  File,
  PencilRuler,
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

// icon pass as per field type
export const fieldTypeIcons = {
  text: Type,
  email: Mail,
  url: Link,
  password: Lock,
  phone: Phone,
  number: Hash,
  date: Calendar,
  file : File,
  select :ListCollapse ,
  radio: ToggleLeft,
  checkbox : SquareCheck,  
  textarea: PencilRuler,
  html : Code

};

// Dreaggable Element

// Update only the DraggableElement component in element-sidebar.jsx

export function DraggableElement({ element, index }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${element?._id}`,
    data: element,
   
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: 'transform 0ms', // Remove transition during drag for immediate feedback
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
        // Only show drag effects when actually dragging (not on small movements)
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
        {/* <GripVertical className="size-4 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
      </div>
    </div>
  );
}

/**
 * Element Group Component
 */
function ElementGroup({ elements, searchTerm }) {
  // Filter elements based on search term
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
      {/* <h3 className="text-sm font-semibold text-gray-700">{title}</h3> */}
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
   const { setNodeRef, isOver } = useDroppable({
    id: 'sidebar-droppable',
    data: {
      type: 'sidebar',
      accepts: [] // Doesn't accept any drops
    }
  });

  useEffect(() => {
    elementFtch();
  }, []);
  // fetch defualt field by user Type
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

  // Filter elements based on search
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
    <div ref={setNodeRef} className={cn(
        "w-60 xl:w-80 bg-gray-50 border-r border-gray-200 relative z-10 flex flex-col",
        isOver && "bg-red-50 border-red-300" // Visual feedback when hovering (red = invalid)
      )}>
      <Card className="border-0 rounded-none 2xl:p-4 grow">
        <CardHeader className="px-0">
          <CardTitle className="text-sm font-semibold text-gray-700">Form Elements</CardTitle>
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input placeholder="Search elements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-9 2xl:h-11 2xl:text-base" />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col grow">
          {searchResults ? (
            // Show search results
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Results ({searchResults.length})</h3>
              <div className="space-y-2">
                {searchResults.map((element, index) => (
                  <DraggableElement key={index} element={element} index={index} />
                ))}
              </div>
              {searchResults.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No elements found matching "{searchTerm}"</p>
              )}
            </div>
          ) : (
            // Show all groups
            <>
              <ElementGroup elements={defaultElement} searchTerm={searchTerm} />
              <Accordion type="single" className="mt-auto bg-gray-50 p-2 pb-4 rounded-lg" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className={'hover:no-underline text-sm font-semibold text-gray-700 pt-2 pb-0'}>Create a field</AccordionTrigger>
                  <AccordionContent className={'pt-4 pb-0'}>
                    <div className="grid grid-cols-3 gap-2">
                      <div onClick={()=>handelecreateElement('text')} className="bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]">
                        <Type className="size-5" />
                        <h3 className="text-xs font-medium text-center">Single Input</h3>
                      </div>
                      <div onClick={()=>handelecreateElement('select')} className="bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]">
                        <ListCollapse className="size-5" />
                        <h3 className="text-xs font-medium text-center">Dropdown</h3>
                      </div>
                      <div onClick={()=>handelecreateElement('checkbox')} className="bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]">
                        <SquareCheck className="size-5" />
                        <h3 className="text-xs font-medium text-center">Checkbox</h3>
                      </div>
                      <div onClick={()=>handelecreateElement('radio')} className="bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]">
                        <Disc2 className="size-5" />
                        <h3 className="text-xs font-medium text-center">Radio Group</h3>
                      </div>
                      <div onClick={()=>handelecreateElement('textarea')} className="bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]">
                        <PencilRuler className="size-5" />
                        <h3 className="text-xs font-medium text-center">Text Editor</h3>
                      </div>
                      <div onClick={()=>handelecreateElement('file')} className="bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]">
                        <File className="size-5" />
                        <h3 className="text-xs font-medium text-center">File</h3>
                      </div>
                      {/* <div onClick={handelecreateElement} className='bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]'>
                        <ReceiptText className='size-5' />
                        <h3 className='text-xs font-medium text-center'>T & C</h3>
                      </div> */}
                      <div onClick={()=>handelecreateElement('html')} className='bg-white border border-solid border-zinc-300 rounded-lg cursor-pointer flex flex-col gap-2 items-center px-1 p-4 hover:bg-zinc-50 shadow-[0_0_5px_0_rgba(0,0,0,0.07)]'>
                        <Code className='size-5' />
                        <h3 className='text-xs font-medium text-center'>HTML</h3>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
