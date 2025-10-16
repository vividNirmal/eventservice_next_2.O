"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Search,
    Monitor,
    Smartphone,
    Tablet,
    Calendar,
    MoreHorizontal,
    Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomPagination } from "@/components/common/pagination";
import { toast } from "sonner";
import { getRequest } from "@/service/viewService";
import moment from "moment";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";

function ScanningDevicesPage() {
    const params = useParams();
    const eventId = params?.id;

    // State management
    const [scannerList, setScannerList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLimit, setSelectedLimit] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);

    const dataLimits = [10, 20, 30, 50];

    // Debounce search term for better performance
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch scanners assigned to the company
    const fetchScannersForCompany = useCallback(async () => {
        if (!companyId) {
            toast.error("Company ID not found. Please select an event.");
            return;
        }

        setLoading(true);
        try {
            const res = await getRequest(
                `get-scanner-machines-by-company/${companyId}?page=${currentPage}&pageSize=${selectedLimit}&searchQuery=${encodeURIComponent(
                    debouncedSearchTerm
                )}`
            );
            console.log("Scanner fetch response:", res);
            if (res.status === 1) {
                setScannerList(res.data?.scannermachine || []);
                setTotalUsers(res.data.totalUsers || 0);
                setTotalPages(res.data.totalPages || 1);
            } else {
                toast.error(res.message || "Failed to fetch scanning devices");
            }
        } catch (error) {
            console.error("Error fetching scanners:", error);
            toast.error("Failed to fetch scanning devices");
        } finally {
            setLoading(false);
        }
    }, [companyId, currentPage, selectedLimit, debouncedSearchTerm]);

    // Initialize company ID from localStorage on component mount
    useEffect(() => {
        const storedCompanyId = localStorage.getItem("companyId") || localStorage.getItem("loginuser.company_id");
        if (storedCompanyId) {
            setCompanyId(storedCompanyId);
        }
    }, []);

    // Fetch scanners when dependencies change
    useEffect(() => {
        if (companyId) {
            fetchScannersForCompany();
        }
    }, [companyId, currentPage, selectedLimit, debouncedSearchTerm]);

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

    // Device type icon helper
    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case "0": // Check In
                return <Monitor className="h-4 w-4" />;
            case "1": // Check Out
                return <Smartphone className="h-4 w-4" />;
            default:
                return <Tablet className="h-4 w-4" />;
        }
    };

    // Device type text helper
    const getDeviceTypeText = (deviceType) => {
        switch (deviceType) {
            case "0":
                return "Check In";
            case "1":
                return "Check Out";
            default:
                return "Unknown";
        }
    };

    // Status badge helper
    const getStatusBadge = (expiredDate) => {
        if (!expiredDate || expiredDate === "-") {
            return <Badge variant="secondary">No Expiry</Badge>;
        }

        const isExpired = moment(expiredDate).isBefore(moment());
        return (
            <Badge variant={isExpired ? "destructive" : "default"}>
                {isExpired ? "Expired" : "Active"}
            </Badge>
        );
    };

    if (!eventId) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Event ID Required</h3>
                    <p className="text-gray-500">Please select an event to view scanning devices.</p>
                </div>
            </div>
        );
    }

    return (
        <section>
            <Card className={"gap-0"}>
                <CardHeader className={"flex flex-wrap items-center px-0 gap-3"}>
                    <div className="flex flex-col gap-1">
                        <CardTitle>Scanning Devices</CardTitle>
                    </div>

                    {/* Search + Limit */}
                    <div className="flex items-center space-x-3 ml-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="Search devices..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="!pl-10" />
                        </div>
                        <Select value={selectedLimit.toString()} onValueChange={handleLimitChange}>
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
                                    <TableHead>Unique ID</TableHead>
                                    <TableHead>Device Key</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scannerList.length > 0 ? (
                                    scannerList.map((scanner, index) => (
                                        <TableRow key={scanner._id}>
                                            <TableCell>
                                                {(currentPage - 1) * selectedLimit + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    {getDeviceIcon(scanner.device_type)}
                                                    <span>{scanner.scanner_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {scanner.scanner_unique_id}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-blue-50 px-2 py-1 rounded">
                                                    {scanner.device_key}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    {getDeviceIcon(scanner.device_type)}
                                                    {getDeviceTypeText(scanner.device_type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(scanner.expired_date)}</TableCell>
                                            <TableCell>
                                                {scanner.expired_date && scanner.expired_date !== "-" ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        {moment(scanner.expired_date).format("MMM DD, YYYY")}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center text-gray-400"
                                        >
                                            {debouncedSearchTerm
                                                ? `No devices found matching "${debouncedSearchTerm}"`
                                                : "No scanning devices are currently assigned to this company."}
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
        </section>
    );
}

export default ScanningDevicesPage;