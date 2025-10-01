import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const NotificationsStep = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.emailNotification}
            onCheckedChange={(checked) => handleInputChange('emailNotification', checked)}
          />
          <Label>Email Notification</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.smsNotification}
            onCheckedChange={(checked) => handleInputChange('smsNotification', checked)}
          />
          <Label>SMS Notification</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.whatsappNotification}
            onCheckedChange={(checked) => handleInputChange('whatsappNotification', checked)}
          />
          <Label>WhatsApp Notification</Label>
        </div>
      </div>
    </div>
  );
};

export default NotificationsStep;