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
import { Plus, Search, Edit, Trash2, Copy, Loader2, Download, Upload } from 'lucide-react';
import { getRequest, postRequest, deleteRequest } from '@/service/viewService';
import { toast } from 'sonner';
// Lazy load the ticket wizard component
import dynamic from 'next/dynamic';
const TicketWizard = dynamic(() => import('./AddTicketWizard'), { ssr: false });
import { ToastContainer } from 'react-toastify';

const TicketList = ({ eventId }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isTicketWizardOpen, setIsTicketWizardOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [ticketToEdit, setTicketToEdit] = useState(null); // null for add mode, ticket object for edit mode
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [hasAvailableForms, setHasAvailableForms] = useState(false);
  const [formsLoading, setFormsLoading] = useState(true);
  const [linkedTicketId, setLinkedTicketId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const dataLimits = [10, 20, 30, 50];

  // Multi-selection handlers
  const handleSelectTicket = useCallback((ticketId, isChecked) => {
    setSelectedTickets(prev => {
      const newSelected = new Set(prev);
      if (isChecked) {
        newSelected.add(ticketId);
      } else {
        newSelected.delete(ticketId);
      }
      return newSelected;
    });
  }, []);

  const handleSelectAllTickets = useCallback((isChecked) => {
    if (isChecked) {
      setSelectedTickets(new Set(tickets.map(ticket => ticket._id)));
    } else {
      setSelectedTickets(new Set());
    }
  }, [tickets]);

  const linkTicket = useCallback(async (ticket) => {
    // Set Loading state or disable button if needed
    setLoading(true);
    try {
      const response = await postRequest('link-ticket-to-event-host', {
        ticketId: ticket._id,
        eventHostId: eventId
      });
      if (response.status === 1) {
        toast.success(response.message || 'Ticket linked successfully');
        setLinkedTicketId(ticket._id);
      } else {
        toast.error(response.message || 'Failed to link ticket');
      }
    } catch (error) {
      console.error('Error linking ticket:', error);
      toast.error('Failed to link ticket');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const checkTicketLinkStatus = useCallback(async (ticketId) => {
    try {
      const response = await getRequest(`check-ticket-link-status/${ticketId}`);
      if (response.status === 1) {
        setLinkedTicketId(ticketId);
        return response.data.isLinked;
      } else {
        toast.error(response.message || 'Failed to check link status');
        return false;
      }
    } catch (error) {
      console.error('Error checking ticket link status:', error);
      toast.error('Failed to check link status');
      return false;
    }
  }, []);

  // Define fetchTickets first before any functions that depend on it
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectedLimit.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(eventId && { eventId: eventId }),
      });

      const response = await getRequest(`tickets?${params}`);
      
      if (response.status === 1) {
        setTickets(response.data.tickets || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalCount(response.data.pagination?.totalCount || 0);
        // Clear selections when data changes
        setSelectedTickets(new Set());
      } else {
        toast.error(response.message || 'Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedLimit, debouncedSearchTerm, selectedStatus, eventId]);

  // Function to check if any forms are available for the event
  const checkFormsAvailability = useCallback(async () => {
    if (!eventId) {
      setHasAvailableForms(false);
      setFormsLoading(false);
      return;
    }

    setFormsLoading(true);
    try {
      const response = await getRequest(`forms?eventId=${eventId}`);
      if (response.status === 1) {
        const forms = response.data.forms || [];
        setHasAvailableForms(forms.length > 0);
      } else {
        setHasAvailableForms(false);
      }
    } catch (error) {
      console.error('Error checking forms availability:', error);
      setHasAvailableForms(false);
    } finally {
      setFormsLoading(false);
    }
  }, [eventId]);

  // Export functionality
  const handleExportTickets = useCallback(async () => {
    if (totalCount === 0) {
      toast.error('No tickets available to export');
      return;
    }

    setIsExporting(true);
    try {
      // Fetch all tickets for the event with forms
      const response = await getRequest(`tickets/export?eventId=${eventId}`);
      
      if (response.status === 1) {
        const exportData = {
          exportDate: new Date().toISOString(),
          eventId: eventId,
          tickets: response.data.tickets || [],
          forms: response.data.forms || [],
          metadata: {
            totalTickets: response.data.tickets?.length || 0,
            totalForms: response.data.forms?.length || 0,
            exportedBy: 'TicketManagement',
            version: '1.0'
          }
        };

        // Create and download the JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `tickets-export-${eventId}-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Successfully exported ${exportData.metadata.totalTickets} tickets and ${exportData.metadata.totalForms} forms`);
      } else {
        toast.error(response.message || 'Failed to export tickets');
      }
    } catch (error) {
      console.error('Error exporting tickets:', error);
      toast.error('Failed to export tickets');
    } finally {
      setIsExporting(false);
    }
  }, [eventId, totalCount]);

  // Import functionality
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Please select a valid JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate the import data structure
        if (!importData.tickets || !importData.forms || !importData.metadata) {
          toast.error('Invalid import file format');
          return;
        }

        setImportPreviewData(importData);
        setShowImportDialog(true);
      } catch (error) {
        toast.error('Failed to parse import file');
        console.error('Import file parse error:', error);
      }
    };
    
    reader.readAsText(file);
    setImportFile(file);
  }, []);

  const handleImportTickets = useCallback(async () => {
    if (!importPreviewData) return;

    setIsImporting(true);
    try {
      const response = await postRequest('tickets/import', {
        eventId: eventId,
        data: importPreviewData,
        companyId: localStorage.getItem('companyId') // Assuming companyId is stored in localStorage
      });

      if (response.status === 1) {
        toast.success(`Successfully imported ${response.data.importedTickets} tickets and ${response.data.importedForms} forms`);
        setShowImportDialog(false);
        setImportPreviewData(null);
        setImportFile(null);
        fetchTickets();
        checkFormsAvailability();
      } else {
        toast.error(response.message || 'Failed to import tickets');
      }
    } catch (error) {
      console.error('Error importing tickets:', error);
      toast.error('Failed to import tickets');
    } finally {
      setIsImporting(false);
    }
  }, [eventId, importPreviewData, fetchTickets, checkFormsAvailability]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedTickets.size === 0) return;

    setIsBulkDeleting(true);
    try {
      // Use the new bulk delete API endpoint
      const ticketIds = Array.from(selectedTickets);
      console.log('Deleting tickets with IDs:', ticketIds);
      const response = await postRequest('tickets/bulk-delete', { ticketIds });

      if (response.status === 1) {
        toast.success(response.message || 'Tickets deleted successfully');
        setSelectedTickets(new Set());
        fetchTickets();
      } else {
        toast.error(response.message || 'Failed to delete tickets');
      }
    } catch (error) {
      console.error('Error bulk deleting tickets:', error);
      toast.error('Failed to delete tickets');
    } finally {
      setIsBulkDeleting(false);
      setIsBulkDeleteDialogOpen(false);
    }
  }, [selectedTickets, fetchTickets]);

  const openBulkDeleteDialog = useCallback(() => {
    if (selectedTickets.size === 0) {
      toast.error('Please select tickets to delete');
      return;
    }
    setIsBulkDeleteDialogOpen(true);
  }, [selectedTickets.size]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    checkFormsAvailability();
  }, [checkFormsAvailability]);

  const handleDeleteTicket = useCallback(async () => {
    if (!ticketToDelete) return;

    try {
      const response = await deleteRequest(`tickets/${ticketToDelete._id}`);
      
      if (response.status === 1) {
        toast.success('Ticket deleted successfully');
        fetchTickets();
      } else {
        toast.error(response.message || 'Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    } finally {
      setIsDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  }, [ticketToDelete, fetchTickets]);

  const openDeleteDialog = useCallback((ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((ticket) => {
    setTicketToEdit(ticket);
    setIsTicketWizardOpen(true);
  }, []);

  const openAddDialog = useCallback(() => {
    if (!hasAvailableForms) {
      toast.error('Please create a form first before adding tickets');
      return;
    }
    setTicketToEdit(null); // null indicates add mode
    setIsTicketWizardOpen(true);
  }, [hasAvailableForms]);

  // Search functionality with debouncing (500ms) - searches across all fields: 
  // ticketName, userType, ticketCategory, status, description, serialNoPrefix
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleStatusChange = useCallback((value) => {
    setSelectedStatus(value === 'all' ? '' : value);
    setCurrentPage(1); // Reset to first page when filtering
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Memoize badge color functions to prevent recalculation
  const getUserTypeBadgeColor = useMemo(() => {
    const colors = {
      'Event Attendee': 'bg-blue-100 text-blue-800',
      'Exhibiting Company': 'bg-green-100 text-green-800',
      'Sponsor': 'bg-purple-100 text-purple-800',
      'Speaker': 'bg-orange-100 text-orange-800',
      'Service Provider': 'bg-indigo-100 text-indigo-800',
      'Accompanying': 'bg-pink-100 text-pink-800'
    };
    return (userType) => colors[userType] || 'bg-gray-100 text-gray-800';
  }, []);

  const getCategoryBadgeColor = useMemo(() => {
    const colors = {
      'Default': 'bg-gray-100 text-gray-800',
      'VIP': 'bg-yellow-100 text-yellow-800',
      'VVIP': 'bg-red-100 text-red-800',
      'Premium': 'bg-purple-100 text-purple-800',
      'Standard': 'bg-blue-100 text-blue-800'
    };
    return (category) => colors[category] || 'bg-gray-100 text-gray-800';
  }, []);

  const getStatusBadgeColor = useMemo(() => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'expired': 'bg-red-100 text-red-800'
    };
    return (status) => colors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  // Memoize wizard handlers
  const handleWizardClose = useCallback(() => {
    setIsTicketWizardOpen(false);
    setTicketToEdit(null);
  }, []);

  const handleWizardSuccess = useCallback(() => {
    setIsTicketWizardOpen(false);
    setTicketToEdit(null);
    fetchTickets();
    checkFormsAvailability(); // Refresh forms availability in case new forms were created
  }, [fetchTickets, checkFormsAvailability]);

  // Memoize copy handler
  const handleCopyTicketDetails = useCallback((ticket) => {
    navigator.clipboard.writeText(`Ticket Name: ${ticket.ticketName}, User Type: ${ticket.userType}`);
    toast.success("Ticket details copied to clipboard!");
  }, []);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Tickets List</CardTitle>
                <CardDescription>
                  Total {totalCount} tickets found
                  {(selectedStatus || searchTerm) && (
                    <span className="text-blue-600 ml-2">
                      (Filtered)
                    </span>
                  )}
                  {selectedTickets.size > 0 && (
                    <span className="text-orange-600 ml-2">
                      ({selectedTickets.size} selected)
                    </span>
                  )}
                </CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedTickets.size > 0 && (
                  <Button 
                    variant="destructive" 
                    onClick={openBulkDeleteDialog}
                    disabled={isBulkDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedTickets.size})`}
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={openAddDialog} 
                        disabled={formsLoading || !hasAvailableForms}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Ticket
                      </Button>
                    </TooltipTrigger>
                    {!hasAvailableForms && !formsLoading && (
                      <TooltipContent>
                        <p>Create a form first before adding tickets</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
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

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
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

              {/* Export Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      onClick={handleExportTickets}
                      disabled={isExporting || totalCount === 0}
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                  </TooltipTrigger>
                  {totalCount === 0 && (
                    <TooltipContent>
                      <p>No tickets available to export</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {/* Import Button */}
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('import-file').click()}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isImporting ? 'Importing...' : 'Import'}
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Clear Filters Button */}
              {(selectedStatus || searchTerm) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Tickets</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{selectedTickets.size}</strong> selected ticket(s)? 
                This action cannot be undone and will permanently remove all selected tickets and their data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "<strong>{ticketToDelete?.ticketName}</strong>"? 
                This action cannot be undone and will permanently remove the ticket and all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteTicket}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Delete Ticket
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Preview Dialog */}
        <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Import Tickets Preview</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <div>
                  Review the data that will be imported to this event:
                </div>
                
                {importPreviewData && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Tickets to import:</strong> {importPreviewData.metadata.totalTickets}
                      </div>
                      <div>
                        <strong>Forms to import:</strong> {importPreviewData.metadata.totalForms}
                      </div>
                      <div>
                        <strong>Source Event ID:</strong> {importPreviewData.eventId}
                      </div>
                      <div>
                        <strong>Export Date:</strong> {new Date(importPreviewData.exportDate).toLocaleString()}
                      </div>
                    </div>
                    
                    {importPreviewData.tickets.length > 0 && (
                      <div>
                        <strong>Tickets to be created:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm max-h-32 overflow-y-auto">
                          {importPreviewData.tickets.map((ticket, index) => (
                            <li key={index}>
                              {ticket.ticketName} ({ticket.userType} - {ticket.ticketCategory})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {importPreviewData.forms.length > 0 && (
                      <div>
                        <strong>Forms to be created:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm max-h-32 overflow-y-auto">
                          {importPreviewData.forms.map((form, index) => (
                            <li key={index}>
                              {form.formName} ({form.fields?.length || 0} fields)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-sm">
                  <strong>Note:</strong> This will create new tickets and forms for the current event. 
                  All form associations will be updated to match the new event.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isImporting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleImportTickets}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Confirm Import'}
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
                      checked={tickets.length > 0 && selectedTickets.size === tickets.length}
                      onCheckedChange={handleSelectAllTickets}
                      indeterminate={selectedTickets.size > 0 && selectedTickets.size < tickets.length}
                    />
                  </TableHead>
                  <TableHead>Ticket Name</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading tickets...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.has(ticket._id)}
                          onCheckedChange={(checked) => handleSelectTicket(ticket._id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {ticket.ticketName}
                      </TableCell>
                      <TableCell>
                        <Badge className={getUserTypeBadgeColor(ticket.userType)}>
                          {ticket.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryBadgeColor(ticket.ticketCategory)}>
                          {ticket.ticketCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.isFree ? (
                          <Badge className="bg-green-100 text-green-800">Free</Badge>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {ticket.currency} {ticket.slotAmounts?.[0]?.amount || 'N/A'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(ticket.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => linkTicket(ticket)}
                            title="Link ticket to event"
                          >
                            {linkedTicketId === ticket._id ? "Linked" : "Link"}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Copy the ticket name and userType to clipboard */}
                          {/* after copying, show a success message */}
                          <ToastContainer />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyTicketDetails(ticket)}
                            title="Copy ticket name and user type"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(ticket)}
                            title="Edit ticket"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(ticket)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete ticket"
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

      {/* Unified Ticket Wizard for Add/Edit */}
      <TicketWizard
        eventId={eventId}
        isOpen={isTicketWizardOpen}
        onClose={handleWizardClose}
        onSuccess={handleWizardSuccess}
        editData={ticketToEdit}
      />
    </>
  );
};

export default React.memo(TicketList);
