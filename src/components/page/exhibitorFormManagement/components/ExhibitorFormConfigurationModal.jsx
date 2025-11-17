"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Check, Loader2, Settings } from "lucide-react";
import { getRequest } from "@/service/viewService";
import { toast } from "sonner";

export const ExhibitorFormConfigurationModal = ({
  isOpen,
  onClose,
  onConfigurationSelect,
  eventId, // Add eventId prop
}) => {
  const [configurations, setConfigurations] = useState([]);
  const [availableConfigurations, setAvailableConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [usedConfigurationIds, setUsedConfigurationIds] = useState(new Set());

  useEffect(() => {
    if (isOpen && eventId) {
      fetchConfigurations();
      fetchUsedConfigurations();
    }
  }, [isOpen, eventId]);

  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      const response = await getRequest("exhibitor-form-configurations");
      
      if (response.status === 1) {
        setConfigurations(response.data.configs || []);
      } else {
        toast.error("Failed to fetch form configurations");
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
      toast.error("Failed to fetch form configurations");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsedConfigurations = async () => {
    if (!eventId) return;
    
    try {
      // Fetch all forms for this event to get used configuration IDs
      const companyId = localStorage.getItem('companyId');
      const params = new URLSearchParams({
        eventId: eventId,
        ...(companyId && { companyId: companyId }),
      });

      const response = await getRequest(`exhibitor-forms?${params}`);
      
      if (response.status === 1) {
        const forms = response.data.forms || [];
        // Extract configuration IDs that are already used
        const usedIds = new Set(
          forms
            .filter(form => form.exhibitorFormConfigurationId)
            .map(form => form.exhibitorFormConfigurationId._id || form.exhibitorFormConfigurationId)
        );
        setUsedConfigurationIds(usedIds);
      }
    } catch (error) {
      console.error("Error fetching used configurations:", error);
    }
  };

  useEffect(() => {
    // Filter available configurations whenever configurations or usedConfigurationIds change
    const available = configurations.filter(
      config => !usedConfigurationIds.has(config._id)
    );
    setAvailableConfigurations(available);
  }, [configurations, usedConfigurationIds]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleConfigurationSelect = (config) => {
    onConfigurationSelect(config);
    setSearchTerm("");
    onClose();
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  // Filter available configurations based on search term
  const filteredConfigurations = availableConfigurations.filter(config =>
    config.configName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.formNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.configSlug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBoolean = (value) => {
    return value ? "Yes" : "No";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Form Configuration</DialogTitle>
          <DialogDescription className={"hidden"}>
            Choose a configuration template for your new exhibitor form.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search available configurations by name, form number..."
            value={searchTerm}
            onChange={handleSearch}
            className="!pl-10"
          />
        </div>

        {/* Configurations List */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Has Particulars</TableHead>
                  <TableHead className="text-right">Configuration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfigurations.length > 0 ? (
                  filteredConfigurations.map((config) => (
                    <TableRow key={config._id}>
                      <TableCell className="font-medium">
                        {config.formNo}
                      </TableCell>
                      <TableCell>{config.configName}</TableCell>
                      <TableCell>
                        {formatBoolean(config.hasParticulars)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigurationSelect(config)}
                          title="Select this configuration"
                          className=""
                        >
                          <Settings className="" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {searchTerm 
                        ? "No available configurations found matching your search" 
                        : availableConfigurations.length === 0 && configurations.length > 0
                        ? "All configurations are already in use for this event"
                        : "No configurations available"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ExhibitorFormConfigurationModal;