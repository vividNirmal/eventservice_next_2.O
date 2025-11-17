"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

// Lazy load components to prevent unnecessary renders
const FormManagement = dynamic(() => import('../formManagement/FormManagement'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading forms...</div>
});

const TicketList = dynamic(() => import('./TicketList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading tickets...</div>
});

const UserTypeMapping = dynamic(() => import('../userTypeMapping/UserTypeMappingList'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64">Loading user type mapping...</div>
});


const TicketManagement = ({ eventId }) => {
  const [activeTab, setActiveTab] = useState('forms');

  // Memoize the active tab content to prevent unnecessary re-renders
  const activeTabContent = useMemo(() => {
    switch (activeTab) {
      case 'forms':
        return <FormManagement eventId={eventId} />;
      case 'tickets':
        return <TicketList eventId={eventId} />;
      case 'user-type-mapping':
        return <UserTypeMapping eventId={eventId} />;
      default:
        return null;
    }
  }, [activeTab, eventId]);

  return (
    <>
      <Card className={'grow'}>
        <CardHeader className={'px-0'}>
          <CardTitle>Ticket Management</CardTitle>
          {/* <CardDescription>Manage forms and tickets for your events</CardDescription> */}
        </CardHeader>
        <CardContent className={'grow flex flex-col'}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full grow flex flex-col">
            <TabsList className="mb-2">
              <TabsTrigger value="forms" className="px-6">Forms</TabsTrigger>
              <TabsTrigger value="tickets" className="px-6">Tickets</TabsTrigger>
              <TabsTrigger value="user-type-mapping" className="px-6">User Type Mapping</TabsTrigger>
            </TabsList>
            
            {/* Only render the active tab content */}
            <div className="space-y-4 grow flex flex-col">{activeTabContent}</div>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default React.memo(TicketManagement);
