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
          <DialogHeader className={'gap-1'}>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Label className={'min-w-24'} htmlFor="typeName">Type Name *</Label>
              <div className="w-2/4 grow relative pb-3.5">
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
                  <span className="absolute -bottom-1 left-0 text-red-500 text-xs mt-1">{formik.errors.typeName}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className={'min-w-24'} htmlFor="order">Order</Label>
              <div className="w-2/4 grow">
                <Input
                  id="order"
                  name="order"
                  type="number"
                  value={formik.values.order}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`col-span-3 ${
                    formik.touched.order && formik.errors.order
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="Enter order (number)"
                />
                {formik.touched.order && formik.errors.order && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.order}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || !formik.isValid}>
              {loading ? mode === "add" ? "Creating..." : "Updating..." : mode === "add" ? "Create User Type" : "Update User Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserTypeModal;
