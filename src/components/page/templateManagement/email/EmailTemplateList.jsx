"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CustomPagination } from '@/components/common/pagination';
import { TemplateFormSheet } from '../components/TemplateFormSheet';
import { DeleteConfirmationDialog } from '@/components/common/deleteDialog';
import { Plus, Search, Edit, Trash2, Copy, Mail } from 'lucide-react';
import { getRequest, postRequest, updateRequest, deleteRequest } from '@/service/viewService';
import { toast } from 'sonner';


const EmailTemplateList = () => {
  const [templates, setTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateToEdit, setTemplateToEdit] = useState(null);

  const dataLimits = [10, 20, 30, 50];

  useEffect(() => {
    fetchTemplates();
    fetchTemplateTypes();
  }, [currentPage, selectedLimit, searchTerm]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        type: 'email',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await getRequest(`templates?${params}`);
      
      if (response.status === 1) {
        setTemplates(response.data.templates || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const params = new URLSearchParams({
        type: 'email'
      });

      const response = await getRequest(`template-types?${params}`);
      
      if (response.status === 1) {
        setTemplateTypes(response.data.templateTypes || []);
      }
    } catch (error) {
      console.error('Error fetching template types:', error);
      toast.error('Failed to fetch template types');
    }
  };

  const handleCreateTemplate = async (values) => {
    setIsCreating(true);
    try {
      const payload = {
        ...values,
        type: 'email'
      };
      
      const response = await postRequest('templates', payload);
      
      if (response.status === 1) {
        toast.success('Email template created successfully');
        setIsFormOpen(false);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create email template');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTemplate = async (values) => {
    if (!templateToEdit) return;

    setIsUpdating(true);
    try {
      const payload = {
        ...values
      };
      
      const response = await updateRequest(`templates/${templateToEdit._id}`, payload);
      
      if (response.status === 1) {
        toast.success('Email template updated successfully');
        setIsFormOpen(false);
        setTemplateToEdit(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update email template');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteRequest(`templates/${templateToDelete._id}`);
      
      if (response.status === 1) {
        toast.success('Email template deleted successfully');
        setIsDeleteDialogOpen(false);
        setTemplateToDelete(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete email template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyDetails = async (template) => {
    try {
      let textToCopy = `Name: ${template.name}\nType: ${template.type}\nStatus: ${template.status}`;
      
      if (template.type === 'email' && template.subject) {
        textToCopy += `\nSubject: ${template.subject}`;
      }
      
      if (template.text) {
        textToCopy += `\nText: ${template.text.substring(0, 100)}...`;
      }
      
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Template details copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy details');
    }
  };

  const openEditModal = (template) => {
    setTemplateToEdit(template);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (template) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const openCreateModal = () => {
    if (templateTypes.length === 0) {
      toast.error('Please create email template types first');
      return;
    }
    setTemplateToEdit(null);
    setIsFormOpen(true);
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Email Templates
              </CardTitle>
              <CardDescription>
                Manage your email templates - Total {totalCount} templates found
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

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Add Button */}
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {searchTerm ? 'No templates found matching your criteria' : 'No templates found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template) => (
                    <TableRow key={template._id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>
                        {template.typeId.typeName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {template.subject || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {formatDate(template.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyDetails(template)}
                            title="Copy template details"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(template)}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(template)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete template"
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

      {/* Template Form Modal */}
      <TemplateFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTemplateToEdit(null);
        }}
        onSubmit={templateToEdit ? handleUpdateTemplate : handleCreateTemplate}
        isSubmitting={templateToEdit ? isUpdating : isCreating}
        initialData={templateToEdit ? {
          name: templateToEdit.name,
          typeId: templateToEdit.typeId._id,
          subject: templateToEdit.subject,
          content: templateToEdit.content,
          text: templateToEdit.text,
          status: templateToEdit.status,
        } : undefined}
        templateTypes={templateTypes}
        title={templateToEdit ? 'Edit Email Template' : 'Create Email Template'}
        description={templateToEdit ? 'Update your email template details.' : 'Create a new email template for your communications.'}
        submitButtonText={templateToEdit ? 'Update Template' : 'Create Template'}
        type="email"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setTemplateToDelete(null);
        }}
        onConfirm={handleDeleteTemplate}
        title="Delete Email Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone and will permanently remove this template.`}
        loading={isDeleting}
      />
    </>
  );
};

export default EmailTemplateList;