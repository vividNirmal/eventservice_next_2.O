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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";

function AssignScanner({ isOpen, onClose, refetch, machineList }) {
  const [loading, setLoading] = useState(false);
  const [compayList, setCompanyList] = useState([]);

  const formik = useFormik({
    initialValues: {
      company_id: "",
      scanner_machine_id: "",
      expired_date: "",
      password: "",
    },
    validationSchema: Yup.object({
      company_id: Yup.string().required("Company is required"),
      scanner_machine_id: Yup.array().required("Scanner Machine is required"),
      expired_date: Yup.string().required("Expired Date is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("company_id", values.company_id);
      values.scanner_machine_id.forEach((element) => {
        formData.append("scannerMachine_ids[]", element);
      });
      formData.append("expired_date", values.expired_date);
      formData.append("password", values.password);
      const responce = await postRequest("assign-scanner-machine", formData);

      if (responce.status == 1) {
        console.log(responce?.status);
        toast.success("Scanner assigned successfully");
        formik.resetForm();
        onClose();
        refetch(true);
        setLoading(false);
      }
    },
  });

  async function getCompanyList() {
    const responce = await getRequest("get-company-list");
    if (responce.status == 1) {
      setCompanyList(responce.data?.company);
    }
  }

  useEffect(() => {
    getCompanyList();
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>Assgin Scanner</SheetTitle>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="company_id">Company</Label>
            <CustomCombobox
              name="company_id"
              value={formik.values.company_id}
              onChange={(value) => formik.setFieldValue("company_id", value)}
              onBlur={() => formik.setFieldTouched("company_id", true)}
              valueKey="_id"
              labelKey="company_name"
              options={compayList || []}
              placeholder="Select Company"
              id="company_id"
            />
            {formik.touched.company_id && formik.errors.company_id && (
              <p className="text-sm text-red-500">{formik.errors.company_id}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="scanner_machine_id">scanner Machine ID</Label>
            <CustomCombobox
              name="scanner_machine_id"
              value={formik.values.scanner_machine_id}
              onChange={(value) =>
                formik.setFieldValue("scanner_machine_id", value)
              }
              onBlur={() => formik.setFieldTouched("scanner_machine_id", true)}
              valueKey="_id"
              labelKey="scanner_name"
              multiSelect="true"
              options={machineList || []}
              placeholder="Select Scanner Machine ID "
              id="scanner_machine_id"
            />
            {formik.touched.scanner_machine_id &&
              formik.errors.scanner_machine_id && (
                <p className="text-sm text-red-500">
                  {formik.errors.scanner_machine_id}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expired_date" className="px-1">
              Expired Date
            </Label>
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assgin Scanner
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default AssignScanner;
