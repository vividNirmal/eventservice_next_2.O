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
import { TrashIcon, PlusIcon, Loader2 } from "lucide-react";
import { deleteRequest, getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import moment from "moment";

export function EventCategoryModal({ open, onOpenChange }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategory();
    }
  }, [open]);

  async function fetchCategory() {
    setFetchLoading(true);
    try {
      const responce = await getRequest("get-event-category");
      if (responce.data) {
        setCategories(responce.data.eventCategories);
      }
    } catch (error) {
      toast.error("Category fetch error");
    } finally {
      setFetchLoading(false);
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      const response = await postRequest("store-event-category", {
        title: newCategory,
      });
      const data = await response.data;
      if (data) {
        setCategories(data?.eventCategory);
        toast.success("Category added successfully");
      }
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      const response = await deleteRequest(`delete-event-category/${id}`, {
        method: "DELETE",
      });
      if (response.status == 1) {
        fetchCategory();
        toast.success("Category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Event Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Category Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              disabled={loading || fetchLoading}
            />
            <Button
              onClick={handleAddCategory}
              disabled={loading || fetchLoading || !newCategory.trim()}
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
                  Add Category
                </>
              )}
            </Button>
          </div>

          {/* Categories Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
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
                      <span>Loading categories...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-8"
                  >
                    No categories found
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