"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getRequest, postRequest } from "@/service/viewService";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";

function AddScanner({ editScanner, isOpen, onClose, refetch }) {
  const [loading, setLoading] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  
  const formik = useFormik({
    initialValues: {
      scanner_name: "",
      device_key: "",
      device_type: "",
      // Optional assignment fields
      company_id: "",
      expired_date: "",
    },
    validationSchema: Yup.object({
      scanner_name: Yup.string().required("Scanner name is required"),
      device_key: Yup.string().required("Device Key is required"),
      device_type: Yup.string().required("Device Type is required"),
      // Optional fields
      company_id: Yup.string().optional(),
      expired_date: Yup.string().optional(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try{
        const formData = new FormData();
        formData.append("scanner_name", values.scanner_name);
        formData.append("device_key", values.device_key);
        formData.append("device_type", values.device_type);
        
        // Add optional assignment fields if provided
        if (values.company_id) {
          formData.append("company_id", values.company_id);
        }
        if (values.expired_date) {
          formData.append("expired_date", values.expired_date);
        }

        if (editScanner) {
          formData.append("scanner_machine_id", editScanner);
          const response = await postRequest("update-scanner-machine", formData);
          if (response.status == 1) {
            toast.success("Scanner updated successfully");
            onClose();
            refetch(true);
          } else {
            toast.error(response.message || "Failed to update scanner");
          }
        } else {
          const response = await postRequest("add-scanner-machine", formData);
          if (response.status == 1) {
            toast.success(response.data?.message || "Scanner added successfully");
            onClose();
            refetch(true);
          } else {
            toast.error(response.message || "Failed to add scanner");
          }
        } 
      } catch (error) {
        toast.error("An error occurred");
        console.error("Scanner operation error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  async function getById() {
    const response = await getRequest(`get-scanner-machine/${editScanner}`);
    if (response.status == 1) {
      formik.setValues({
        scanner_name: response.data.scanner_name,
        device_key: response.data.device_key,
        device_type: response.data.device_type,
        company_id: response.data.company_id || "",
        expired_date: response.data.expired_date ? response.data.expired_date.split('T')[0] : "",
      });
    }
  }

  async function getCompanyList() {
    try {
      const response = await getRequest("get-company-list");
      if (response.status == 1) {
        setCompanyList(response.data?.company || []);
      } else {
        console.log("Failed to get companies:", response.message);
      }
    } catch (error) {
      console.error("Failed to fetch company list:", error);
    }
  }

  useEffect(() => {
    getCompanyList();
  }, []);

  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, company list:", companyList);
    }
  }, [isOpen, companyList]);

  useEffect(() => {
    if (editScanner) {
      getById(editScanner);
    }
  }, [editScanner]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setLoading(false);
    }
  }, [isOpen]);
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>
            {editScanner ? "Edit Scanner Machine" : "Add & Assign Scanner Machine"}
          </SheetTitle>
          <SheetDescription>
            {editScanner ? "Update scanner details and assignment" : "Create a new scanner and optionally assign to a company"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="scanner_name">Scanner Name</Label>
            <Input
              id="scanner_name"
              name="scanner_name"
              placeholder="Enter Scanner Name"
              value={formik.values.scanner_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.scanner_name && formik.errors.scanner_name && (
              <p className="text-sm text-red-500">
                {formik.errors.scanner_name}
              </p>
            )}
          </div>



          <div className="space-y-2">
            <Label htmlFor="device_key">Device Key</Label>
            <Input
              id="device_key"
              name="device_key"
              placeholder="Enter Device Key"
              value={formik.values.device_key}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.device_key && formik.errors.device_key && (
              <p className="text-sm text-red-500">
                {formik.errors.device_key}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="device_type">Device Type</Label>
            <Select
              id="device_type"
              name="device_type"
              value={formik.values.device_type}
              onValueChange={(val) =>
                  formik.setFieldValue("device_type", val)
                }
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Check In</SelectItem>
                <SelectItem value="1">Check Out</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.device_type && formik.errors.device_type && (
              <p className="text-sm text-red-500">
                {formik.errors.device_type}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_id">Assign to Company (Optional)</Label>
            <CustomCombobox
              name="company_id"
              value={formik.values.company_id}
              onChange={(value) => formik.setFieldValue("company_id", value)}
              onBlur={() => formik.setFieldTouched("company_id", true)}
              valueKey="_id"
              labelKey="company_name"
              options={companyList || []}
              placeholder="Select Company"
              searchPlaceholder="Search companies..."
              emptyMessage="No companies found"
              id="company_id"
              className={`${
                formik.touched.company_id && formik.errors.company_id
                  ? "error-field"
                  : ""
              }`}
            />
            {formik.touched.company_id && formik.errors.company_id && (
              <p className="text-sm text-red-500">
                {formik.errors.company_id}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expired_date">Assignment Expiry Date (Optional)</Label>
            <Input
              id="expired_date"
              name="expired_date"
              type="date"
              value={formik.values.expired_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.expired_date && formik.errors.expired_date && (
              <p className="text-sm text-red-500">
                {formik.errors.expired_date}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editScanner ? "Update Scanner" : "Add Scanner"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default AddScanner;
