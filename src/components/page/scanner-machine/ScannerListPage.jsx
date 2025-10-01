"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
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
  Delete,
  Edit,
  Loader2,
  LogOut,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserPlus2Icon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomPagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/common/deleteDialog";
import { toast } from "sonner";
import { StatusConfirmationDialog } from "@/components/common/statuschangeDialog";
import { getRequest, postRequest } from "@/service/viewService";
import moment from "moment";
import AddScanner from "./AddScanner";

function ScannerListPage() {
  const [scannerList, setScannerList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScanner, setSelectedScanner] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDrawerAdd, setShowDrawerAdd] = useState(false);
  const [editScanner, setEditScanner] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [assginDialog, setAssginDialog] = useState({ open: false, user: null });  
  const dataLimits = [10, 20, 30, 50];

  const fetchScanner = async () => {
    setLoading(true);
    try {
      const res = await getRequest(
        `get-scanner-machine-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (res.status === 1) {
        setScannerList(res.data?.scannermachine);
        setTotalUsers(res.data.totalUsers);
        setTotalPages(res.data.totalPages);
        // setCurrentPage(res.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching scanners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanner();
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
    const newSelected = new Set(selectedScanner);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedScanner(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedScanner(new Set(scannerList.map((blog) => blog._id)));
    } else {
      setSelectedScanner(new Set());
    }
  };

  const handleDeleteUser = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };

  const handleBulkDelete = () => {
    if (selectedScanner.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedScanner) });
    }
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("scannerMachine_ids[]", deleteDialog.users);
      const result = await postRequest("delete-scanner-machine", formData);
      if (result.status == 1) {
        toast.success("Scanner deleted successfully");
        setSelectedScanner(new Set());
        fetchScanner();
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Failed to delete scanner");
    }
  };
  const confirmassginChange = async () => {
    try {
      const formData = new FormData();
      formData.append("scannerMachine_ids[]", assginDialog.user._id);
      const result = await postRequest(
        "remove-assign-scanner-machine",
        formData
      );
      if (result.status === 1) {
        fetchScanner(currentPage, selectedLimit, searchTerm);
        toast.success("Scanner removed from assign successfully");
        setAssginDialog({ open: false, user: null });
      }
    } catch (error) {}
  };

  function handleAdd() {
    setShowDrawerAdd(true);
  }

  function handleEdit(id) {
    setEditScanner(id);
    setShowDrawerAdd(true);
  }

  function handleRemoveAssign(id) {
    setAssginDialog({ open: true, user: id });
  }

  const handleFormSubmit = async (formData) => {
    if (formData) {
      fetchScanner();
    }
  };

  async function removeAlldevice() {
    const responce = await scannerModuleservice.logOutAllDevice();
    if (responce.status == 1) {
      toast.success("success logout");
    }
  }

  return (
    <>
      <Card className={"gap-0 py-3 shadow-none"}>
        <CardHeader className={"flex flex-wrap items-center px-3 gap-3"}>
          <CardTitle>Scanner</CardTitle>
          <div className="flex items-center space-x-3 ml-auto">
            {selectedScanner.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedScanner.size})
              </Button>
            )}
            <Button onClick={removeAlldevice}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout all Devices
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add & Assign Scanner Machine
            </Button>
            {/* <Button onClick={handleAssign}>
              <UserPlus2Icon className="h-4 w-4 mr-2" />
              Assign Scanner Machine
            </Button> */}
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
                            selectedScanner.size === scannerList.length &&
                            scannerList.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sr.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Scanner Unique ID</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Expired Date</TableHead>
                      {/* <TableHead>Status</TableHead> */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scannerList.length > 0 ? (
                      scannerList.map((scanner, index) => (
                        <TableRow key={scanner._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedScanner.has(scanner._id)}
                              onCheckedChange={() =>
                                handleSelectUser(scanner._id)
                              }
                            />
                          </TableCell>
                          <TableCell>{getSrNumber(index)}</TableCell>
                          <TableCell className="font-medium">
                            {scanner.scanner_name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {scanner.scanner_unique_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {scanner.company_id === "-" || !scanner.company_id
                              ? "N/A"
                              : scanner.company_id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {scanner.expired_date === "-" ||
                            !scanner.expired_date
                              ? "N/A"
                              : moment(scanner.expired_date).format(
                                  "DD/MM/YYYY"
                                )}
                          </TableCell>
                          {/* <TableCell>
                            <Switch
                              checked={scanner.status == 1}
                              onClick={() => handleStatusChange(scanner)}
                            />
                          </TableCell> */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(scanner._id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRemoveAssign(scanner)}
                                >
                                  <Delete className="mr-2 h-4 w-4" />
                                  Remove Assign
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(scanner._id)}
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

      <AddScanner
        isOpen={showDrawerAdd}
        onClose={() => {
          setShowDrawerAdd(false);
          setEditScanner(null); // Reset edit state
        }}
        refetch={handleFormSubmit}
        editScanner={editScanner}
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
      <StatusConfirmationDialog
        isOpen={assginDialog.open}
        onClose={() => setAssginDialog({ open: false, user: null })}
        onConfirm={confirmassginChange}
        user={assginDialog.user}
        loading={loading}
      />
    </>
  );
}

export default ScannerListPage;
