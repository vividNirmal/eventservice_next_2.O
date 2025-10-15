"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DndFormBuilder } from "./dnd-context";
import { ElementSidebar } from "./element-sidebar";
import { FormCanvas } from "./form-canvas";
import { ElementProperties } from "./element-properties";
import { Button } from "../ui/button";
import {
  ArrowDownFromLine,
  ArrowUpFromLine,
  PackagePlusIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { createRandom5CharAlphanum, generateId } from "@/lib/form-utils";
import { toast } from "sonner";
import { fileDownloadRequest } from "@/service/viewService";
import { ProductImportModal } from "../common/importDialog";
import { useRouter } from "next/navigation";

/**
 * Main Form Builder Component
 */
export function FormBuilder({ form, onFormChange }) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [openPageModal, setOpenPageModal] = useState(false);
  const [pageName, setPageName] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const pageRefs = useRef({});

  // Store refs for each page
  const setPageRef = useCallback((pageIndex, element) => {
    if (element) {
      pageRefs.current[pageIndex] = element;
    }
  }, []);

  // Improved page navigation with IntersectionObserver
  const handlePageNavigation = useCallback((pageIndex) => {
    setCurrentPageIndex(pageIndex);
    
    const pageElement = pageRefs.current[pageIndex];
    const container = scrollContainerRef.current;
    
    if (pageElement && container) {
      // Calculate the exact scroll position
      const containerRect = container.getBoundingClientRect();
      const pageRect = pageElement.getBoundingClientRect();
      
      const scrollTop = container.scrollTop + pageRect.top - containerRect.top;
      
      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  }, []);

  // Sync current page based on scroll position (optional - for automatic highlighting)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      // Find which page is closest to center
      let closestPageIndex = currentPageIndex;
      let closestDistance = Infinity;

      Object.entries(pageRefs.current).forEach(([index, element]) => {
        const pageRect = element.getBoundingClientRect();
        const pageCenter = pageRect.top + pageRect.height / 2;
        const distance = Math.abs(pageCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestPageIndex = parseInt(index);
        }
      });

      if (closestPageIndex !== currentPageIndex) {
        setCurrentPageIndex(closestPageIndex);
      }
    };

    // Debounce scroll handler
    let scrollTimeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    };

    container.addEventListener("scroll", debouncedHandleScroll);
    
    return () => {
      container.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentPageIndex]);

  // Auto-scroll to current page when it changes externally
  useEffect(() => {
    if (form.pages.length > 0) {
      handlePageNavigation(currentPageIndex);
    }
  }, [form.pages.length]);

  const selectedElement = selectedElementId
    ? form.pages
        .flatMap((page) => page.elements)
        .find((el) => el._id === selectedElementId) || null
    : null;

  const handleElementsChange = useCallback(
    (newElements, pageIndex) => {
      const updatedPages = [...form.pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        elements: newElements,
      };

      onFormChange({
        ...form,
        pages: updatedPages,
      });
    },
    [form, onFormChange]
  );

  const handleAddElement = useCallback(
    (newElement, pageIndex) => {
      const targetPageIndex = pageIndex ?? currentPageIndex;
      const updatedPages = [...form.pages];
      setCurrentPageIndex(targetPageIndex);

      const elementWithPosition = {
        ...newElement,
        position: updatedPages[targetPageIndex].elements.length,
      };

      updatedPages[targetPageIndex] = {
        ...updatedPages[targetPageIndex],
        elements: [
          ...updatedPages[targetPageIndex].elements,
          elementWithPosition,
        ],
      };

      onFormChange({
        ...form,
        pages: updatedPages,
      });

      setSelectedElementId(newElement._id);
    },
    [form, currentPageIndex, onFormChange]
  );

  const handleElementEdit = useCallback((element) => {
    setSelectedElementId(element.id);
  }, []);

  const handleElementDelete = useCallback(
    (elementId) => {
      const updatedPages = form.pages.map((page) => ({
        ...page,
        elements: page.elements
          .filter((el) => el._id !== elementId)
          .map((el, index) => ({ ...el, position: index })),
      }));

      onFormChange({
        ...form,
        pages: updatedPages,
      });

      if (selectedElementId === elementId) {
        setSelectedElementId(null);
      }
    },
    [form, selectedElementId, onFormChange]
  );

  const handleElementSelect = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const handleElementSave = useCallback(
    (updatedElement) => {
      const updatedPages = form.pages.map((page) => ({
        ...page,
        elements: page.elements.map((el) =>
          el._id === updatedElement._id ? updatedElement : el
        ),
      }));
      onFormChange({
        ...form,
        pages: updatedPages,
      });

      setSelectedElementId(null);
    },
    [form, onFormChange]
  );

  const handlePropertiesClose = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  // Get all elements from current page for DndContext
  const currentPageElements = form?.pages[currentPageIndex]?.elements || [];

  const createElement = (inputType) => {
    const createNewElement = {
      fieldTitle: createRandom5CharAlphanum(),
      fieldName: "",
      fieldOptions: [],
      fieldType: inputType,
      isPrimary: false,
      isRequired: false,
      placeHolder: "Please Enter Address",
      specialCharactor: false,
      _id: generateId(),
    };
    handleAddElement(createNewElement, currentPageIndex);
  };

  const pageDateUpdate = useCallback(
    ({ pageTitle, pageDescription, pageindex }) => {
      const updatedPages = form.pages.map((page, idx) =>
        idx === pageindex
          ? {
              ...page,
              name: pageTitle,
              description: pageDescription,
            }
          : page
      );

      onFormChange({
        ...form,
        pages: updatedPages,
      });
    },
    [form, onFormChange]
  );

  const handleCreatePage = useCallback(() => {
    if (!pageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }

    const newPage = {
      _id: Date.now().toString(), // or uuid
      name: pageName,
      description: pageDescription,
      elements: [],
    };

    onFormChange({
      ...form,
      pages: [...form.pages, newPage],
    });
    toast.success("Page added successfully");
    setOpenPageModal(false);
    setPageName("");
    setPageDescription("");
    // Switch to the newly created page
    setCurrentPageIndex(form.pages.length);
  }, [pageName, pageDescription, form, onFormChange]);

  const handleExportForm = async () => {
    try {
      const res = await fileDownloadRequest("GET", `/form/export/${form?.id}`);
      const blob = new Blob([res], { type: "application/json" }); // Changed to application/json
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${form?.id}-pages.json`; // Or use your fileName variable
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.message);
    }
  };
  // Fetch latest form state after import (called from ProductImportModal)
  const fetchStates = useCallback(
    (data) => {
      try {
        // Only update the pages property of the form
        onFormChange({
          ...form,
          pages: data?.form.pages,
        });
        toast.success("Form pages refreshed successfully");
      } catch (error) {
        toast.error("Error refreshing form pages");
        console.error(error);
      }
    },
    [form, onFormChange]
  );

  return (
    <div className="flex flex-col bg-gray-100 h-16 grow">
      <DndFormBuilder
        elements={currentPageElements}
        onElementsChange={handleElementsChange}
        onAddElement={handleAddElement}
        currentPageIndex={currentPageIndex}
      >
        <div className="flex grow overflow-auto">
          <ElementSidebar
            form={form}
            onCreateelemet={(data) => createElement(data)}
            currentPageIndex={currentPageIndex}
          />
          <div className="w-1/3 grow flex flex-col gap-4 p-4 sticky top-0">
            <div className="overflow-auto gap-4 flex flex-col h-20 grow pr-4">
              <div className="flex flex-wrap justify-end gap-4 bg-white p-4 rounded-xl shadow-lg border border-solid border-zinc-200">
                {/* Page Selector Dropdown - Only show if pages exist */}
                {form.pages && form.pages.length > 0 && (
                  <Select
                    value={String(currentPageIndex)}
                    onValueChange={(val) => handlePageNavigation(Number(val))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.pages.map((page, index) => (
                        <SelectItem key={page._id || `page-${index}`} value={String(index)}>
                          {page.name || `Page ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={() => setOpenPageModal(true)}>
                  <PackagePlusIcon className="h-4 w-4 mr-2" />
                  Page
                </Button>
                <Button
                  onClick={handleExportForm}
                  variant={"secondary"}
                  className={
                    "shadow-lg border border-solid border-gray-200 hover:text-white hover:border-blue-500 hover:bg-blue-500"
                  }
                >
                  <ArrowUpFromLine />
                  Export
                </Button>
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  variant={"secondary"}
                  className={
                    "shadow-lg border border-solid border-gray-200 hover:text-white hover:border-blue-500 hover:bg-blue-500"
                  }
                >
                  <ArrowDownFromLine />
                  Import
                </Button>
              </div>
              <div
                className="overflow-auto gap-4 flex flex-col h-20 grow pr-4 scroll-smooth"
                ref={scrollContainerRef}
              >
                {form.pages.map((page, pageIndex) => (
                  <div key={page._id || `page-${pageIndex}`} id={`page-${pageIndex}`}>
                    <FormCanvas
                      pageuniqid={pageIndex}
                      title={page.name}
                      description={page.description}
                      elements={page.elements || []}
                      onElementEdit={handleElementEdit}
                      onElementDelete={handleElementDelete}
                      selectedElementId={selectedElementId}
                      onElementSelect={handleElementSelect}
                      onPagetitleUpdate={pageDateUpdate}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* <div className='flex flex-wrap justify-end gap-4 bg-white p-4 rounded-xl shadow-lg'>
              <Button>Save</Button>
              <Button variant={"secondary"}>Discard</Button>
              <Button variant={"secondary"}>Reset field</Button>
            </div> */}
          </div>

          <ElementProperties
            element={selectedElement}
            onSave={handleElementSave}
            onClose={handlePropertiesClose}
          />
        </div>
      </DndFormBuilder>

      {/* create page */}
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

      {/* json File Import */}
      <ProductImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import From Json"
        apiEndpoint={`/form/import/${form?.id}`} // Example API endpoint
        refetch={fetchStates}
      />
    </div>
  );
}