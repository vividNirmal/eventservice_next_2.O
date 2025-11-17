import FormManagement from "@/components/page/formManagement/FormManagement";
import React from "react";

export default async function AdminFormsPage() {
  return <FormManagement isAdminForm={true} />;
}

export const metadata = {
  title: 'Admin Forms Management - Event Dashboard',
  description: 'Manage admin forms',
};