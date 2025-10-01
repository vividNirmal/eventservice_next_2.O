import { fileDownloadRequest } from "@/service/viewService";
import { Download, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function ExportButton({ endpoint = "export-product", fileName = "Product.xlsx",title = null,icon = null }) {
  const [exportLoading, setExportLoading] = useState(false);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fileDownloadRequest("GET", endpoint);
      const blob = new Blob([res], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setExportLoading(false);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exportLoading}
    >
      <Download className="size-4" />
      {exportLoading ? <Loader2 /> : title ? title : "Export"}
    </Button>
  );
}
