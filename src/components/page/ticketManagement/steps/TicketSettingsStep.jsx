import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { TICKET_ACCESS_OPTIONS, TICKET_CTA_SETTINGS } from '../constants/ticketConstants';
import ImageUpload from '../components/ImageUpload';

const TicketSettingsStep = ({ 
  formData, 
  handleInputChange, 
  errors, 
  imageHandlers,
  handleCtaToggle,
  handleCtaRemove
}) => {
  const { handleImageUpload, removeImage } = imageHandlers;
  const [open, setOpen] = React.useState(false);

  // Ensure ctaSettings is an array
  const selectedCtas = Array.isArray(formData.ctaSettings) ? formData.ctaSettings : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticketPerUser">Ticket Per User *</Label>
          <Input id="ticketPerUser" type="number" min="1" value={formData.ticketPerUser} onChange={(e) => handleInputChange('ticketPerUser', parseInt(e.target.value) || 1)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketAccess">Ticket Access *</Label>
          <Select value={formData.ticketAccess} onValueChange={(value) => handleInputChange('ticketAccess', value)}>
            <SelectTrigger className="w-full">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="">Mobile App Profile CTA Settings</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {selectedCtas.length > 0 ? `${selectedCtas.length} selected` : "Select CTA settings"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="max-h-64 overflow-auto p-1">
                {TICKET_CTA_SETTINGS.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                    onClick={() => handleCtaToggle(option)}
                  >
                    <Checkbox
                      checked={selectedCtas.includes(option)}
                      // onCheckedChange={() => handleCtaToggle(option)}
                    />
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {selectedCtas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCtas.map((cta) => (
                <div
                  key={cta}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                >
                  <span>{cta}</span>
                  <button
                    type="button"
                    onClick={() => handleCtaRemove(cta)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <ImageUpload label="Link Banner (Desktop)" preview={formData.desktopBannerImagePreview} onUpload={handleImageUpload('desktopBannerImage', 'desktopBannerImagePreview')} onRemove={removeImage('desktopBannerImage', 'desktopBannerImagePreview')} uploadId="desktop-banner-upload" recommendedSize="Recommended size: 800 x 1000px | 1MB" linkValue={formData.linkBannerDesktop} onLinkChange={(value) => handleInputChange('linkBannerDesktop', value)} linkPlaceholder="Enter desktop banner URL" />
          <ImageUpload label="Link Banner (Mobile)" preview={formData.mobileBannerImagePreview} onUpload={handleImageUpload('mobileBannerImage', 'mobileBannerImagePreview')} onRemove={removeImage('mobileBannerImage', 'mobileBannerImagePreview')} uploadId="mobile-banner-upload" recommendedSize="Recommended size: 1300 x 900px | 1MB" linkValue={formData.linkBannerMobile} onLinkChange={(value) => handleInputChange('linkBannerMobile', value)} linkPlaceholder="Enter mobile banner URL" />
          <ImageUpload label=" Banner (Login)" preview={formData.loginBannerImagePreview} onUpload={handleImageUpload('loginBannerImage', 'loginBannerImagePreview')} onRemove={removeImage('loginBannerImage', 'loginBannerImagePreview')} uploadId="login-banner-upload" recommendedSize="Recommended size: 1300 x 900px" linkValue={formData.linkLoginBanner} onLinkChange={(value) => handleInputChange('linkLoginBanner', value)} linkPlaceholder="Enter login page banner URL" />
        </div>
      </div>
    </div>
  );
};

export default TicketSettingsStep;