"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomPagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { StatusConfirmationDialog } from "@/components/common/statuschangeDialog";
import { getRequest, postRequest } from "@/service/viewService";
import { FormFieldAddDrawer } from "./addField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/utils/debounce";

export default function FieldLists() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [fieldList, setFieldList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showDrawer, setShowDrawer] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [statusDialog, setStatusDialog] = useState({ open: false, user: null });
  const [activeTab, setActiveTab] = useState("user"); // "user" or "admin"
  
  const dataLimits = [10, 20, 30, 50];
  const debouncedSearch = useDebounce(searchTerm);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab === "admin" && { isAdmin: "true" }),
        ...(activeTab === "user" && { isAdmin: "false" }),
      });

      const res = await getRequest(`get-default-field-list?${params}`);
      if (res.status === 1) {
        setFieldList(res.data?.fields || []);
        setTotalUsers(res.data.totalData);
        setTotalPages(res.data.totalPages);
        // setCurrentPage(res.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      toast.error("Failed to fetch fields");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [currentPage, selectedLimit, debouncedSearch, activeTab]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
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

  const getSrNumber = (index) => {
    return (currentPage - 1) * selectedLimit + index + 1;
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(new Set(fieldList.map((user) => user._id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleAddUser = () => {
    setEditUser(null);
    setShowDrawer(true);
  };

  const handleEditUser = (user) => {
    setEditUser(user);
    setShowDrawer(true);
  };

  const handleDeleteUser = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedUsers) });
    }
  };

  const handleFormSubmit = async (formData) => {
    if (formData) {
      fetchFields();
    }
  };

  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("filed_ids[]", deleteDialog.users);
      const result = await postRequest("default-fields/delete", formData);
      if (result.status == 1) {
        toast.success("Fields deleted successfully");
        setSelectedUsers(new Set());
        fetchFields();
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Failed to delete fields");
    }
  };

  const confirmStatusChange = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", statusDialog.user._id);
      formData.append("status", statusDialog.user.status === 0 ? "1" : "0");
      const result = await postRequest("update-user-status", formData);
      if (result.status === 1) {
        toast.success("User status updated successfully");
        fetchUsers();
        setStatusDialog({ open: false, user: null });
      }
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Error updating user status:", error);}
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: "destructive",
      editor: "default",
      user: "secondary",
    };
    return <Badge variant={variants[role] || "secondary"}>{role}</Badge>;
  };

  return (
    <>
      <Card className={"gap-0 2xl:py-3 2xl:p-5 shadow-none grow border-0 !p-0"}>
        <CardHeader className={"flex flex-col px-0 gap-3"}>
          <CardTitle>Default Fields Management</CardTitle>
          
          {/* Add Tabs for User/Admin Fields */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User Default Fields</TabsTrigger>
              <TabsTrigger value="admin">Admin Default Fields</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className={"grow flex flex-col rounded-xl border border-solid border-zinc-200 p-4 2xl:p-6 shadow-[0_0px_6px_0_rgba(0,0,0,0.07)]"}>
          <div className="flex flex-wrap justify-between pb-4 gap-3">
            <div className="flex items-center space-x-3 grow">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search fields..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="!pl-10" />
              </div>
              <Select value={selectedLimit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {dataLimits.map((limit) => (
                    <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3">
              {selectedUsers.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className={'2xl:text-sm 2xl:h-10'}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedUsers.size})
                </Button>
              )}
              <Button onClick={handleAddUser} className={'2xl:text-sm 2xl:h-10'}>
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === 'admin' ? 'Admin' : 'User'} Field
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="rounded-lg border overflow-auto flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox checked={selectedUsers.size === fieldList.length && fieldList.length > 0} onCheckedChange={handleSelectAll} />
                        </TableHead>
                        <TableHead>Sr.</TableHead>                      
                        <TableHead>Field Name</TableHead>
                        <TableHead>Field Type</TableHead>                      
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fieldList.length > 0 ? (
                        fieldList.map((user, index) => (
                          <TableRow key={user._id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.has(user._id)}
                                onCheckedChange={() => handleSelectUser(user._id)}
                              />
                            </TableCell>
                            <TableCell>{getSrNumber(index)}</TableCell>
                            <TableCell className="font-medium">
                              {user.fieldName}
                            </TableCell>
                            <TableCell>{user.fieldType}</TableCell>                          
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No {activeTab} fields found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {totalUsers > 0 && (
                <div className="mt-4">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    pageSize={selectedLimit}
                    totalEntries={totalUsers}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Field Form Drawer */}
      <FormFieldAddDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} refetch={handleFormSubmit} editUser={editUser} loading={loading} fieldType={activeTab} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog isOpen={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, users: [] })} onConfirm={confirmDelete} title={deleteDialog.users.length > 1 ? "Delete Fields" : "Delete Field"} description={deleteDialog.users.length > 1 ? `Are you sure you want to delete ${deleteDialog.users.length} fields? This action cannot be undone.` : "Are you sure you want to delete this field? This action cannot be undone."} loading={loading} />

      {/* Status Confirmation Dialog */}
      <StatusConfirmationDialog isOpen={statusDialog.open} onClose={() => setStatusDialog({ open: false, user: null })} onConfirm={confirmStatusChange} user={statusDialog.user} loading={loading} />
    </>
  );
}

