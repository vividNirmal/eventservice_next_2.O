"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

// Lazy load components to prevent unnecessary renders
const EBadgeTemplateList = dynamic(() => import('./eBadgeTemplate/EBadgeTemplateList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading badge templates..</div>
});

const EBadgeSettingList = dynamic(() => import('./eBadgeSetting/EBadgeSettingList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading e-badge settings...</div>
});

const PaperBadgeSettingList = dynamic(() => import('./paperBadgeSetting/paperBadgeSettingList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading paper badge settings...</div>
});

const BadgeCategoryList = dynamic(() => import('./badgeCategory/BadgeCategoryList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading badge categories...</div>
});

const BadgeManagement = ({ eventId }) => {
  const [activeTab, setActiveTab] = useState('badge-template');

  // Memoize the active tab content to prevent unnecessary re-renders
  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case 'badge-template':
        return <EBadgeTemplateList eventId={eventId} />;
      case 'e-badge-setting':
        return <EBadgeSettingList eventId={eventId} />;
      case 'paper-badge-setting':
        return <PaperBadgeSettingList eventId={eventId} />;
      case 'badge-category':
        return <BadgeCategoryList eventId={eventId} />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <>
      <Card>
        <CardHeader className={'px-0'}>
          <CardTitle>Badge Management</CardTitle>
          {/* <CardDescription>Manage badges for your event</CardDescription> */}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="badge-template" className="px-6">Badge Template</TabsTrigger>
              <TabsTrigger value="e-badge-setting" className="px-6">E-Badge Setting</TabsTrigger>
              <TabsTrigger value="paper-badge-setting" className="px-6">Paper Badge Setting</TabsTrigger>
              <TabsTrigger value="badge-category" className="px-6">Badge Category</TabsTrigger>
            </TabsList>
            
            {/* Only render the active tab content */}
            <div className="space-y-4">
              {activeTabContent}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default React.memo(BadgeManagement);
