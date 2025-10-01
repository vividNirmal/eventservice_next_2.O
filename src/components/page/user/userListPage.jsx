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
import { UserFormDrawer } from "./addUser";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { StatusConfirmationDialog } from "@/components/common/statuschangeDialog";
import { getRequest, postRequest } from "@/service/viewService";

function UserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [userList, setUserList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showDrawer, setShowDrawer] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [statusDialog, setStatusDialog] = useState({ open: false, user: null });
  const dataLimits = [10, 20, 30, 50];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getRequest(
        `get-admin-user-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (res.status === 1) {
        setUserList(res.data?.users || []);
        setTotalUsers(res.data.totalUsers);
        setTotalPages(res.data.totalPages);
        // setCurrentPage(res.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedLimit, searchTerm]);

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
      setSelectedUsers(new Set(userList.map((user) => user._id)));
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

  const handleStatusChange = (user) => {
    setStatusDialog({ open: true, user });
  };

  const handleFormSubmit = async (formData) => {
    if (formData) {
      fetchUsers();
    }
  };

  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("users_ids[]", deleteDialog.users);
      const result = await postRequest("delete-admin-user", formData);
      if (result.status == 1) {
        toast.success("Users deleted successfully");
        setSelectedUsers(new Set());
        fetchUsers();
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Failed to delete users");
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
      <Card className={"gap-0 py-3 shadow-none"}>
        <CardHeader className={"flex flex-wrap items-center px-3 gap-3"}>
          <CardTitle>User List</CardTitle>
          <div className="flex items-center space-x-3 ml-auto">
            {selectedUsers.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedUsers.size})
              </Button>
            )}
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search "
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedLimit.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-[100px]">
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
        </CardHeader>
      </Card>
      <CardContent className={"grow flex flex-col"}>
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
                        <Checkbox
                          checked={
                            selectedUsers.size === userList.length &&
                            userList.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sr.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userList.length > 0 ? (
                      userList.map((user, index) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user._id)}
                              onCheckedChange={() => handleSelectUser(user._id)}
                            />
                          </TableCell>
                          <TableCell>{getSrNumber(index)}</TableCell>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            <Switch
                              checked={user.status == 1}
                              onClick={() => handleStatusChange(user)}
                            />
                          </TableCell>
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
                          No users found.
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

      {/* User Form Drawer */}
      <UserFormDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        refetch={handleFormSubmit}
        editUser={editUser}
        loading={loading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, users: [] })}
        onConfirm={confirmDelete}
        title={deleteDialog.users.length > 1 ? "Delete Users" : "Delete User"}
        description={
          deleteDialog.users.length > 1
            ? `Are you sure you want to delete ${deleteDialog.users.length} users? This action cannot be undone.`
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        loading={loading}
      />

      {/* Status Confirmation Dialog */}
      <StatusConfirmationDialog
        isOpen={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, user: null })}
        onConfirm={confirmStatusChange}
        user={statusDialog.user}
        loading={loading}
      />
    </>
  );
}

export default UserList;
