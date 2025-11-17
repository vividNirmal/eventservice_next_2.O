"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
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
import UserTypeModal from "./common/UserTypeModal";

// Validation Schema using Yup
const userTypeValidationSchema = Yup.object({
  typeName: Yup.string()
    .required("User type name is required")
    .min(2, "User type name must be at least 2 characters")
    .max(50, "User type name must be less than 50 characters"),
  order: Yup.number()
    .required("Order is required")
    .min(0, "Order must be a positive number")
    .integer("Order must be an integer"),
});

const UserTypeList = () => {
  const router = useRouter();
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

  // Formik for Add User Type
  const addFormik = useFormik({
    initialValues: {
      typeName: "",
      order: 0,
    },
    validationSchema: userTypeValidationSchema,
    onSubmit: async (values) => {
      await handleAddUserType(values);
    },
  });

  // Formik for Edit User Type
  const editFormik = useFormik({
    initialValues: {
      typeName: "",
      order: 0,
    },
    validationSchema: userTypeValidationSchema,
    onSubmit: async (values) => {
      await handleEditUserType(values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    fetchUserTypes();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await getRequest(`user-types?${params}`);

      if (response.status === 1) {
        setUserTypes(response.data.userTypes || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching user types:", error);
      toast.error("Failed to fetch user types");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserType = async (values) => {
    setIsCreating(true);
    try {
      const payload = {
        typeName: values.typeName,
        order: values.order,
      };

      const response = await postRequest("user-types", payload);

      if (response.status === 1) {
        toast.success("User type created successfully");
        setIsAddModalOpen(false);
        addFormik.resetForm();
        fetchUserTypes();
      } else {
        toast.error(response.message || "Failed to create user type");
      }
    } catch (error) {
      console.error("Error creating user type:", error);
      toast.error("Failed to create user type");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUserType = async () => {
    if (!userTypeToDelete) return;

    try {
      const response = await deleteRequest(
        `user-types/${userTypeToDelete._id}`
      );

      if (response.status === 1) {
        toast.success("User type deleted successfully");
        setIsDeleteDialogOpen(false);
        setUserTypeToDelete(null);
        fetchUserTypes();
      } else {
        toast.error(response.message || "Failed to delete user type");
      }
    } catch (error) {
      console.error("Error deleting user type:", error);
      toast.error("Failed to delete user type");
    }
  };

  const handleEditUserType = async (values) => {
    if (!userTypeToEdit) return;

    setIsUpdating(true);
    try {
      const payload = {
        typeName: values.typeName,
        order: values.order,
      };

      const response = await updateRequest(
        `user-types/${userTypeToEdit._id}`,
        payload
      );

      if (response.status === 1) {
        toast.success("User type updated successfully");
        setIsEditModalOpen(false);
        setUserTypeToEdit(null);
        editFormik.resetForm();
        fetchUserTypes();
      } else {
        toast.error(response.message || "Failed to update user type");
      }
    } catch (error) {
      console.error("Error updating user type:", error);
      toast.error("Failed to update user type");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (userType) => {
    setUserTypeToEdit(userType);
    editFormik.setValues({
      typeName: userType.typeName,
      order: userType.order,
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
        <CardHeader className={"px-0"}>
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <CardTitle>User Types</CardTitle>
              <CardDescription>Total {totalCount} user types found</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {/* Limit Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
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

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search user types..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>

              {/* ✅ Add User Type Button */}
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User Type
              </Button>
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
              <AlertDialogTitle>Delete User Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "
                <strong>{userTypeToDelete?.typeName}</strong>"? This action
                cannot be undone and will permanently remove this user type.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUserType}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600 border-red-600 hover:text-white"
              >
                Delete User Type
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Loading user types...
                    </TableCell>
                  </TableRow>
                ) : userTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No user types found
                    </TableCell>
                  </TableRow>
                ) : (
                  userTypes.map((userType) => (
                    <TableRow key={userType._id}>
                      <TableCell className="font-medium">
                        {userType.typeName}
                      </TableCell>
                      <TableCell>{formatDate(userType.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(userType)}
                            title="Edit user type"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(userType)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete user type"
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

      <UserTypeModal
        open={isAddModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetAddModal(); // Reset form when modal closes
          setIsAddModalOpen(isOpen);
        }}
        title="Add New User Type"
        description="Create a new user type for your application."
        formik={addFormik}
        onCancel={resetAddModal}
        onSubmit={addFormik.handleSubmit}
        loading={isCreating}
        mode="add"
      />

      <UserTypeModal
        open={isEditModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) resetEditModal(); // Reset form when modal closes
          setIsEditModalOpen(isOpen);
        }}
        title="Edit User Type"
        description="Update the user type information."
        formik={editFormik}
        onCancel={resetEditModal}
        onSubmit={editFormik.handleSubmit}
        loading={isUpdating}
        mode="edit"
      />
    </>
  );
};

export default UserTypeList;
