"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomPagination } from "@/components/common/pagination";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  getRequest,
  postRequest,
  updateRequest,
  deleteRequest,
} from "@/service/viewService";
import { toast } from "sonner";
import FieldConstant from "./common/FieldConstantModal";
import { useDebounce } from "@/utils/debounce";

// Validation Schema using Yup
const paramNameValidationSchema = Yup.object({
  param_name: Yup.string()
    .required("Field constant name is required")
    .min(2, "Field constant name must be at least 2 characters")
    .max(50, "Field constant name must be less than 50 characters"),
});

const FieldConstantList = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userTypeToDelete, setUserTypeToDelete] = useState(null);
  const [userTypeToEdit, setUserTypeToEdit] = useState(null);

  const dataLimits = [10, 20, 30, 50];
  const debouncedSearch = useDebounce(searchTerm);

  // Formik for Add Field constant
  const addFormik = useFormik({
    initialValues: {
      param_name: "",
    },
    validationSchema: paramNameValidationSchema,
    onSubmit: async (values) => {
      await handleAddFieldConstant(values);
    },
  });

  // Formik for Edit Field constant
  const editFormik = useFormik({
    initialValues: {
      param_name: "",
    },
    validationSchema: paramNameValidationSchema,
    onSubmit: async (values) => {
      await handleEditFieldConstant(values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    fetchFieldConstant();
  }, [currentPage, selectedLimit, debouncedSearch]);

  const fetchFieldConstant = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`contant-map?${params}`);

      if (response.status === 1) {
        setUserTypes(response.data.fieldConstants || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching Field constants:", error);
      toast.error("Failed to fetch Field constants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFieldConstant = async (values) => {
    setIsCreating(true);
    try {
      const payload = {
        param_name: values.param_name,
      };

      const response = await postRequest("contant-map", payload);

      if (response.status === 1) {
        toast.success("Field constant created successfully");
        setIsAddModalOpen(false);
        addFormik.resetForm();
        fetchFieldConstant();
      } else {
        toast.error(response.message || "Failed to create Field constant");
      }
    } catch (error) {
      console.error("Error creating Field constant:", error);
      toast.error("Failed to create Field constant");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUserType = async () => {
    if (!userTypeToDelete) return;

    try {
      const response = await deleteRequest(
        `contant-map/${userTypeToDelete._id}`
      );

      if (response.status === 1) {
        toast.success("Field constant deleted successfully");
        setIsDeleteDialogOpen(false);
        setUserTypeToDelete(null);
        fetchFieldConstant();
      } else {
        toast.error(response.message || "Failed to delete Field constant");
      }
    } catch (error) {
      console.error("Error deleting Field constant:", error);
      toast.error("Failed to delete Field constant");
    }
  };

  const handleEditFieldConstant = async (values) => {
    if (!userTypeToEdit) return;

    setIsUpdating(true);
    try {
      const payload = {
        param_name: values.param_name,
      };

      const response = await updateRequest(
        `contant-map/${userTypeToEdit._id}`,
        payload
      );

      if (response.status === 1) {
        toast.success("Field constant updated successfully");
        setIsEditModalOpen(false);
        setUserTypeToEdit(null);
        editFormik.resetForm();
        fetchFieldConstant();
      } else {
        toast.error(response.message || "Failed to update Field constant");
      }
    } catch (error) {
      console.error("Error updating Field constant:", error);
      toast.error("Failed to update Field constant");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (userType) => {
    setUserTypeToEdit(userType);
    editFormik.setValues({
      param_name: userType.param_name,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (userType) => {
    setUserTypeToDelete(userType);
    setIsDeleteDialogOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== selectedLimit) {
      setSelectedLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetAddModal = () => {
    setIsAddModalOpen(false);
    addFormik.resetForm();
  };

  const resetEditModal = () => {
    setIsEditModalOpen(false);
    setUserTypeToEdit(null);
    editFormik.resetForm();
  };

  return (
    <>
      <Card className={'grow'}>
        <CardHeader className={"px-0 flex justify-between items-center"}>
          <div className="flex flex-col gap-1">
            <CardTitle>Field Constant</CardTitle>
            <CardDescription>Total {totalCount} field constant found</CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search field constant..." value={searchTerm} onChange={handleSearch} className="!pl-10 w-64" />
            </div>
            {/* ✅ Add Field constant Button */}
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field Constant
            </Button>
            {/* Limit Selector */}
            <div className="flex items-center space-x-2">
              <Select value={selectedLimit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dataLimits.map((limit) => (
                    <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Field Constant</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "
                <strong>{userTypeToDelete?.typeName}</strong>"? This action
                cannot be undone and will permanently remove this field constant.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUserType}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Delete Field Constant
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Loading Field constants...
                    </TableCell>
                  </TableRow>
                ) : userTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No Field constants found
                    </TableCell>
                  </TableRow>
                ) : (
                  userTypes.map((userType) => (
                    <TableRow key={userType._id}>
                      <TableCell className="font-medium">
                        {userType.param_name}
                      </TableCell>
                      <TableCell>{formatDate(userType.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(userType)}
                            title="Edit Field constant"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(userType)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Field constant"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={selectedLimit}
              totalEntries={totalCount}
            />
          )}
        </CardContent>
      </Card>

      <FieldConstant
        open={isAddModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetAddModal(); // Reset form when modal closes
          setIsAddModalOpen(isOpen);
        }}
        title="Add New Field constant"
        description="Create a new Field constant for your application."
        formik={addFormik}
        onCancel={resetAddModal}
        onSubmit={addFormik.handleSubmit}
        loading={isCreating}
        mode="add"
      />

      <FieldConstant
        open={isEditModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetEditModal(); // Reset form when modal closes
          setIsEditModalOpen(isOpen);
        }}
        title="Edit Field constant"
        description="Update the Field constant information."
        formik={editFormik}
        onCancel={resetEditModal}
        onSubmit={editFormik.handleSubmit}
        loading={isUpdating}
        mode="edit"
      />
    </>
  );
};

export default FieldConstantList;
