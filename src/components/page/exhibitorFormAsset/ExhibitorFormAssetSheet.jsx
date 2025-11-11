// components/ExhibitorFormAssetSheet.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomCombobox } from '@/components/common/customcombox';

export const ExhibitorFormAssetSheet = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
  title,
  submitButtonText,
  eventZones,
}) => {
  const [selectedZone, setSelectedZone] = useState("");

  // Convert eventZones to options for CustomCombobox
  const zoneOptions = eventZones.map(zone => ({
    value: zone._id,
    label: zone.name,
  }));

  const formik = useFormik({
    initialValues: {
      exhibitorFormConfigurationId: initialData?.formConfiguration?._id || "",
      zones: initialData?.zones || [],
    },
    validationSchema: Yup.object({
      zones: Yup.array().of(
        Yup.object({
          zoneId: Yup.string().required(),
          quantity: Yup.number().min(0, "Quantity must be at least 0").required("Quantity is required"),
        })
      ),
    }),
    onSubmit: (values) => onSubmit(values),
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setSelectedZone("");
    }
  }, [isOpen]);

  const handleAddZone = () => {
    if (!selectedZone) return;

    // Check if zone already exists
    const existingZone = formik.values.zones.find(zone => zone.zoneId === selectedZone);
    if (existingZone) {
      // Zone already added, maybe show message?
      return;
    }

    const zoneName = eventZones.find(z => z._id === selectedZone)?.name || "";

    const newZone = {
      zoneId: selectedZone,
      zoneName: zoneName,
      quantity: 0
    };

    formik.setFieldValue('zones', [...formik.values.zones, newZone]);
    setSelectedZone(""); // Reset selection
  };

  const handleRemoveZone = (zoneId) => {
    const updatedZones = formik.values.zones.filter(zone => zone.zoneId !== zoneId);
    formik.setFieldValue('zones', updatedZones);
  };

  const handleQuantityChange = (zoneId, quantity) => {
    const updatedZones = formik.values.zones.map(zone =>
      zone.zoneId === zoneId ? { ...zone, quantity: parseInt(quantity) || 0 } : zone
    );
    formik.setFieldValue('zones', updatedZones);
  };

  const totalQuantity = formik.values.zones.reduce((sum, zone) => sum + (zone.quantity || 0), 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-gray-200">
          <SheetTitle>{title} - <span className="pl-2 text-sm font-normal text-blue-700">{initialData?.formConfiguration?.configSlug || ""}</span></SheetTitle>
          <SheetDescription className={"hidden"}>
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col grow gap-4 p-4 overflow-y-auto"
        >
          <div>
            <Label>Add Zones and Quantities</Label>
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <CustomCombobox
                  options={zoneOptions}
                  value={selectedZone}
                  onChange={setSelectedZone}
                  placeholder="Select a zone..."
                  searchPlaceholder="Search zones..."
                  emptyMessage="No zones found."
                  multiSelect={false}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddZone}
                disabled={!selectedZone}
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Selected Zones</Label>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{totalQuantity}</span>
              </div>
            </div>
            <div className="space-y-3">
              {formik.values.zones.length === 0 ? (
                <div className="text-center py-4 text-gray-500 border rounded-lg">
                  No zones added yet
                </div>
              ) : (
                formik.values.zones.map((zone) => (
                  <div key={zone.zoneId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium">{zone.zoneName}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={zone.quantity}
                        onChange={(e) => handleQuantityChange(zone.zoneId, e.target.value)}
                        className="w-24 text-right"
                        placeholder="0"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveZone(zone.zoneId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {formik.touched.zones && formik.errors.zones && (
              <p className="text-red-600 text-sm mt-2">
                Please check all zone quantities
              </p>
            )}
          </div>

          <SheetFooter className="flex flex-row justify-end space-x-2 p-6 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_4px_0_rgba(0,0,0,0.07)]">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {submitButtonText}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};