"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, UploadCloud, CheckCircle, XCircle } from "lucide-react";
import { postRequest } from "@/service/viewService"; // Import the new postRequest
import { toast } from "sonner";

export function ProductImportModal({ isOpen, onClose, apiEndpoint, title, refetch }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleFileChange = useCallback((event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setImportError(null);
    } else {
      setSelectedFile(null);
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      setImportError(null);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleImportClick = async () => {
    if (!selectedFile) {
      setImportError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setImportError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await postRequest(apiEndpoint, formData);
      if (response) {
        toast.success(response.message);        
        handleCloseClick()
        refetch();
      } else {
        setImportError(response.message);
      }
    } catch (error) {
      console.error("Error during file upload:", error);
      setImportError("An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = () => {
    setSelectedFile(null);
    setImportError(null);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseClick}>
      <DialogContent className="max-w-xl p-0 rounded-3xl shadow-xl">
        <DialogHeader className="flex items-center justify-between px-3 py-2.5 xl:p-4 border-b border-solid border-gray-300 flex-row space-y-0">
          <DialogTitle className="text-lg xl:text-xl font-semibold text-gray-600">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 2xl:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                {selectedFile ? (
                  <p className="mb-2 text-xs text-gray-500">
                    <span className="font-semibold">Selected file:</span> {selectedFile.name}
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG, GIF, or CSV (MAX. 800x400px)
                    </p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {importError && (
            <div className="mt-4 flex items-center text-red-600 text-xs">
              <XCircle className="h-4 w-4 mr-2" />
              {importError}
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2 p-4 border-t border-solid border-gray-300 flex-row sm:justify-end">
          <Button
            variant="outline"
            className="cursor-pointer p-1.5 px-2 2xl:px-3 hover:bg-[#7367f0] hover:text-white rounded-lg w-fit flex items-center gap-1.5 2xl:gap-2.5 text-xs 2xl:text-base font-normal border border-solid border-[#7367f0] bg-white text-[#7367f0] outline-none transition-all duration-200 ease-linear"
            onClick={handleCloseClick}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="cursor-pointer p-1.5 px-3 bg-[#7367f0] text-white rounded-lg w-fit flex items-center gap-1.5 2xl:gap-2.5 text-xs 2xl:text-base font-normal border border-solid border-[#7367f0] hover:bg-white hover:text-[#7367f0] transition-all duration-200 ease-linear"
            onClick={handleImportClick}
            disabled={!selectedFile || loading}
          >
            {loading ? "Uploading..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
