"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserTypeModal = ({
  open,
  onOpenChange,
  title,
  description,
  formik,
  onCancel,
  onSubmit,
  loading,
  mode = "add", // "add" or "edit"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="typeName" className="text-right">
                Type Name *
              </Label>
              <div className="col-span-3">
                <Input
                  id="typeName"
                  name="typeName"
                  value={formik.values.typeName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`col-span-3 ${
                    formik.touched.typeName && formik.errors.typeName
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="Enter user type name"
                />
                {formik.touched.typeName && formik.errors.typeName && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.typeName}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formik.isValid}
            >
              {loading
                ? mode === "add"
                  ? "Creating..."
                  : "Updating..."
                : mode === "add"
                ? "Create User Type"
                : "Update User Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserTypeModal;
