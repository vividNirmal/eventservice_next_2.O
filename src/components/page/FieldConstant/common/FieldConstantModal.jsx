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

const FieldConstant = ({
  open,
  onOpenChange,
  title,
  description,
  formik,
  onCancel,
  loading,
  mode = "add", // "add" or "edit"
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'p-4'}>
        <form onSubmit={formik.handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="grid gap-4 pt-4 pb-6">
            <div className="flex flex-row items-center gap-2">
              <Label htmlFor="param_name" className="min-w-24">Param Name</Label>
              <div className="relative pb-3.5 w-2/4 grow">
                <Input
                  id="param_name"
                  name="param_name"
                  value={formik.values.param_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`col-span-3 ${
                    formik.touched.param_name && formik.errors.param_name
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="Enter user type name"
                />
                {formik.touched.param_name && formik.errors.param_name && (
                  <div className="text-red-500 text-xs mt-1 absolute left-0 -bottom-1">
                    {formik.errors.param_name}
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
            <Button type="submit" disabled={loading || !formik.isValid}>
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

export default FieldConstant;
