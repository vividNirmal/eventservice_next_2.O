"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Mail,
  Phone,
  User,
  EllipsisVertical,
  Download,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getRequest, deleteRequest } from "@/service/viewService";
import { CustomPagination } from "@/components/common/pagination";
import EventCompanyTeamSheet from "./EventCompanyTeamSheet";

const EventCompanyTeamList = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  
  // Sheet states
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const limits = [10, 20, 30, 50];
  
  // Get exhibitor ID from localStorage
  const getExhibitorId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('loginuser');
      if (userData) {
        const parsed = JSON.parse(userData);
        return  parsed._id;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [search, currentPage, limit, ownershipFilter]);

  const fetchTeamMembers = async () => {
    const exhibitorId = getExhibitorId();
    if (!exhibitorId) {
      toast.error("Exhibitor ID not found");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        eventUser: exhibitorId,
        ...(search && { search }),
        ...(ownershipFilter !== "all" && { ownership: ownershipFilter }),
      });

      const response = await getRequest(`event-company-teams?${params}`);
      if (response.status === 1) {
        setTeamMembers(response.data.teams || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalData || 0);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== limit) {
      setLimit(newSize);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOwnershipFilterChange = (value) => {
    setOwnershipFilter(value);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedMember(null);
    setIsCreating(true);
    setSheetOpen(true);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setIsCreating(false);
    setSheetOpen(true);
  };

  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const response = await deleteRequest(
        `event-company-teams/${memberToDelete._id}`
      );
      if (response.status === 1) {
        toast.success("Team member deleted successfully");
        fetchTeamMembers();
      } else {
        toast.error(response.message || "Failed to delete team member");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast.error("Failed to delete team member");
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleSuccess = () => {
    fetchTeamMembers();
    setSheetOpen(false);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getOwnershipBadgeColor = (ownership) => {
    switch (ownership?.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "partner":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Company Team Members</CardTitle>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Section */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search Bar */}
              <div className="relative grow min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
                <Input
                  placeholder="Search by name, email or phone..."
                  value={search}
                  onChange={handleSearch}
                  className="!pl-10"
                />
              </div>

              {/* Ownership Filter */}
              <Select value={ownershipFilter} onValueChange={handleOwnershipFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>

              {/* Show Limit */}
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Show:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={handleLimitChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {limits.map((l) => (
                      <SelectItem key={l} value={l.toString()}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Member</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            {/* FIX: Use profilePictureUrl instead of profile_picture */}
                            {member.profilePictureUrl && (
                              <AvatarImage 
                                src={member.profilePictureUrl} 
                                alt={`${member.first_name} ${member.last_name}`}
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <AvatarFallback>
                              {getInitials(member.first_name, member.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.first_name} {member.last_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{member.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{member.contact_no}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getOwnershipBadgeColor(member.ownership)}>
                          {member.ownership}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{member.gender}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            {member.city?.name || "N/A"}, {member.state?.name || "N/A"}
                          </div>
                          <div className="text-gray-500">
                            {member.country?.name || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.pan_no || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                            >
                              <EllipsisVertical className="h-5 w-5 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(member)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(member)}
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
                )}
              </TableBody>
            </Table>
          </div>

          {totalCount > limit && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={limit}
              totalEntries={totalCount}
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Sheet */}
      <EventCompanyTeamSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        member={selectedMember}
        isCreating={isCreating}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {memberToDelete?.first_name} {memberToDelete?.last_name} from your team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventCompanyTeamList;