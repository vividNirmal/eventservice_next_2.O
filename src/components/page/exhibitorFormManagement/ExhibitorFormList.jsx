"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CustomPagination } from '@/components/common/pagination';
import { Plus, Search, Edit, Trash2, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import { getRequest, deleteRequest, updateRequest } from '@/service/viewService';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
// const ExhibitorFormWizard = dynamic(() => import('./ExhibitorFormWizard'), { ssr: false });
import ExhibitorFormWizard from './ExhibitorFormWizard';
import { ExhibitorFormConfigurationModal } from './components/ExhibitorFormConfigurationModal';
import { useRouter } from "next/navigation";

const ExhibitorFormList = ({ eventId }) => {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [formToEdit, setFormToEdit] = useState(null);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);

  const dataLimits = [10, 20, 30, 50];

  const companyId = localStorage.getItem('companyId');

  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(eventId && { eventId: eventId }),
        ...(companyId && { companyId: companyId }),
      });

      const response = await getRequest(`exhibitor-forms?${params}`);
      
      if (response.status === 1) {
        setForms(response.data.forms || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      } else {
        toast.error(response.message || 'Failed to fetch forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedLimit, searchTerm, selectedStatus, eventId, companyId]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

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

  const handleTogglePublish = useCallback(async (form) => {
    const newStatus = form.status === 'published' ? 'unpublished' : 'published';
    
    try {
      const response = await updateRequest(`exhibitor-forms-status/${form._id}`, {
        status: newStatus
      });
      
      if (response.status === 1) {
        toast.success(`Form ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        fetchForms();
      } else {
        toast.error(response.message || 'Failed to update form status');
      }
    } catch (error) {
      console.error('Error updating form status:', error);
      toast.error('Failed to update form status');
    }
  }, [fetchForms]);

  const openDeleteDialog = useCallback((form) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((form) => {
    setFormToEdit(form);
    setSelectedConfiguration(form.ExhibitorFormConfiguration);
    setIsWizardOpen(true);
  }, []);

  const openAddDialog = useCallback(() => {
    // Open configuration selection modal instead of wizard directly
    setIsConfigModalOpen(true);
  }, []);

  const handleConfigurationSelect = useCallback((configuration) => {
    setSelectedConfiguration(configuration);
    setIsConfigModalOpen(false);
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

  const handleWizardClose = useCallback(() => {
    setIsWizardOpen(false);
    setFormToEdit(null);
    setSelectedConfiguration(null); // Reset selected configuration when wizard closes
  }, []);

  const handleWizardSuccess = useCallback(() => {
    setIsWizardOpen(false);
    setFormToEdit(null);
    setSelectedConfiguration(null); // Reset selected configuration on success
    fetchForms();
  }, [fetchForms]);

  const handleNavigateToParticulars = ((formId) => {
    router.push(`/dashboard/event-host/${eventId}/exhibitor-forms/${formId}/exhibitor-forms-particular`);
  });

  return (
    <>
      <Card>
        <CardHeader className={'px-0'}>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Manage Form</CardTitle>
                <CardDescription className={"hidden"}>
                  Empower your exhibitors with user-friendly platform to effortlessly get all custom forms for seamless data collection. Enhance their stall services by capturing crucial information. Simplify the exhibitor experience and ensure a successful event with our powerful Exhibitor Form Module.
                </CardDescription>
              </div>
              <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Form
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No forms found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <Card key={form._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-blue-600">
                            {form.basicInfo?.full_name}
                          </h3>
                          {form.basicInfo?.is_mendatory && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                              <span className="mr-1">⚠</span> Required
                            </Badge>
                          )}
                          {form.ExhibitorFormConfiguration && (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                              Config: {form.ExhibitorFormConfiguration?.configName || 'N/A'}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          Form description
                        </p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-blue-600">
                            <span className="font-medium">Deadline:</span>
                            <span>
                              {form.basicInfo?.due_date 
                                ? formatDate(form.basicInfo.due_date)
                                : 'Not set'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          {form.status === 'published' ? (
                            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Unpublished
                            </Badge>
                          )}
                        </div>

                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => toast.info('Submission functionality coming soon')}
                        >
                          Submission
                        </Button>
                        
                        {form.ExhibitorFormConfiguration && form?.ExhibitorFormConfiguration?.hasParticulars && (
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleNavigateToParticulars(form?._id)}
                          >
                            Particular
                          </Button>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(form)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublish(form)}>
                              {form.status === 'published' ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(form)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={selectedLimit}
                totalEntries={totalCount}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Selection Modal */}
      <ExhibitorFormConfigurationModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigurationSelect={handleConfigurationSelect}
      />

      {/* Exhibitor Form Wizard */}
      <ExhibitorFormWizard
        eventId={eventId}
        isOpen={isWizardOpen}
        onClose={handleWizardClose}
        onSuccess={handleWizardSuccess}
        editData={formToEdit}
        selectedConfiguration={selectedConfiguration}
      />
    </>
  );
};

export default React.memo(ExhibitorFormList);