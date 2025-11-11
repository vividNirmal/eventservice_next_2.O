// components/ExhibitorFormAssetList.tsx
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CustomPagination } from "@/components/common/pagination";
import {
  getRequest,
  postRequest,
} from "@/service/viewService";
import { ExhibitorFormAssetSheet } from "./ExhibitorFormAssetSheet";

export const ExhibitorFormAssetList = ({ eventId }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventZones, setEventZones] = useState([]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchAssets();
    fetchEventZones();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(eventId && { eventId: eventId }),
        ...(searchTerm && { search: searchTerm }),
      });

      const res = await getRequest(`exhibitor-form-assets?${params}`);
      if (res.status === 1) {
        setAssets(res.data.assets || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.totalData || 0);
      } else toast.error(res.message || "Failed to fetch exhibitor assets");
    } catch (error) {
      console.error("Error fetching exhibitor assets:", error);
      toast.error("Failed to fetch exhibitor assets");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventZones = async () => {
    try {
      const res = await getRequest(`event-zones?eventId=${eventId}&limit=0`);
      if (res.status === 1) {
        setEventZones(res.data.zones || []);
      }
    } catch (error) {
      console.error("Error fetching event zones:", error);
    }
  };

  const openEditSheet = (asset) => {
    setEditingAsset(asset);
    setIsSheetOpen(true);
  };

  const handleUpsert = async (values) => {
    setIsSubmitting(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const payload = { 
        ...values, 
        eventId, 
        companyId,
        zones: values.zones
      };
      
      const res = await postRequest("exhibitor-form-assets/upsert", payload);
      if (res.status === 1) {
        toast.success("Asset allocation saved successfully");
        fetchAssets();
        setIsSheetOpen(false);
        setEditingAsset(null);
      } else {
        toast.error(res.message || "Failed to save asset allocation");
      }
    } catch (error) {
      toast.error("Failed to save asset allocation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Calculate total quantity for an asset
  const getTotalQuantity = (asset) => {
    if (!asset?.zones || asset.zones.length === 0) return 0;
    return asset.zones.reduce((total, zone) => total + (zone.quantity || 0), 0);
  };

  const hasAllocation = (asset) => {
    return asset?.zones && asset?.zones.length > 0;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <Card>
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <CardTitle>Exhibitor Form Assets Allocation</CardTitle>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={selectedLimit.toString()}
                  onValueChange={(v) => {
                    setSelectedLimit(Number(v));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataLimits.map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>
                        {limit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by configuration name, form no, or slug"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form No</TableHead>
                    <TableHead>Configuration Name</TableHead>
                    <TableHead>Configuration Slug</TableHead>
                    <TableHead>Has Particulars</TableHead>
                    <TableHead className="text-center">Total Asset Allocated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <Loader2 className="animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No form configurations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((asset) => {
                      const totalQuantity = getTotalQuantity(asset);
                      return (
                        <TableRow key={asset.formConfiguration._id}>
                          <TableCell className="font-medium">
                            {asset.formConfiguration.formNo}
                          </TableCell>
                          <TableCell>{asset.formConfiguration.configName}</TableCell>
                          <TableCell>{asset.formConfiguration.configSlug}</TableCell>
                          <TableCell>
                            {asset.formConfiguration.hasParticulars ? "Yes" : "No"}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={
                              totalQuantity > 0 
                                ? "text-green-600 font-medium" 
                                : "text-gray-400"
                            }>
                              {totalQuantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditSheet(asset)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {hasAllocation(asset) ? "Edit" : "Allocate"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {totalCount > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={selectedLimit}
              totalEntries={totalCount}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Sheet */}
      <ExhibitorFormAssetSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={handleUpsert}
        isSubmitting={isSubmitting}
        initialData={editingAsset}
        title={
          hasAllocation(editingAsset)
            ? "Edit Allocation" 
            : "Allocate Assets"
        }
        submitButtonText={hasAllocation(editingAsset) ? "Update Allocation" : "Allocate Assets"}
        eventZones={eventZones}
      />
    </>
  );
};

export default ExhibitorFormAssetList;