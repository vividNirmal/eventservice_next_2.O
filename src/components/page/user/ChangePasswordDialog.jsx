// components/user/ChangePasswordDialog.jsx
"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { postRequest } from "@/service/viewService";

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")    
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export function ChangePasswordDialog({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    validateOnMount: false, // Don't validate on mount
    validateOnChange: true, // Validate on change
    validateOnBlur: true,   // Validate on blur
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("user_id", user._id);
        formData.append("password", values.password);

        const result = await postRequest("user-password-change", formData);
        
        if (result.status === 1) {
          toast.success("Password updated successfully");
          formik.resetForm();
          onClose();
        } else {
          toast.error(result.message || "Failed to update password");
        }
      } catch (error) {
        toast.error("An error occurred while updating password");
        console.error("Error updating password:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      formik.resetForm();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    formik.resetForm();
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Update password for <strong>{user?.name}</strong> ({user?.email})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4 mt-4">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter new password"
                className={
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : ""
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            )}          
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Re-enter password"
                className={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-red-500"
                    : ""
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formik.isValid || !formik.dirty}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}