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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { getRequest, postRequest, updateRequest, deleteRequest } from "@/service/viewService";
import { toast } from "sonner";
import { CustomPagination } from "@/components/common/pagination";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import UserTypeMapModal from "./common/UserTypeMapModal";

// Validation Schema
const userTypeMapValidationSchema = Yup.object({
  shortName: Yup.string().required("Short name is required").max(20),
  userType: Yup.string().required("User type is required"),
});

const UserTypeMapList = ({ eventId }) => {
  const router = useRouter();
  const [userTypeMaps, setUserTypeMaps] = useState([]);
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
  const [userTypeMapToEdit, setUserTypeMapToEdit] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userTypeMapToDelete, setUserTypeMapToDelete] = useState(null);

  const dataLimits = [10, 20, 30, 50];

  // Fetch all user types for dropdown
  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const res = await getRequest(`user-types?companyId=${companyId}&limit=100`);
      if (res.status === 1) setUserTypes(res.data.userTypes || []);
    } catch (error) {
      console.error("Error fetching user types:", error);
      toast.error("Failed to fetch user types");
    }
  };

  // Fetch UserTypeMaps with pagination & search
  useEffect(() => {
    fetchUserTypeMaps();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchUserTypeMaps = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(companyId && { companyId }),
      });

      const res = await getRequest(`user-type-maps?${params}`);
      if (res.status === 1) {
        setUserTypeMaps(res.data.userTypeMaps || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching user type maps:", error);
      toast.error("Failed to fetch user type maps");
    } finally {
      setLoading(false);
    }
  };

  // Formik for Add
  const addFormik = useFormik({
    initialValues: {
      shortName: "",
      userType: "",
    },
    validationSchema: userTypeMapValidationSchema,
    onSubmit: async (values) => handleAddUserTypeMap(values),
  });

  // Formik for Edit
  const editFormik = useFormik({
    initialValues: {
      shortName: "",
      userType: "",
    },
    validationSchema: userTypeMapValidationSchema,
    onSubmit: async (values) => handleEditUserTypeMap(values),
    enableReinitialize: true,
  });

  const handleAddUserTypeMap = async (values) => {
    setIsCreating(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const payload = {
        shortName: values.shortName,
        userType: values.userType,
        companyId,
        ...(eventId && { eventId }),
      };

      const res = await postRequest("user-type-maps", payload);
      if (res.status === 1) {
        toast.success("User type mapping created successfully");
        setIsAddModalOpen(false);
        addFormik.resetForm();
        fetchUserTypeMaps();
      } else toast.error(res.message || "Failed to create user type mapping");
    } catch (error) {
      console.error("Error creating user type map:", error);
      toast.error("Failed to create user type mapping");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUserTypeMap = async (values) => {
    if (!userTypeMapToEdit) return;
    setIsUpdating(true);
    try {
      const companyId = localStorage.getItem("companyId");
      const payload = {
        shortName: values.shortName,
        userType: values.userType,
        companyId,
      };

      const res = await updateRequest(`user-type-maps/${userTypeMapToEdit._id}`, payload);
      if (res.status === 1) {
        toast.success("User type mapping updated successfully");
        setIsEditModalOpen(false);
        setUserTypeMapToEdit(null);
        editFormik.resetForm();
        fetchUserTypeMaps();
      } else toast.error(res.message || "Failed to update user type mapping");
    } catch (error) {
      console.error("Error updating user type map:", error);
      toast.error("Failed to update user type mapping");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUserTypeMap = async () => {
    if (!userTypeMapToDelete) return;

    try {
      const res = await deleteRequest(`user-type-maps/${userTypeMapToDelete._id}`);
      if (res.status === 1) {
        toast.success("User type mapping deleted successfully");
        setIsDeleteDialogOpen(false);
        setUserTypeMapToDelete(null);
        fetchUserTypeMaps();
      } else toast.error(res.message || "Failed to delete user type mapping");
    } catch (error) {
      console.error("Error deleting user type map:", error);
      toast.error("Failed to delete user type mapping");
    }
  };

  const openEditModal = (userTypeMap) => {
    setUserTypeMapToEdit(userTypeMap);
    editFormik.setValues({
      shortName: userTypeMap.shortName,
      userType: userTypeMap.userType._id,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (userTypeMap) => {
    setUserTypeMapToDelete(userTypeMap);
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
    setUserTypeMapToEdit(null);
    editFormik.resetForm();
  };

  return (
    <>
      <Card>
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <CardTitle>User Type Mappings</CardTitle>
              <CardDescription>Total {totalCount} mappings found</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {/* Limit Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                <Select value={selectedLimit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dataLimits.map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search mappings..." value={searchTerm} onChange={handleSearch} className="!pl-10 w-64" />
              </div>

              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short Name</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading mappings...
                    </TableCell>
                  </TableRow>
                ) : userTypeMaps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">No mappings found</TableCell>
                  </TableRow>
                ) : (
                  userTypeMaps.map((map) => (
                    <TableRow key={map._id}>
                      <TableCell>{map.shortName}</TableCell>
                      <TableCell>{map.userType?.typeName || "-"}</TableCell>
                      <TableCell>{formatDate(map.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(map)} title="Edit mapping">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openDeleteDialog(map)} title="Delete mapping">
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

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete mapping <strong>{userTypeMapToDelete?.userType?.typeName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUserTypeMap} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Modal */}
      <UserTypeMapModal
        open={isAddModalOpen}
        onOpenChange={(isOpen) => {
            if (!isOpen) resetAddModal(); // Reset form when modal closes
            setIsAddModalOpen(isOpen);
        }}
        title="Add User Type Mapping"
        description="Create a new user type mapping."
        formik={addFormik}
        onCancel={resetAddModal}
        onSubmit={addFormik.handleSubmit}
        loading={isCreating}
        userTypes={userTypes}
        mode="add"
      />

      {/* Edit Modal */}
      <UserTypeMapModal
        open={isEditModalOpen}
        onOpenChange={(isOpen) => {
            if (!isOpen) resetEditModal(); // Reset form when modal closes
            setIsEditModalOpen(isOpen);
        }}
        title="Edit User Type Mapping"
        description="Update the user type mapping information."
        formik={editFormik}
        onCancel={resetEditModal}
        onSubmit={editFormik.handleSubmit}
        loading={isUpdating}
        userTypes={userTypes}
        mode="edit"
      />
    </>
  );
};

export default UserTypeMapList;
