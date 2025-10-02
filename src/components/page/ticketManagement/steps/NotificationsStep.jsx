import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const NotificationsStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.notifications.emailNotification}
            onCheckedChange={(checked) => handleInputChange('notifications.emailNotification', checked)}
          />
          <Label>Email Notification</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.notifications.smsNotification}
            onCheckedChange={(checked) => handleInputChange('notifications.smsNotification', checked)}
          />
          <Label>SMS Notification</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.notifications.whatsappNotification}
            onCheckedChange={(checked) => handleInputChange('notifications.whatsappNotification', checked)}
          />
          <Label>WhatsApp Notification</Label>
        </div>
      </div>
    </div>
  );
};

export default NotificationsStep;