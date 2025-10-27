"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { getRequest } from "@/service/viewService";
import { toast } from "sonner";

// Lazy load for better performance
const RegistrationList = dynamic(() => import("./RegistrationList"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      Loading registrations...
    </div>
  ),
});

const RegistrationManagement = ({ eventId }) => {
  const [userTypes, setUserTypes] = useState([]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const params = new URLSearchParams({ ...(companyId && { companyId }) });
      const response = await getRequest(`user-types?${params}`);
      if (response.status === 1 && response.data?.userTypes?.length) {
        setUserTypes(response.data.userTypes);
        setActiveTab(response.data.userTypes[0]?._id || "");
      }
    } catch (error) {
      console.error("Error fetching user types:", error);
      toast.error("Failed to load user types");
    }
  };

  const activeTabContent = useMemo(() => {
    if (!activeTab) return null;
    return <RegistrationList eventId={eventId} userTypeId={activeTab} />;
  }, [activeTab, eventId]);

  return (
    <Card>
      <CardHeader className="px-0">
        <CardTitle>Registration Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-2 flex flex-wrap">
            {userTypes.map((type) => (
              <TabsTrigger key={type._id} value={type._id} className="px-6">
                {type.typeName}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Only render current tab content */}
          <div className="space-y-4">{activeTabContent}</div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default React.memo(RegistrationManagement);
