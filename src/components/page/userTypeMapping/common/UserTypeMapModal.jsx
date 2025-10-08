"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserTypeMapModal = ({
  open,
  onOpenChange,
  title,
  description,
  formik,
  onCancel,
  onSubmit,
  loading,
  userTypes = [],
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          {/* User Type */}
          <div>
            <label className="block text-sm font-medium mb-1">User Type</label>
            <Select
              name="userType"
              value={formik.values.userType}
              onValueChange={(value) => formik.setFieldValue("userType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map((ut) => (
                  <SelectItem key={ut._id} value={ut._id}>
                    {ut.typeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.userType && formik.errors.userType && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.userType}</p>
            )}
          </div>
          {/* Short Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Short Name</label>
            <Input
              name="shortName"
              placeholder="Enter short name"
              value={formik.values.shortName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.shortName && formik.errors.shortName && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.shortName}</p>
            )}
          </div>


          {/* Actions */}
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserTypeMapModal;
