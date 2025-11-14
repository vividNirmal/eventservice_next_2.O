"use client";
import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import UserCampaignList from "../common/UserCampaignList";

// Lazy load components
const UserEmailTemplateList = dynamic(
  () => import("../common/UserTemplateList"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64">
        Loading templates...
      </div>
    ),
  }
);

const DefaultTemplateList = dynamic(
  () => import("../common/DefaultTemplateList"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64">
        Loading default templates...
      </div>
    ),
  }
);

const UserEmailTemplateManagement = ({ eventId }) => {
  const [activeTab, setActiveTab] = useState("user-templates");

  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case "user-templates":
        return (
          <UserEmailTemplateList eventId={eventId} templateType={"email"} />
        );
      case "default-templates":
        return <DefaultTemplateList eventId={eventId} templateType={"email"} />;
      case "campaign":
        return (
          <UserCampaignList eventId={eventId} templateType={"email"} />
        );
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <Card>
      <CardHeader className={'px-0'}>
        <CardTitle>Email Template Management</CardTitle>
        {/* <CardDescription>Manage your custom email templates and view default templates</CardDescription> */}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="user-templates" className="px-6">
              My Templates
            </TabsTrigger>
            <TabsTrigger value="default-templates" className="px-6">
              Default Templates
            </TabsTrigger>
            <TabsTrigger value="campaign" className="px-6">
              Campaign
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">{activeTabContent}</div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default React.memo(UserEmailTemplateManagement);
