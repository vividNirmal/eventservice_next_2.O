import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TICKET_ACCESS_OPTIONS } from '../constants/ticketConstants';
import ImageUpload from '../components/ImageUpload';

const TicketSettingsStep = ({ 
  formData, 
  handleInputChange, 
  errors, 
  imageHandlers 
}) => {
  const { handleImageUpload, removeImage } = imageHandlers;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticketPerUser">Ticket Per User *</Label>
          <Input
            id="ticketPerUser"
            type="number"
            min="1"
            value={formData.ticketPerUser}
            onChange={(e) => handleInputChange('ticketPerUser', parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketAccess">Ticket Access *</Label>
          <Select
            value={formData.ticketAccess}
            onValueChange={(value) => handleInputChange('ticketAccess', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_ACCESS_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label className="text-base font-medium">Mobile App Profile CTA Settings</Label>

        <div className="grid grid-cols-2 gap-6">
          <ImageUpload
            label="Link Banner (Desktop)"
            preview={formData.desktopBannerImagePreview}
            onUpload={handleImageUpload('desktopBannerImage', 'desktopBannerImagePreview')}
            onRemove={removeImage('desktopBannerImage', 'desktopBannerImagePreview')}
            uploadId="desktop-banner-upload"
            recommendedSize="Recommended size: 800 x 1000px | 1MB"
            linkValue={formData.linkBannerDesktop}
            onLinkChange={(value) => handleInputChange('linkBannerDesktop', value)}
            linkPlaceholder="Enter desktop banner URL"
          />

          <ImageUpload
            label="Link Banner (Mobile)"
            preview={formData.mobileBannerImagePreview}
            onUpload={handleImageUpload('mobileBannerImage', 'mobileBannerImagePreview')}
            onRemove={removeImage('mobileBannerImage', 'mobileBannerImagePreview')}
            uploadId="mobile-banner-upload"
            recommendedSize="Recommended size: 1300 x 900px | 1MB"
            linkValue={formData.linkBannerMobile}
            onLinkChange={(value) => handleInputChange('linkBannerMobile', value)}
            linkPlaceholder="Enter mobile banner URL"
          />
        </div>
      </div>
    </div>
  );
};

export default TicketSettingsStep;