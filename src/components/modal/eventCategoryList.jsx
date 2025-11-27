"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon, PlusIcon, Loader2 } from "lucide-react";
import { deleteRequest, getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import moment from "moment";
import { CustomCombobox } from "@/components/common/customcombox";

export function EventCategoryModal({ 
  open, 
  onOpenChange, 
  userRole, 
  userCompanyId 
}) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  
  // NEW: Add company state
  const [companyList, setCompanyList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(userCompanyId);
  const [fetchCompanyLoading, setFetchCompanyLoading] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = userRole === "superadmin" || !userCompanyId;

  // NEW: Fetch companies for super admin
  useEffect(() => {
    if (open && isSuperAdmin) {
      fetchCompanyList();
    }
  }, [open, isSuperAdmin]);

  // FIXED: Fetch categories only when we have a valid company ID
  useEffect(() => {
    if (open) {
      const companyIdToUse = isSuperAdmin ? selectedCompany : userCompanyId;
      
      // Only fetch categories if we have a valid company ID
      if (companyIdToUse && companyIdToUse !== "undefined") {
        fetchCategory(companyIdToUse);
      } else {
        setCategories([]);
      }
    }
  }, [open, selectedCompany, isSuperAdmin, userCompanyId]);

  // NEW: Fetch company list function
  async function fetchCompanyList() {
    setFetchCompanyLoading(true);
    try {
      const response = await getRequest("get-company-list");
      if (response?.data?.company) {
        setCompanyList(response.data.company);
      }
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setFetchCompanyLoading(false);
    }
  }

  // FIXED: Fetch categories function - only when company ID is provided
  async function fetchCategory(company_id) {
    if (!company_id || company_id === "undefined") {
      setCategories([]);
      return;
    }

    setFetchLoading(true);
    try {
      const response = await getRequest(`get-event-category?companyId=${company_id}`);
      if (response.data) {
        setCategories(response.data.eventCategories);
      }
    } catch (error) {
      toast.error("Failed to load shows");
    } finally {
      setFetchLoading(false);
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    // Determine company ID to use
    const companyIdToUse = isSuperAdmin ? selectedCompany : userCompanyId;
    
    if (!companyIdToUse || companyIdToUse === "undefined") {
      toast.error("Please select a company");
      return;
    }

    setLoading(true);
    try {
      const response = await postRequest("store-event-category", {
        title: newCategory,
        company_id: companyIdToUse
      });
      const data = await response.data;
      if (data) {
        fetchCategory(companyIdToUse);
        toast.success("Show added successfully");
      }
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add show");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    // Determine company ID to use
    const companyIdToUse = isSuperAdmin ? selectedCompany : userCompanyId;
    
    setLoading(true);
    try {
      const response = await deleteRequest(`delete-event-category/${id}`, {
        method: "DELETE",
      });
      if (response.status == 1) {
        fetchCategory(companyIdToUse);
        toast.success("Show deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete show");
    } finally {
      setLoading(false);
    }
  };

  // Get appropriate placeholder for input based on company selection
  const getInputPlaceholder = () => {
    if (isSuperAdmin && !selectedCompany) {
      return "Please select a company first";
    }
    return "Enter Shows name...";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Event Shows</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* NEW: Company Selection for Super Admin */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label className="pl-1 block text-sm font-semibold text-slate-700">
                Select Company
              </Label>
              <CustomCombobox
                name="company_id"
                value={selectedCompany}
                onChange={(value) => setSelectedCompany(value)}
                valueKey="_id"
                labelKey="company_name"
                options={companyList}
                placeholder={
                  fetchCompanyLoading ? "Loading companies..." : "Select company"
                }
                disabled={fetchCompanyLoading}
                search={companyList.length > 10}
              />
              {!selectedCompany && (
                <p className="text-red-500 text-xs mt-1">Please select a company to continue</p>
              )}
            </div>
          )}

          {/* Add Category Section */}
          <div className="flex gap-2">
            <Input
              placeholder={getInputPlaceholder()}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              disabled={loading || fetchLoading || (isSuperAdmin && !selectedCompany)}
            />
            <Button
              onClick={handleAddCategory}
              disabled={loading || fetchLoading || !newCategory.trim() || (isSuperAdmin && !selectedCompany)}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  Add Show
                </>
              )}
            </Button>
          </div>

          {/* Categories Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shows Name</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetchLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading shows...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    {isSuperAdmin && !selectedCompany 
                      ? "Please select a company to view shows" 
                      : "No shows found"
                    }
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      {category.title}
                    </TableCell>
                    <TableCell>
                      {moment(category.createdAt).format("D/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category._id)}
                        disabled={loading || fetchLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}