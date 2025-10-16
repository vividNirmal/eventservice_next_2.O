"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/common/pagination";
import { Search, Loader2, Eye, Copy } from "lucide-react";
import { getRequest } from "@/service/viewService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useFormik } from "formik";
import dynamic from "next/dynamic";
import { textEditormodule } from "@/lib/constant";

// Dynamically import ReactQuill
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});


const DefaultTemplateList = ({ eventId, templateType }) => {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [template,setTemplate] = useState(null)

  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchDefaultTemplates();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchDefaultTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        type: templateType,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`templates?${params}`);

      if (response.status === 1) {
        setTemplates(response.data.templates || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching default templates:", error);
      toast.error("Failed to fetch default templates");
    } finally {
      setLoading(false);
    }
  };

  
const formik = useFormik({
  initialValues: {
    name: "",
    type: "",
    subject: "",
    content: "",
    text: "",
  },  
  onSubmit: () => {},
});

  const handleViewTemplate = async (templateId) => {
  try {
    const response = await getRequest(`templates/${templateId}`);
    if (response?.data) {
      formik.setValues({
        name: response.data.name || "",
        type: response.data.type || "",
        subject: response.data.subject || "",
        content: response.data.content || "",
        text: response.data.text || "",
      });
      setOpen(true);
    } else {
      setOpen(false);
    }
  } catch (error) {
    console.error("Failed to load template", error);
    setOpen(false);
  }
};

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== selectedLimit) {
      setSelectedLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
    <Card className="shadow-none">
      <CardHeader className={'!px-0'}>
        <CardTitle>Default Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search default templates..."
              value={searchTerm}
              onChange={handleSearch}
              className="!pl-10"
            />
          </div>
          <Select
            value={selectedLimit.toString()}
            onValueChange={handleLimitChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataLimits.map((limit) => (
                <SelectItem key={limit} value={limit.toString()}>
                  {limit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    {templateType === "email" && <TableHead>Subject</TableHead>}
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <TableRow key={template._id}>
                        <TableCell className="font-medium">
                          {template.name}
                        </TableCell>
                        <TableCell>
                          {template.typeId?.typeName || "N/A"}
                        </TableCell>
                        {templateType === "email" && (
                          <TableCell>{template.subject || "N/A"}</TableCell>
                        )}
                        <TableCell>{formatDate(template.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewTemplate(template._id)}
                              title="View template"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No default templates available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalCount > 1 && (
              <div className="mt-4">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  pageSize={selectedLimit}
                  totalEntries={totalCount}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
     <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-pretty">View Template</DialogTitle>
            <DialogDescription>
              Read-only preview of your message template.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  readOnly
                  disabled
                  className="bg-muted/40"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Template Type</Label>
                <Input
                  id="type"
                  name="type"
                  value={formik.values.type}
                  readOnly
                  disabled
                  className="bg-muted/40"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formik.values.subject}
                  readOnly
                  disabled
                  className="bg-muted/40"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="content">HTML Content *</Label>
                <div className="min-h-64 border rounded-md">
                  <ReactQuill
                    id="content"
                    name="content"
                    theme="snow"
                    value={formik.values.content}
                    readOnly={true} // <-- make it read-only
                    modules={textEditormodule.modules}
                    className="w-full min-h-64 flex flex-col 
        [&>.ql-container.ql-snow]:flex 
        [&>.ql-container.ql-snow]:flex-col 
        [&>.ql-container>.ql-editor]:grow 
        [&>.ql-toolbar.ql-snow]:rounded-t-md 
        [&>.ql-container.ql-snow]:rounded-b-md 
        [&>.ql-container.ql-snow]:flex-grow"
                  />
                </div>
                {formik.touched.content && formik.errors.content && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.content}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="text">Text</Label>
                <Textarea
                  id="text"
                  name="text"
                  value={formik.values.text}
                  readOnly
                  disabled
                  className="min-h-[80px] bg-muted/40"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                type="button"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default DefaultTemplateList;
