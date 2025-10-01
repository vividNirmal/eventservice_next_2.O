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
import { Loader2 } from "lucide-react";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";

export function UserFormDrawer({
  isOpen,
  onClose,
  editUser = null,
  refetch,
  loading = false,
}) {
  const [companyList, setCompanyList] = useState([]);
  const Role = [
    { value: "admin", title: "Admin" },
    { value: "manager", title: "Manager" },
    { value: "customer", title: "Customer" },
  ];
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      company_id: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      role: Yup.string().required("Role is required"),
      company_id: Yup.string().required("Company is required"),
      ...(editUser
        ? {} // In edit mode, password fields are optional
        : {
            password: Yup.string().required("Password is required"),
            confirmPassword: Yup.string()
              .required("Confirm Password is required")
              .oneOf([Yup.ref("password"), null], "Passwords must match"),
          }),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        if (editUser) {
          // Edit mode
          formData.append("user_id", editUser._id);
          formData.append("name", values.name);
          formData.append("email", values.email);
          formData.append("role", values.role);
          formData.append("company_id", values.company_id);

          // Only append password if entered
          if (values.password) {
            formData.append("password", values.password);
          }

          const response = await postRequest("update-admin-users", formData);

          if (response.status == 1) {
            toast.success("User updated successfully");
            onClose();
            refetch(true);
          }
        } else {
          // Add mode
          formData.append("name", values.name);
          formData.append("email", values.email);
          formData.append("password", values.password);
          formData.append("role", values.role);
          formData.append("company_id", values.company_id);

          const response = await postRequest("save-admin-users", formData);

          if (response.status == 1) {
            toast.success("User created successfully");
            onClose();
            refetch(true);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to create user");
      }
    },
  });

  useEffect(() => {
    fetchCompanyList();
    formik.resetForm();
    if (editUser) {
      formik.setValues({
        name: editUser.name || "",
        email: editUser.email || "",
        password: "",
        confirmPassword: "",
        role: editUser.role || "",
        // company_id: editUser.company_id || "",
      });
      if (editUser.company_id && companyList) {
        const matchedCompany = companyList.find(
          (company) => company._id == editUser.company_id
        );
        if (matchedCompany) {
          formik.setFieldValue("company_id", matchedCompany._id);
        }
      }
    }
  }, [editUser, isOpen]);

  async function fetchCompanyList() {
    const responce = await getRequest("get-company-list");
    setCompanyList(responce?.data.company);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>{editUser ? "Edit User" : "Add New User"}</SheetTitle>
          <SheetDescription>
            {editUser ? "Update user information" : "Create a new user account"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="Enter email address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>

          {!editUser && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter password"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirm password"
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="company_id">Role</Label>
            <CustomCombobox
              name="role"
              value={formik.values.role}
              onChange={(value) => formik.setFieldValue("role", value)}
              onBlur={() => formik.setFieldTouched("role", true)}
              valueKey="value"
              labelKey="title"
              options={Role || []}
              placeholder="Select User role"
              id="role"
            />
          </div>
          {formik.touched.role && formik.errors.role && (
            <p className="text-sm text-red-500">{formik.errors.role}</p>
          )}

          {/* Uncomment if CustomCombobox and cities are defined */}
          <div className="space-y-2">
            <Label htmlFor="company_id">Company</Label>
            <CustomCombobox
              name="company_id"
              value={formik.values.company_id}
              onChange={(value) => formik.setFieldValue("company_id", value)}
              onBlur={() => formik.setFieldTouched("company_id", true)}
              valueKey="_id"
              labelKey="company_name"
              options={companyList || []}
              placeholder="Select Company"
              id="company_id"
            />
            {formik.touched.company_id && formik.errors.company_id && (
              <p className="text-sm text-red-500">{formik.errors.company_id}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editUser ? "Update User" : "Add User"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
