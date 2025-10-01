import FormManagement from '@/components/page/formManagement/FormManagement';
import { TicketManagement } from '@/components/page/ticketManagement';

export default function FormManagementPage() {
  // return <FormManagement />;
  return <TicketManagement />;
}

export const metadata = {
  title: 'Ticket Management - Admin Dashboard',
  description: 'Manage and organize your event tickets',
};
