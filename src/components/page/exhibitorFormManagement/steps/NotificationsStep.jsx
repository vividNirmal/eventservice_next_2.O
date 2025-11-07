// Reuse the same NotificationsStep from tickets, just change the module parameter
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchTemplateTypesByChannel, fetchTemplatesForTypeId } from '../utils/apiUtils';
import { Badge } from '@/components/ui/badge';

const CHANNELS = [
  { key: 'emailNotification', label: 'Email Notification', type: 'email' },
  { key: 'smsNotification', label: 'SMS Notification', type: 'sms' },
  { key: 'whatsappNotification', label: 'WhatsApp Notification', type: 'whatsapp' },
];

const NotificationsStep = ({ formData, handleInputChange, setFormData, eventId }) => {
  const [typesByChannel, setTypesByChannel] = useState({
    email: [],
    sms: [],
    whatsapp: [],
  });
  const [optionsByTypeId, setOptionsByTypeId] = useState({});
  const [loadingByChannel, setLoadingByChannel] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });

  const companyId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('companyId') || null;
    }
    return null;
  }, []);

  const getDetail = (channelKey) =>
    formData?.notifications?.[channelKey] || { enabled: false, templates: [] };

  const findSelectedValue = (detail, typeId) => {
    const m = (detail?.templates || []).find(
      t => (t.typeId?._id || t.typeId) === typeId
    );
    if (!m) return '';
    const ref = m.isCustom ? 'UserTemplate' : 'Template';
    return `${ref}:${m.templateId?._id || m.templateId}`;
  };

  const setChannelEnabled = useCallback((channelKey, enabled, channelType) => {
    setFormData(prev => {
      const detail = prev?.notifications?.[channelKey] || { enabled: false, templates: [] };
      const nextDetail = enabled ? { ...detail, enabled } : { enabled, templates: [] };
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [channelKey]: nextDetail,
        },
      };
    });
    if (enabled) {
      ensureChannelLoaded(channelType);
    }
  }, [setFormData]);

  const ensureChannelLoaded = useCallback(async (channelType) => {
    if (typesByChannel[channelType]?.length > 0) return;
    setLoadingByChannel(prev => ({ ...prev, [channelType]: true }));
    try {
      // Change module to 'exhibitor-form'
      const tTypes = await fetchTemplateTypesByChannel(channelType, 'exhibitor-form');
      setTypesByChannel(prev => ({ ...prev, [channelType]: tTypes }));

      const promises = (tTypes || []).map(t =>
        fetchTemplatesForTypeId({ typeId: t._id, channel: channelType, eventId, companyId })
          .then(({ admin, user }) => {
            const items = [
              ...admin.map(a => ({ value: `Template:${a._id}`, label: `Admin: ${a.name}`, templateRef: 'Template', isCustom: false })),
              ...user.map(u => ({ value: `UserTemplate:${u._id}`, label: `Custom: ${u.name}`, templateRef: 'UserTemplate', isCustom: true })),
            ];
            return { typeId: t._id, items };
          })
      );

      const results = await Promise.all(promises);
      setOptionsByTypeId(prev => {
        const next = { ...prev };
        results.forEach(({ typeId, items }) => {
          next[typeId] = items;
        });
        return next;
      });
    } finally {
      setLoadingByChannel(prev => ({ ...prev, [channelType]: false }));
    }
  }, [typesByChannel, eventId, companyId]);

  const handleSelectChange = useCallback((channelKey, channelType, type) => (val) => {
    if (!val) return;
    const [templateRef, templateId] = val.split(':');
    const isCustom = templateRef === 'UserTemplate';
    setFormData(prev => {
      const detail = prev.notifications?.[channelKey] || { enabled: false, templates: [] };
      const templates = Array.isArray(detail.templates) ? [...detail.templates] : [];
      const typeId = type._id;
      const idx = templates.findIndex(t => (t.typeId?._id || t.typeId) === typeId);

      const nextMapping = {
        typeId,
        templateId,
        actionType: type.actionType || '',
        isCustom,
      };

      if (idx >= 0) templates[idx] = nextMapping;
      else templates.push(nextMapping);

      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [channelKey]: { ...detail, templates },
        },
      };
    });
  }, [setFormData]);

  useEffect(() => {
    CHANNELS.forEach(({ key, type }) => {
      if (getDetail(key)?.enabled) {
        ensureChannelLoaded(type);
      }
    });
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {CHANNELS.map(({ key, label, type }) => {
        const detail = getDetail(key);
        const tTypes = typesByChannel[type] || [];
        const isLoading = loadingByChannel[type];

        return (
          <div key={key} className="space-y-4 border rounded-md px-4 py-2.5">
            <div className="flex items-center justify-between">
              <Label className={'font-medium mb-0'}>{label}</Label>
              <Switch checked={!!detail.enabled} onCheckedChange={(checked) => setChannelEnabled(key, checked, type)} />
            </div>

            {detail.enabled && (
              <div className="space-y-3">
                {isLoading && <p className="text-sm text-muted-foreground">Loading {type} template types and options...</p>}
                {!isLoading && tTypes.length === 0 && (<p className="text-sm text-muted-foreground">No template types configured by admin for this channel.</p>)}
                {!isLoading && tTypes.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {tTypes.map((tt) => {
                      const options = optionsByTypeId[tt._id] || [];
                      const selectedVal = findSelectedValue(detail, tt._id);

                      return (
                        <div key={tt._id} className="flex flex-col gap-1">
                          <Label className={'capitalize flex flex-wrap items-center'}>{tt.typeName || tt.actionType} <Badge variant="outline" className="ml-auto text-zinc-600 py-0.5 text-xs">{tt.actionType ? ` (${tt.actionType})` : ''}</Badge></Label>
                          <Select value={selectedVal} onValueChange={handleSelectChange(key, type, tt)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              {options.length === 0 ? (
                                <SelectItem value="__none" disabled>No templates found</SelectItem>
                              ) : (
                                options.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationsStep;