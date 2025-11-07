"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CustomPagination } from '@/components/common/pagination';
import { Plus, Search, Edit, Trash2, Copy, Loader2 } from 'lucide-react';
import { getRequest, deleteRequest } from '@/service/viewService';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
const ExhibitorFormWizard = dynamic(() => import('./ExhibitorFormWizard'), { ssr: false });

const ExhibitorFormList = ({ eventId }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [formToEdit, setFormToEdit] = useState(null);
  const [selectedForms, setSelectedForms] = useState(new Set());

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const dataLimits = [10, 20, 30, 50];

  const companyId = localStorage.getItem('companyId');

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(eventId && { eventId: eventId }),
        ...(companyId && { companyId: companyId }),
      });

      const response = await getRequest(`exhibitor-forms?${params}`);
      
      if (response.status === 1) {
        setForms(response.data.forms || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
        setSelectedForms(new Set());
      } else {
        toast.error(response.message || 'Failed to fetch forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedLimit, debouncedSearchTerm, selectedStatus, eventId]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleSelectForm = useCallback((formId, isChecked) => {
    setSelectedForms(prev => {
      const newSelected = new Set(prev);
      if (isChecked) {
        newSelected.add(formId);
      } else {
        newSelected.delete(formId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAllForms = useCallback((isChecked) => {
    if (isChecked) {
      setSelectedForms(new Set(forms.map(form => form._id)));
    } else {
      setSelectedForms(new Set());
    }
  }, [forms]);

  const handleDeleteForm = useCallback(async () => {
    if (!formToDelete) return;

    try {
      const response = await deleteRequest(`exhibitor-forms/${formToDelete._id}`);
      
      if (response.status === 1) {
        toast.success('Form deleted successfully');
        fetchForms();
      } else {
        toast.error(response.message || 'Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    } finally {
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  }, [formToDelete, fetchForms]);

  const openDeleteDialog = useCallback((form) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((form) => {
    setFormToEdit(form);
    setIsWizardOpen(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setFormToEdit(null);
    setIsWizardOpen(true);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value === 'all' ? '' : value);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedStatus('');
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    const newSize = Number(newLimit);
    if (newSize !== selectedLimit) {
      setSelectedLimit(newSize);
      setCurrentPage(1);
    }
  }, [selectedLimit]);

  const handlePageChange = useCallback((page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [currentPage, totalPages]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getStatusBadgeColor = useMemo(() => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'expired': 'bg-red-100 text-red-800'
    };
    return (status) => colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const handleWizardClose = useCallback(() => {
    setIsWizardOpen(false);
    setFormToEdit(null);
  }, []);

  const handleWizardSuccess = useCallback(() => {
    setIsWizardOpen(false);
    setFormToEdit(null);
    fetchForms();
  }, [fetchForms]);

  return (
    <>
      <Card>
        <CardHeader className={'px-0'}>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Exhibitor Forms</CardTitle>
                <CardDescription>
                  Total {totalCount} forms found
                  {(selectedStatus || searchTerm) && (
                    <span className="text-blue-600 ml-2">(Filtered)</span>
                  )}
                </CardDescription>
              </div>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Form
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select value={selectedLimit.toString()} onValueChange={handleLimitChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataLimits.map(limit => (
                      <SelectItem key={limit} value={limit.toString()}>
                        {limit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="!pl-10 w-64"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select value={selectedStatus || 'all'} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedStatus || searchTerm) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Form</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "<strong>{formToDelete?.basicInfo?.full_name}</strong>"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteForm}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Form
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={forms.length > 0 && selectedForms.size === forms.length}
                      onCheckedChange={handleSelectAllForms}
                    />
                  </TableHead>
                  <TableHead>Form Name</TableHead>
                  <TableHead>Form Number</TableHead>
                  <TableHead>Stall Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading forms...
                    </TableCell>
                  </TableRow>
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <TableRow key={form._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedForms.has(form._id)}
                          onCheckedChange={(checked) => handleSelectForm(form._id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {form.basicInfo?.full_name}
                      </TableCell>
                      <TableCell>
                        {form.basicInfo?.form_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {form.basicInfo?.stall_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(form.status)}>
                          {form.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {form.basicInfo?.due_date ? formatDate(form.basicInfo.due_date) : 'Not set'}
                      </TableCell>
                      <TableCell>
                        {formatDate(form.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(form)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(form)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      <ExhibitorFormWizard
        eventId={eventId}
        isOpen={isWizardOpen}
        onClose={handleWizardClose}
        onSuccess={handleWizardSuccess}
        editData={formToEdit}
      />
    </>
  );
};

export default React.memo(ExhibitorFormList);