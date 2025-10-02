"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2,
    Search,
    Monitor,
    Smartphone,
    Edit,
    Plus,
    MapPin,
    Shield,
    Trash2,
    MoreHorizontal
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
import { CustomPagination } from "@/components/common/pagination";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { useDebounce } from "@/hooks/useDebounce";
import { useFormik } from "formik";
import * as Yup from "yup";

function DeviceDetailsTab() {
    const params = useParams();
    const eventId = params?.id;

    // State management
    const [deviceConfigs, setDeviceConfigs] = useState([]);
    const [scannerDevices, setScannerDevices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLimit, setSelectedLimit] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [configToDelete, setConfigToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const dataLimits = [10, 20, 30, 50];

    // Debounce search term for better performance
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Form validation schema
    const validationSchema = Yup.object({
        scanner_name: Yup.string().required("Scanner name is required"),
        scanner_unique_id: Yup.string().required("Scanner unique ID is required"),
        device_key: Yup.string().required("Device key is required"),
        device_type: Yup.string().required("Device type is required"),
        entry_mode: Yup.string().required("Entry mode is required"),
        location_name: Yup.string().required("Location name is required"),
        check_in_area: Yup.string().required("Check in area is required"),
        check_in_by: Yup.string().required("Check in by is required"),
        device_access: Yup.string(), // Optional - defaults to "all"
        badge_category: Yup.string(), // Optional - defaults to "all"
        comment: Yup.string()
    });

    // Form handling
    const formik = useFormik({
        initialValues: {
            scanner_name: "",
            scanner_unique_id: "",
            device_key: "",
            device_type: "",
            entry_mode: "",
            location_name: "",
            check_in_area: "",
            check_in_by: "",
            device_access: "all", // Default to "all"
            badge_category: "all", // Default to "all"
            comment: ""
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                // Find the selected device to get its ID
                const selectedDevice = scannerDevices.find(device => 
                    device.device_key === values.device_key
                );
                
                const payload = {
                    ...values,
                    scanner_machine_id: selectedDevice?._id || editingConfig?.scanner_machine_id || "",
                    company_id: companyId,
                    event_id: eventId
                };

                const endpoint = editingConfig 
                    ? "update-device-configuration" 
                    : "create-device-configuration";
                
                if (editingConfig) {
                    payload.id = editingConfig._id;
                }

                const response = await postRequest(endpoint, payload);
                
                if (response.status === 1) {
                    toast.success(editingConfig ? "Configuration updated successfully" : "Configuration created successfully");
                    setIsEditModalOpen(false);
                    setEditingConfig(null);
                    formik.resetForm();
                    fetchDeviceConfigurations();
                } else {
                    toast.error(response.message || "Operation failed");
                }
            } catch (error) {
                console.error("Error saving configuration:", error);
                toast.error("Failed to save configuration");
            }
        }
    });

    // Fetch device configurations
    const fetchDeviceConfigurations = useCallback(async () => {
        if (!companyId || !eventId) return;

        setLoading(true);
        try {
            const res = await getRequest(
                `get-device-configurations/${companyId}/${eventId}?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(debouncedSearchTerm)}`
            );
            
            if (res.status === 1) {
                setDeviceConfigs(res.data?.configurations || []);
                setTotalUsers(res.data.totalUsers || 0);
                setTotalPages(res.data.totalPages || 1);
            } else {
                toast.error(res.message || "Failed to fetch device configurations");
            }
        } catch (error) {
            console.error("Error fetching configurations:", error);
            toast.error("Failed to fetch device configurations");
        } finally {
            setLoading(false);
        }
    }, [companyId, eventId, currentPage, selectedLimit, debouncedSearchTerm]);

    // Fetch available scanner devices for the company
    const fetchScannerDevices = useCallback(async () => {
        if (!companyId) return;

        try {
            const res = await getRequest(`get-scanner-machines-by-company/${companyId}`);
            if (res.status === 1) {
                setScannerDevices(res.data?.scannermachine || []);
            }
        } catch (error) {
            console.error("Error fetching scanner devices:", error);
        }
    }, [companyId]);

    // Initialize company ID from localStorage
    useEffect(() => {
        const storedCompanyId = localStorage.getItem("companyId") || localStorage.getItem("loginuser.company_id");
        if (storedCompanyId) {
            setCompanyId(storedCompanyId);
        }
    }, []);

    // Fetch data when dependencies change
    useEffect(() => {
        if (companyId && eventId) {
            fetchDeviceConfigurations();
            fetchScannerDevices();
        }
    }, [companyId, eventId, currentPage, selectedLimit, debouncedSearchTerm]);

    // Event handlers
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
        setCurrentPage(page);
    };

    const handleEditClick = (config) => {
        setEditingConfig(config);
        
        // Find the associated scanner device
        const associatedDevice = scannerDevices.find(device => 
            device._id === config.scanner_machine_id
        );
        
        formik.setValues({
            scanner_name: associatedDevice?.scanner_name || "",
            scanner_unique_id: associatedDevice?.scanner_unique_id || "",
            device_key: config.device_key || "",
            device_type: associatedDevice?.device_type || "",
            entry_mode: config.entry_mode || "",
            location_name: config.location_name || "",
            check_in_area: config.check_in_area || "",
            check_in_by: config.check_in_by || "",
            device_access: config.device_access || "all",
            badge_category: config.badge_category || "all",
            comment: config.comment || ""
        });
        setIsEditModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingConfig(null);
        formik.resetForm();
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (config) => {
        setConfigToDelete(config);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!configToDelete) return;
        
        setIsDeleting(true);
        try {
            const response = await postRequest("delete-device-configuration", {
                id: configToDelete._id
            });
            
            if (response.status === 1) {
                toast.success("Configuration deleted successfully");
                fetchDeviceConfigurations();
            } else {
                toast.error(response.message || "Failed to delete configuration");
            }
        } catch (error) {
            console.error("Error deleting configuration:", error);
            toast.error("Failed to delete configuration");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setConfigToDelete(null);
        }
    };

    // Handle device selection - when device_key changes, update all related fields
    const handleDeviceSelection = (fieldName, value) => {
        if (fieldName === 'device_key') {
            const selectedDevice = scannerDevices.find(device => device.device_key === value);
            if (selectedDevice) {
                formik.setValues({
                    ...formik.values,
                    scanner_name: selectedDevice.scanner_name,
                    scanner_unique_id: selectedDevice.scanner_unique_id,
                    device_key: selectedDevice.device_key,
                    device_type: selectedDevice.device_type,
                    entry_mode: selectedDevice.device_type // Set entry mode based on device type
                });
            }
        }
    };

    // Handle device type change independently
    const handleDeviceTypeChange = (value) => {
        formik.setFieldValue('device_type', value);
        // Device type is independent, don't change other values
    };

    // Handle entry mode change to filter device keys
    const handleEntryModeChange = (value) => {
        formik.setFieldValue('entry_mode', value);
        // Clear device key if it doesn't match the new entry mode
        const currentDeviceKey = formik.values.device_key;
        if (currentDeviceKey) {
            const device = scannerDevices.find(d => d.device_key === currentDeviceKey);
            if (device && device.device_type !== value) {
                formik.setFieldValue('device_key', '');
            }
        }
    };

    // Filter devices by entry mode for device key dropdown
    const getFilteredDevicesByEntryMode = () => {
        if (!formik.values.entry_mode) return scannerDevices;
        return scannerDevices.filter(device => device.device_type === formik.values.entry_mode);
    };

    // Original function kept for backward compatibility
    const getDevicesByEntryMode = (entryMode) => {
        return scannerDevices.filter(device => device.device_type === entryMode);
    };

    // Device type helpers
    const getDeviceIcon = (deviceType) => {
        return deviceType === "0" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />;
    };

    const getDeviceTypeText = (deviceType) => {
        return deviceType === "0" ? "Check In" : "Check Out";
    };

    if (!eventId) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Event ID Required</h3>
                    <p className="text-gray-500">Please select an event to view device details.</p>
                </div>
            </div>
        );
    }

    return (
        <section>
            <Card className="gap-0 py-3">
                <CardHeader className="flex flex-wrap items-center px-3 gap-3">
                    <div className="flex flex-col gap-1">
                        <CardTitle>Device Details & Configuration</CardTitle>
                    </div>

                    {/* Search + Limit + Add Button */}
                    <div className="flex items-center space-x-3 ml-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search configurations..."
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
                        <Button onClick={handleAddNew} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Configuration
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="rounded-md border mt-4 bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sr.No.</TableHead>
                                    <TableHead>Device Name</TableHead>
                                    <TableHead>Device Key</TableHead>
                                    <TableHead>Entry Mode</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Check-in Area</TableHead>
                                    <TableHead>Access</TableHead>
                                    <TableHead>Badge</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deviceConfigs.length > 0 ? (
                                    deviceConfigs.map((config, index) => (
                                        <TableRow key={config._id}>
                                            <TableCell>
                                                {(currentPage - 1) * selectedLimit + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {getDeviceIcon(config.entry_mode)}
                                                    <span>{config.scanner_name || "Unknown Device"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span>{config.device_key || "Unknown Key"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    {getDeviceTypeText(config.entry_mode)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 text-gray-400" />
                                                    {config.location_name}
                                                </div>
                                            </TableCell>
                                            <TableCell>{config.check_in_area}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Shield className="h-3 w-3 text-gray-400" />
                                                    {config.device_access}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {config.badge_category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleEditClick(config)}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteClick(config)}
                                                            className="text-red-600 hover:text-red-700"
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
                                        <TableCell
                                            colSpan={9}
                                            className="text-center text-gray-400"
                                        >
                                            {debouncedSearchTerm
                                                ? `No configurations found matching "${debouncedSearchTerm}"`
                                                : "No device configurations found. Click 'Add Configuration' to create one."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

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
            </CardContent>

            {/* Edit/Add Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-4xl w-full">
                    <DialogHeader>
                        <DialogTitle>
                            {editingConfig ? "Edit" : "Add"} Device Configuration
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        {/* Row 1: Entry Mode and Device Key */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Entry Mode */}
                            <div className="space-y-2">
                                <Label htmlFor="entry_mode">Entry Mode</Label>
                                <Select
                                    value={formik.values.entry_mode}
                                    onValueChange={handleEntryModeChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select entry mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Check In</SelectItem>
                                        <SelectItem value="1">Check Out</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.entry_mode && formik.errors.entry_mode && (
                                    <p className="text-red-500 text-sm">{formik.errors.entry_mode}</p>
                                )}
                            </div>

                            {/* Device Key */}
                            <div className="space-y-2">
                                <Label htmlFor="device_key">Device Key</Label>
                                <Select
                                    value={formik.values.device_key}
                                    onValueChange={(value) => handleDeviceSelection('device_key', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select device key" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getFilteredDevicesByEntryMode().map((device) => (
                                            <SelectItem key={device._id} value={device.device_key}>
                                                {device.device_key}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.device_key && formik.errors.device_key && (
                                    <p className="text-red-500 text-sm">{formik.errors.device_key}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Scanner Name and Scanner Unique ID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Scanner Name - Input Field */}
                            <div className="space-y-2">
                                <Label htmlFor="scanner_name">Scanner Name</Label>
                                <Input
                                    id="scanner_name"
                                    name="scanner_name"
                                    value={formik.values.scanner_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter scanner name"
                                    className="w-full"
                                />
                                {formik.touched.scanner_name && formik.errors.scanner_name && (
                                    <p className="text-red-500 text-sm">{formik.errors.scanner_name}</p>
                                )}
                            </div>

                            {/* Scanner Unique ID - Disabled Input */}
                            <div className="space-y-2">
                                <Label htmlFor="scanner_unique_id">Scanner Unique ID</Label>
                                <Input
                                    id="scanner_unique_id"
                                    name="scanner_unique_id"
                                    value={formik.values.scanner_unique_id}
                                    disabled
                                    placeholder="Auto-generated from device selection"
                                    className="w-full bg-gray-100"
                                />
                                {formik.touched.scanner_unique_id && formik.errors.scanner_unique_id && (
                                    <p className="text-red-500 text-sm">{formik.errors.scanner_unique_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 3: Device Type */}
                        <div className="space-y-2">
                            <Label htmlFor="device_type">Device Type</Label>
                            <Select
                                value={formik.values.device_type}
                                onValueChange={handleDeviceTypeChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Check In</SelectItem>
                                    <SelectItem value="1">Check Out</SelectItem>
                                </SelectContent>
                            </Select>
                            {formik.touched.device_type && formik.errors.device_type && (
                                <p className="text-red-500 text-sm">{formik.errors.device_type}</p>
                            )}
                        </div>

                        {/* Row 4: Badge Category and Device Access */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Badge Category with "All" default */}
                            <div className="space-y-2">
                                <Label htmlFor="badge_category">Badge Category</Label>
                                <Select
                                    value={formik.values.badge_category}
                                    onValueChange={(value) => formik.setFieldValue("badge_category", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select badge category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="speaker">Speaker</SelectItem>
                                        <SelectItem value="sponsor">Sponsor</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.badge_category && formik.errors.badge_category && (
                                    <p className="text-red-500 text-sm">{formik.errors.badge_category}</p>
                                )}
                            </div>

                            {/* Device Access with "All" default */}
                            <div className="space-y-2">
                                <Label htmlFor="device_access">Device Access</Label>
                                <Select
                                    value={formik.values.device_access}
                                    onValueChange={(value) => formik.setFieldValue("device_access", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select access level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.device_access && formik.errors.device_access && (
                                    <p className="text-red-500 text-sm">{formik.errors.device_access}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 5: Location Name and Check in Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Location Name */}
                            <div className="space-y-2">
                                <Label htmlFor="location_name">Location Name</Label>
                                <Input
                                    id="location_name"
                                    name="location_name"
                                    value={formik.values.location_name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter location name"
                                />
                                {formik.touched.location_name && formik.errors.location_name && (
                                    <p className="text-red-500 text-sm">{formik.errors.location_name}</p>
                                )}
                            </div>

                            {/* Check in Area */}
                            <div className="space-y-2">
                                <Label htmlFor="check_in_area">Check in Area</Label>
                                <Input
                                    id="check_in_area"
                                    name="check_in_area"
                                    value={formik.values.check_in_area}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder="Enter check in area"
                                />
                                {formik.touched.check_in_area && formik.errors.check_in_area && (
                                    <p className="text-red-500 text-sm">{formik.errors.check_in_area}</p>
                                )}
                            </div>
                        </div>

                        {/* Row 6: Check in by */}
                        <div className="space-y-2">
                            <Label htmlFor="check_in_by">Check in by</Label>
                            <Select
                                value={formik.values.check_in_by}
                                onValueChange={(value) => formik.setFieldValue("check_in_by", value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select check in method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="reg_no">Registration No</SelectItem>
                                    <SelectItem value="regno_invitation">Reg No + Invitation Code</SelectItem>
                                </SelectContent>
                            </Select>
                            {formik.touched.check_in_by && formik.errors.check_in_by && (
                                <p className="text-red-500 text-sm">{formik.errors.check_in_by}</p>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">Comment</Label>
                            <Textarea
                                id="comment"
                                name="comment"
                                value={formik.values.comment}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Enter any comments (optional)"
                                rows={3}
                            />
                            {formik.touched.comment && formik.errors.comment && (
                                <p className="text-red-500 text-sm">{formik.errors.comment}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={formik.isSubmitting}>
                                {formik.isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    editingConfig ? "Update" : "Create"
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the device configuration for "{configToDelete?.scanner_name || 'this device'}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

export default DeviceDetailsTab;