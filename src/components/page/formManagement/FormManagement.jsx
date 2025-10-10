"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { CustomPagination } from '@/components/common/pagination';
import { Plus, Search, Edit, Trash2, Copy, FileText, Settings } from 'lucide-react';
import { getRequest, postRequest, updateRequest, deleteRequest } from '@/service/viewService';
import { toast } from 'sonner';

const userTypeOptions = [
  'Event Attendee',
  'Exhibiting Company', 
  'Sponsor',
  'Speaker',
  'Service Provider',
  'Accompanying'
];

const FormManagement = ({ eventId }) => {
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isUpdatingForm, setIsUpdatingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);
  const [formToEdit, setFormToEdit] = useState(null);
  const [newForm, setNewForm] = useState({
    formName: '',
    userType: ''
  });
  const [editForm, setEditForm] = useState({
    formName: '',
    userType: ''
  });
  const [userTypes, setUserTypes] = useState([]);

  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchUserTypes();
    fetchForms();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchUserTypes = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const params = new URLSearchParams({
        ...(companyId && { companyId }),
      });

      const response = await getRequest(`user-types?${params}`);
      console.log("Fetched user types:", response);

      if (response.status === 1) {
        setUserTypes(response.data.userTypes || []);
      }
    } catch (error) {
      console.error("Error fetching user types:", error);
      toast.error("Failed to fetch user types");
    }
  };

  const fetchForms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(eventId && { eventId: eventId })
      });

      const response = await getRequest(`forms?${params}`);
      
      if (response.status === 1) {
        setForms(response.data.forms || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddForm = async () => {
    if (!newForm.formName.trim() || !newForm.userType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingForm(true);
    try {
      // Convert object to FormData for postRequest
      const formData = new FormData();
      formData.append('formName', newForm.formName);
      formData.append('userType', newForm.userType);
      // get the companyId from the local storage
      const companyId = localStorage.getItem('companyId');
      if (companyId) {
        formData.append('companyId', companyId);
      }
      if (eventId) {
        formData.append('eventId', eventId);
      }
      
      const response = await postRequest('forms', formData);
      
      if (response.status === 1) {
        toast.success('Form created successfully');
        setIsAddModalOpen(false);
        setNewForm({ formName: '', userType: '' });
        fetchForms();
      } else {
        toast.error(response.message || 'Failed to create form');
      }
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Failed to create form');
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    try {
      const response = await deleteRequest(`forms/${formToDelete._id}`);
      
      if (response.status === 1) {
        toast.success('Form deleted successfully');
        setIsDeleteDialogOpen(false);
        setFormToDelete(null);
        fetchForms();
      } else {
        toast.error(response.message || 'Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
  };

  const handleEditForm = async () => {
    if (!editForm.formName.trim() || !editForm.userType) {
      toast.error('Please fill in all required fields');
      return;
    }

    // get the companyId from the local storage
    const companyId = localStorage.getItem('companyId');

    setIsUpdatingForm(true);
    try {
      // Explicitly create the payload to avoid any extra fields
      const payload = {
        formName: editForm.formName,
        userType: editForm.userType,
        companyId: companyId || null
      };
      
      console.log('Sending edit form data:', payload);
      console.log('Form to edit ID:', formToEdit._id);
      
      const response = await updateRequest(`forms/${formToEdit._id}`, payload);
      
      if (response.status === 1) {
        toast.success('Form updated successfully');
        setIsEditModalOpen(false);
        setFormToEdit(null);
        setEditForm({ formName: '', userType: '' });
        fetchForms();
      } else {
        toast.error(response.message || 'Failed to update form');
      }
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form');
    } finally {
      setIsUpdatingForm(false);
    }
  };

  const handleCopyForm = async (form) => {
    try {
      const textToCopy = `Form Name: ${form.formName}\nUser Type: ${form.userType}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Form details copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy form details');
    }
  };

  const handleFormBuilder = (form) => {
    router.push(`/dashboard/forms/${form._id}/builder`);
  };

  const openEditModal = (form) => {
    setFormToEdit(form);
    setEditForm({
      formName: form.formName,
      userType: form.userType
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (form) => {
    setFormToDelete(form);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserTypeBadgeColor = (userType) => {
    const colors = {
      'Event Attendee': 'bg-blue-100 text-blue-800',
      'Exhibiting Company': 'bg-green-100 text-green-800',
      'Sponsor': 'bg-purple-100 text-purple-800',
      'Speaker': 'bg-orange-100 text-orange-800',
      'Service Provider': 'bg-indigo-100 text-indigo-800',
      'Accompanying': 'bg-pink-100 text-pink-800'
    };
    return colors[userType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Card>
        <CardHeader className={"px-0"}>
          <div className="flex justify-between items-center">
            <div className='flex flex-col gap-1'>
              <CardTitle>Forms List</CardTitle>
              <CardDescription>
                Total {totalCount} forms found
              </CardDescription>
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
                  className="pl-10 w-64"
                />
              </div>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Form
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Form</DialogTitle>
                    <DialogDescription>
                      Create a new form with basic information. You can add fields later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="formName" className="text-right">
                        Form Name *
                      </Label>
                      <Input
                        id="formName"
                        value={newForm.formName}
                        onChange={(e) => setNewForm(prev => ({ ...prev, formName: e.target.value }))}
                        className="col-span-3"
                        placeholder="Enter form name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="userType" className="text-right">
                        User Type *
                      </Label>
                      <Select 
                        value={newForm.userType} 
                        onValueChange={(value) => setNewForm(prev => ({ ...prev, userType: value }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypes?.map((type) => (
                            <SelectItem key={type._id} value={type._id}>
                              {type.typeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isCreatingForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddForm} disabled={isCreatingForm}>
                      {isCreatingForm ? 'Creating...' : 'Create Form'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Form Modal */}
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Form</DialogTitle>
                    <DialogDescription>Update the form name and user type.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editFormName" className="text-right">Form Name *</Label>
                      <Input id="editFormName" value={editForm.formName} onChange={(e) => setEditForm(prev => ({ ...prev, formName: e.target.value }))} className="col-span-3" placeholder="Enter form name" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="editUserType" className="text-right">User Type *</Label>
                      <Select
                        value={editForm.userType}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, userType: value }))}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypes?.map((type) => (
                            <SelectItem key={type._id} value={type._id}>
                              {type.typeName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isUpdatingForm}>Cancel</Button>
                    <Button onClick={handleEditForm} disabled={isUpdatingForm}>{isUpdatingForm ? 'Updating...' : 'Update Form'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Form</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "<strong>{formToDelete?.formName}</strong>"? 
                This action cannot be undone and will permanently remove the form and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteForm}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
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
                  <TableHead>Form Name</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Form Fields</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading forms...
                    </TableCell>
                  </TableRow>
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No forms found
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <TableRow key={form._id}>
                      <TableCell className="font-medium">
                        {form.formName}
                      </TableCell>
                      <TableCell>
                        <Badge className={getUserTypeBadgeColor(form.userType)}>
                          {form?.userType?.typeName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {form.totalElements || 0} fields
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(form.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFormBuilder(form)}
                            title="Manage form fields"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyForm(form)}
                            title="Copy form details"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(form)}
                            title="Edit form"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(form)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete form"
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
              totalCount={totalCount}
              itemsPerPage={selectedLimit}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default FormManagement;
