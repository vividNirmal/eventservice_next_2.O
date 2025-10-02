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

export function FormFieldAddDrawer({
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
  const fieldTypeOptions = [
    { value: "text", title: "Text" },
    { value: "textarea", title: "Textarea" },
    { value: "email", title: "Email" },
    { value: "number", title: "Number" },
    { value: "date", title: "Date" },
    { value: "checkbox", title: "Checkbox" },
    { value: "radio", title: "Radio" },
    { value: "select", title: "Select" },
    { value: "file", title: "File" },
    { value: "password", title: "Password" },
    { value: "url", title: "URL" },
    { value: "tel", title: "Telephone" },
    { value: "hidden", title: "Hidden" },
  ];
  const BooleanOptions = [
    { value: "yes", title: "Yes" },
    { value: "no", title: "No" },
  ];

  const userType = [
    { value: "Event Attendee", title: "Event Attendee" },
    { value: "Exhibiting Company", title: "Exhibiting Company" },
    { value: "Sponsor", title: "Sponsor" },
    { value: "Speaker", title: "Speaker" },
    { value: "Service Provider", title: "Service Provider" },
    { value: "Accompanying", title: "Accompanying" },
  ];
  const formik = useFormik({
    initialValues: {
      fieldName: "",
      fieldType: "",
      isRequired: false,
      placeHolder: "",
      requiredErrorText: "",
      fieldOptions: [],
      userType: [],
      fieldDescription: "",
      fieldminLimit: "",
      fieldmaxLimit: "",
      specialCharactor: false,
    },
    validationSchema: Yup.object({
      fieldName: Yup.string().required("Name is required"),
      fieldType: Yup.string().required("Field Type is required"),
      fieldOptions: Yup.array().when("fieldType", {
        is: (val) => ["radio", "checkbox", "select"].includes(val),
        then: (schema) => schema.min(1, "At least one option is required"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        if (editUser) {
          // Edit mode
          formData.append("fieldName", values.fieldName);
          formData.append("fieldType", values.fieldType);
          if (values.isRequired == "yes") {
            formData.append("isRequired", true);
          } else {
            formData.append("isRequired", false);
          }
          if (values.requiredErrorText) {
            formData.append("requiredErrorText", values.requiredErrorText);
          }
          if (["radio", "checkbox", "select"].includes(values.fieldType)) {
            values.fieldOptions.forEach((opt, index) => {
              formData.append(`fieldOptions[${index}]`, opt);
            });
          }
          values.userType.forEach((otp, index) => {
            formData.append(`userType[${index}]`, otp);
          });
          
          // Append additional fields if their values are not null or empty
          const fields = ['placeHolder', 'fieldDescription', 'fieldminLimit', 'fieldmaxLimit'];
          fields.forEach((field) => {
            if (values[field] !== undefined && values[field] !== null && values[field] !== "") {
              formData.append(field, values[field]);
            }
          });
          
          

          const response = await postRequest(
            `update-default-field/${editUser._id}`,
            formData
          );

          if (response.status == 1) {
            toast.success("User updated successfully");
            onClose();
            refetch(true);
          }
        } else {
          // Add mode
          formData.append("fieldName", values.fieldName);
          formData.append("fieldType", values.fieldType);
          if (values.isRequired == "yes") {
            formData.append("isRequired", true);
          } else {
            formData.append("isRequired", false);
          }

          if (values.requiredErrorText) {
            formData.append("requiredErrorText", values.requiredErrorText);
          }
          if (["radio", "checkbox", "select"].includes(values.fieldType)) {
            values.fieldOptions.forEach((opt, index) => {
              formData.append(`fieldOptions[${index}]`, opt);
            });
          }
          
          

          // Append additional fields if their values are not null or empty
          const fields = ['placeHolder', 'fieldDescription', 'fieldminLimit', 'fieldmaxLimit'];
          fields.forEach((field) => {
            if (values[field] !== undefined && values[field] !== null && values[field] !== "") {
              formData.append(field, values[field]);
            }
          });

          values.userType.forEach((otp, index) => {
            formData.append(`userType[${index}]`, otp);
          });
          const response = await postRequest("store-default-field", formData);

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
    formik.resetForm();
    if (editUser) {
      formik.setValues({
        fieldName: editUser.fieldName || "",
        fieldType: editUser.fieldType || "",
        placeHolder: editUser.placeHolder || "",
        requiredErrorText: editUser.requiredErrorText || "",
        fieldOptions: editUser.fieldOptions || [],
        userType: editUser.userType || [],
        isRequired: editUser.isRequired === true ? "yes" : "no",
        fieldDescription : editUser.fieldDescription || '',
        fieldminLimit : editUser.fieldminLimit|| "",
        fieldmaxLimit : editUser.fieldmaxLimit,
        specialCharactor: editUser.specialCharactor === true ? "yes" : "no",
      });
    }
  }, [editUser, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>{editUser ? "Edit Field" : "Add Field"}</SheetTitle>
          <SheetDescription>
            {editUser ? "Update field information" : "Create a new field"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              name="fieldName"
              placeholder="Enter fieldName"
              value={formik.values.fieldName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.fieldName && formik.errors.fieldName && (
              <p className="text-sm text-red-500">{formik.errors.fieldName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <CustomCombobox
              name="fieldType"
              value={formik.values.fieldType}
              onChange={(value) => formik.setFieldValue("fieldType", value)}
              onBlur={() => formik.setFieldTouched("fieldType", true)}
              valueKey="value"
              labelKey="title"
              options={fieldTypeOptions || []}
              placeholder="Select Field Type"
              id="fieldType"
            />
            {formik.touched.fieldType && formik.errors.fieldType && (
              <p className="text-sm text-red-500">{formik.errors.fieldType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isRequired">Is Field Required?</Label>
            <CustomCombobox
              name="isRequired"
              value={formik.values.isRequired}
              onChange={(value) => formik.setFieldValue("isRequired", value)}
              valueKey="value"
              labelKey="title"
              search={false}
              options={BooleanOptions || []}
              placeholder="Select Field Required"
              id="isRequired"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isRequired">User To Allow</Label>
            <CustomCombobox
              name="userType"
              value={formik.values.userType}
              onChange={(value) => formik.setFieldValue("userType", value)}
              onBlur={() => formik.setFieldTouched("userType", true)}
              valueKey="value"
              labelKey="title"
              multiSelect={true}
              options={userType || []}
              placeholder="Select User Type to allow"
              id="userType"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeHolder">Place Holder</Label>
            <Input
              id="placeHolder"
              name="placeHolder"
              type="text"
              placeholder="Enter placeHolder address"
              value={formik.values.placeHolder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.placeHolder && formik.errors.placeHolder && (
              <p className="text-sm text-red-500">
                {formik.errors.placeHolder}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredErrorText">Required Error Text</Label>
            <Input
              id="requiredErrorText"
              name="requiredErrorText"
              type="text"
              placeholder="Enter requiredErrorText address"
              value={formik.values.requiredErrorText}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>

          {["radio", "checkbox", "select"].includes(
            formik.values.fieldType
          ) && (
            <div className="space-y-2">
              <Label>Options</Label>

              <div className="space-y-2">
                {formik.values.fieldOptions?.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formik.values.fieldOptions];
                        newOptions[index] = e.target.value;
                        formik.setFieldValue("fieldOptions", newOptions);
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        const newOptions = formik.values.fieldOptions.filter(
                          (_, i) => i !== index
                        );
                        formik.setFieldValue("fieldOptions", newOptions);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    formik.setFieldValue("fieldOptions", [
                      ...(formik.values.fieldOptions || []),
                      "",
                    ])
                  }
                >
                  + Add Option
                </Button>
              </div>

              {formik.touched.fieldOptions && formik.errors.fieldOptions && (
                <p className="text-sm text-red-500">
                  {formik.errors.fieldOptions}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fieldDescription">Field Description</Label>
            <Input
              id="fieldDescription"
              name="fieldDescription"
              type="text"
              placeholder="Enter Field Description address"
              value={formik.values.fieldDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="fieldminLimit">Field Minum length</Label>
            <Input
              id="fieldminLimit"
              name="fieldminLimit"
              type="text"
              placeholder="Enter Field Minimum Lenght"
              value={formik.values.fieldminLimit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldmaxLimit">Field Maximum length </Label>
            <Input
              id="fieldmaxLimit"
              name="fieldmaxLimit"
              type="text"
              placeholder="Enter Field Maximum Lenght"
              value={formik.values.fieldmaxLimit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialCharactor">Is special Charactor?</Label>
            <CustomCombobox
              name="specialCharactor"
              value={formik.values.specialCharactor}
              onChange={(value) => formik.setFieldValue("specialCharactor", value)}
              valueKey="value"
              labelKey="title"
              search={false}
              options={BooleanOptions || []}
              placeholder="Select Field Required"
              id="specialCharactor"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editUser ? "Update Field" : "Add Field"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
