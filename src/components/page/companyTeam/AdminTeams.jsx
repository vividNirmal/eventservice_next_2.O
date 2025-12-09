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
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import AddCompanyMember from "./AddTeamsfomstep/AddTeams";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import { useDebounce } from "@/utils/debounce";

function AdminTeams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [companyTeamList, setCompanyTeamList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showDrawer, setShowDrawer] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const dataLimits = [10, 20, 30, 50];
  const debouncedSearch = useDebounce(searchTerm);

  const fetchCompanyMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ownership: "",
        origin: "",
        all_date: "",
        page: currentPage.toString(),
        pageSize: selectedLimit.toString(),
        search: searchTerm
      });

      const res = await getRequest(`get-company-team-list?${params}`);
      
      if (res.status === 1) {
        setCompanyTeamList(res.data?.companies || []);
        setTotalUsers(res.data?.totalUsers || 0);
        setTotalPages(res.data?.totalPages || 1);
      } else {
        setCompanyTeamList([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching company members:", error);
      setCompanyTeamList([]);
      setTotalUsers(0);
      setTotalPages(1);
      toast.error("Failed to fetch company members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyMembers();
  }, [currentPage, selectedLimit, debouncedSearch]);

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
      setSelectedUsers(new Set(companyTeamList.map((user) => user._id)));
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

  const handleFormSubmit = async (success) => {
    if (success) {
      await fetchCompanyMembers();
      setShowDrawer(false);
      setEditUser(null);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const formData = new FormData();
      deleteDialog.users.forEach((userId) => {
        formData.append('team_ids[]', userId);
      });

      // Use the correct delete endpoint - match with Angular code
      const result = await postRequest('delete-company-team', formData);
      
      if (result.status === 1) {
        toast.success(result.message || "Members deleted successfully");
        setSelectedUsers(new Set());
        await fetchCompanyMembers();
        setDeleteDialog({ open: false, users: [] });
      } else {
        toast.error(result.message || "Failed to delete members");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete members");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Email masking function (from Angular code)
  const maskEmail = (email) => {
    if (!email) return "";
    const [user, domain] = email.split('@');
    const maskedUser = user.slice(0, 3) + '*'.repeat(Math.max(0, user.length - 3));
    return maskedUser + '@' + domain;
  };

  // Contact masking function (from Angular code)  
  const maskContact = (contact) => {
    if (!contact) return "";
    const visibleDigits = 4;
    const maskedPart = '*'.repeat(Math.max(0, contact.length - visibleDigits));
    const visiblePart = contact.slice(-visibleDigits);
    return maskedPart + visiblePart;
  };

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gray-50 mt-4">
      <div className="space-y-4">
        <Card className="gap-0 py-3 shadow-none">
          <CardHeader className="flex flex-wrap items-center px-3 gap-3">
            <CardTitle>Company Members List</CardTitle>
            <div className="flex items-center space-x-3 ml-auto">
              {selectedUsers.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedUsers.size})
                </Button>
              )}
              <Button onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="!pl-10"
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
          <CardContent></CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedUsers.size === companyTeamList.length &&
                          companyTeamList.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Email/Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyTeamList.length > 0 ? (
                    companyTeamList.map((member, index) => (
                      <TableRow key={member._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(member._id)}
                            onCheckedChange={() => handleSelectUser(member._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10">
                              {member.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={member.profile_picture}
                                  alt={`${member.first_name} ${member.last_name}`}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {member.first_name} {member.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.ownership}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.contact_no}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <strong className="font-semibold w-5 text-gray-600">E:</strong>
                              <span className="ml-1">{member.email}</span>
                            </div>
                            <div className="flex items-center">
                              <strong className="font-semibold w-5 text-gray-600">M:</strong>
                              <span className="ml-1">{member.contact_no}</span>
                            </div>
                            <div className="flex items-center">
                              <strong className="font-semibold w-5 text-gray-600">P:</strong>
                              <span className="ml-1">{member.passport_no}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href="#" className="underline text-blue-600">
                            {member.admin_company_id?.company_name || 'N/A'}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="border-b border-dotted border-gray-300 pb-1 block">
                              {member.address_one}
                            </span>
                            <span className="pt-1 block">
                              {member.address_two}
                            </span>
                          </div>
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
                                onClick={() => handleEditUser(member)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(member._id)}
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
                      <TableCell colSpan={7} className="h-24 text-center">
                        Record Not Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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

        <AddCompanyMember
          refetch={handleFormSubmit}
          editUser={editUser}
          isOpen={showDrawer}
          // onClose={() => setShowDrawer(false)}
          onClose={(success) => {
            setShowDrawer(false);
            if (success) handleFormSubmit(true);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, users: [] })}
          onConfirm={confirmDelete}
          title={deleteDialog.users.length > 1 ? "Delete Members" : "Delete Member"}
          description={
            deleteDialog.users.length > 1
              ? `Are you sure you want to delete ${deleteDialog.users.length} members? This action cannot be undone.`
              : "Are you sure you want to delete this member? This action cannot be undone."
          }
          loading={deleteLoading}
        />
      </div>
    </section>
  );
}

export default AdminTeams;