"use client";

import { useState, useEffect } from "react";
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
  Building,
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
import { Switch } from "@/components/ui/switch";
import AddCompany from "./addCompany";
import { useDebounce } from "@/utils/debounce";
// import AddScanner from "./AddScanner";
// import AssignScanner from "./AssignScanner";

export default function EventCompany() {
  const [companyList, setCompanyList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showDrawerAdd, setShowDrawerAdd] = useState(false);
  const [editCompany, setEditCompany] = useState(null);  
  const [deleteDialog, setDeleteDialog] = useState({ open: false, users: [] });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, company: null });
  const dataLimits = [10, 20, 30, 50];
  const debouncedSearch = useDebounce(searchTerm);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getRequest(
        `get-company-list?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
          searchTerm
        )}`
      );
      if (res.status === 1) {
        setCompanyList(res.data?.company);
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
    fetchCompanies();
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

  const getSrNumber = (index) => {
    return (currentPage - 1) * selectedLimit + index + 1;
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedCompany);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedCompany(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCompany(new Set(companyList.map((blog) => blog._id)));
    } else {
      setSelectedCompany(new Set());
    }
  };

  const handleDeleteUser = (userId) => {
    setDeleteDialog({ open: true, users: [userId] });
  };

  const handleBulkDelete = () => {
    if (selectedCompany.size > 0) {
      setDeleteDialog({ open: true, users: Array.from(selectedCompany) });
    }
  };
  const confirmDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("company_ids[]", deleteDialog.users);
      const result = await postRequest("delete-company", formData);
      if (result.status == 1) {
        toast.success("Company deleted successfully");
        setSelectedCompany(new Set());
        fetchCompanies();
        setDeleteDialog({ open: false, users: [] });
      }
    } catch (error) {
      toast.error("Failed to delete scanner");
    }
  };
   const confirmStatusChange = async () => {
    setStatusLoading(true);
    try {
      const formData = new FormData();
      formData.append("company_id", statusDialog.company._id);
      formData.append("status", statusDialog.company.status === 0 ? "1" : "0");
      const result = await postRequest('update-company-status',formData) ;
      if (result.status === 1) {
        fetchCompanies(currentPage, selectedLimit, searchTerm);
        setStatusDialog({ open: false, company: null });
      } else {
        toast.error("Status update failed", { description: result.message || "" });
      }
    } catch (error) {
      toast.error("Status update failed", { description: error?.message || "" });
    } finally {
      setStatusLoading(false);
    }
  };

  function handleAdd() {
    setShowDrawerAdd(true);
  }
    const handleStatusChange = (company) => {
    setStatusDialog({ open: true, company });
  };

  function handleEdit(id) {
    setEditCompany(id);
    setShowDrawerAdd(true);
  }

  function handleAddhandle (){
    setShowDrawerAdd(false);
    if(editCompany){
      setEditCompany(null)
    }
  }
  const handleFormSubmit = async (formData) => {
    if (formData) {
      fetchCompanies();
    }
  };

  const handleStatusClose=()=>{
    if(!statusLoading){
      setStatusDialog({ open: false, company: null })
    }
  }


  return (
    <>
      <Card className={"gap-0 py-3 shadow-none"}>
        <CardHeader className={"flex flex-wrap items-center px-3 gap-3"}>
          <CardTitle>Company List</CardTitle>
          <div className="flex items-center space-x-3 ml-auto">
            {selectedCompany.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedCompany.size})
              </Button>
            )}

            <Button onClick={handleAdd}>
              <Building className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search "
                value={searchTerm}
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
                            selectedCompany.size === companyList.length &&
                            companyList.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Sr.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>GST Number</TableHead>
                      <TableHead>Owner/Handler</TableHead>
                      <TableHead>First Email</TableHead>
                      <TableHead>Second Email</TableHead>
                      <TableHead>Sub Domain</TableHead>
                      <TableHead> Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyList.length > 0 ? (
                      companyList.map((company, index) => (
                        <TableRow key={company._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCompany.has(company._id)}
                              onCheckedChange={() =>
                                handleSelectUser(company._id)
                              }
                            />
                          </TableCell>
                          <TableCell>{getSrNumber(index)}</TableCell>
                          <TableCell className="font-medium">{company.company_name}</TableCell>
                          <TableCell className="font-medium">{company.address}</TableCell>
                          <TableCell className="font-medium">{company.gst_number}</TableCell>
                          <TableCell className="font-medium">{company.owner_name}</TableCell>
                          <TableCell className="font-medium">{company.email_one}</TableCell>
                          <TableCell className="font-medium">{company.email_two ? company.email_two : "N/A" }</TableCell>
                          <TableCell className="font-medium">{company.subdomain}</TableCell>                         
                          <TableCell>
                          <Switch
                            checked={company.status == 1}
                            onClick={() => handleStatusChange(company)}
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
                                  onClick={() => handleEdit(company._id)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>                               
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(company._id)}
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
                        <TableCell colSpan={11} className="h-24 text-center">
                          Company not found.
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

      <AddCompany
        isOpen={showDrawerAdd}
        onClose={handleAddhandle}
        refetch={handleFormSubmit}
        editCompany={editCompany}
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
        isOpen={statusDialog.open}
        onClose={handleStatusClose}
        onConfirm={confirmStatusChange}
        user={statusDialog.company}
        loading={statusLoading}
      />
    </>
  );
}
