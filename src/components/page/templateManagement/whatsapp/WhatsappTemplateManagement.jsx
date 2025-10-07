"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

// Lazy load components to prevent unnecessary renders
const TypeList = dynamic(() => import('./WhtasappTypeList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading types...</div>
});

const TemplateList = dynamic(() => import('./WhatsappTemplateList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading templates...</div>
});

const WhatsappTemplateManagement = () => {
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
      <Card className={'grow flex flex-col !border-0 !p-0 !shadow-none'}>
        <CardHeader className={'px-0'}>
          <CardTitle>Whatsapp Template Management</CardTitle>
          <CardDescription>Manage types and templates for your Whatsapp</CardDescription>
        </CardHeader>
        <CardContent className={'grow flex flex-col'}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full grow flex flex-col">
            <TabsList className="mb-6">
              <TabsTrigger value="types" className="px-6">Types</TabsTrigger>
              <TabsTrigger value="templates" className="px-6">Templates</TabsTrigger>
            </TabsList>
            
            {/* Only render the active tab content */}
            <div className="space-y-4 h-20 grow flex flex-col">
              {activeTabContent}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default React.memo(WhatsappTemplateManagement);
