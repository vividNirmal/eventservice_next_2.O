"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

// Lazy load components to prevent unnecessary renders
const TypeList = dynamic(() => import('./SmsTypeList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading types...</div>
});

const TemplateList = dynamic(() => import('./SmsTemplateList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading templates...</div>
});

const SmsTemplateManagement = () => {
  const [activeTab, setActiveTab] = useState('types');

  // Memoize the active tab content to prevent unnecessary re-renders
  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case 'types':
        return <TypeList />;
      case 'templates':
        return <TemplateList />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>SMS Template Management</CardTitle>
          <CardDescription>
            Manage types and templates for your SMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="types" className="px-6">
                Types
              </TabsTrigger>
              <TabsTrigger value="templates" className="px-6">
                Templates
              </TabsTrigger>
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

export default React.memo(SmsTemplateManagement);
