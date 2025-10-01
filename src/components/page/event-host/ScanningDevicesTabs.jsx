"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Settings } from "lucide-react";
import ScanningDevicesPage from "./ScanningDevicesPage";
import DeviceDetailsTab from "./DeviceDetailsTab";

function ScanningDevicesTabs() {
    const [activeTab, setActiveTab] = useState("assigned");

    return (
        <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assigned" className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Assigned By SuperAdmin
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Device Details
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assigned" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <ScanningDevicesPage />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="details" className="mt-4">
                    <Card>
                        <CardContent className="p-0">
                            <DeviceDetailsTab />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default ScanningDevicesTabs;