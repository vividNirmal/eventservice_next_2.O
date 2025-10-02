'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { X, Plus, Trash2 } from 'lucide-react';
import { labelToName } from '@/lib/form-utils';

/**
 * Element Properties Component
 * Side panel for editing selected form element properties
 */
export function ElementProperties({ element, onSave, onClose }) {
  const [formData, setFormData] = useState({});
  const [validationRules, setValidationRules] = useState([]);

  useEffect(() => {
    if (element) {
      setFormData({
        label: element.label || '',
        name: element.name || '',
        placeholder: element.placeholder || '',
        description: element.description || '',
        required: element.required || false,
        defaultValue: element.defaultValue || '',
        options: element.options || [],
        content: element.content || '',
        headingLevel: element.headingLevel || 'h2'
      });
      setValidationRules(element.validation || []);
    }
  }, [element]);

  if (!element) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 content-center sticky top-0">
        <div className="text-center text-gray-500">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate name from label
    if (field === 'label') {
      setFormData(prev => ({ ...prev, name: labelToName(value) }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // Auto-generate value from label
    if (field === 'label') {
      newOptions[index].value = labelToName(value);
    }
    
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    const newOption = { label: '', value: '' };
    setFormData(prev => ({ 
      ...prev, 
      options: [...prev.options, newOption] 
    }));
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addValidationRule = () => {
    const newRule = { type: 'required', value: '', message: '' };
    setValidationRules(prev => [...prev, newRule]);
  };

  const updateValidationRule = (index, field, value) => {
    const newRules = [...validationRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setValidationRules(newRules);
  };

  const removeValidationRule = (index) => {
    setValidationRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedElement = {
      ...element,
      ...formData,
      validation: validationRules.filter(rule => 
        rule.type && (rule.type === 'required' || rule.message)
      )
    };
    
    onSave(updatedElement);
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(element.type);
  const isContentElement = ['heading', 'paragraph'].includes(element.type);
  const isDivider = element.type === 'divider';

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col sticky top-0 overflow-auto">
      <Card className="border-0 rounded-none grow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
          <CardTitle className="text-lg">Element Properties</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Properties */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="Enter label"
              />
            </div>

            {!isContentElement && !isDivider && (
              <div>
                <Label htmlFor="name">Field Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="field_name"
                />
              </div>
            )}

            {!isContentElement && !isDivider && (
              <div>
                <Label htmlFor="placeholder">Placeholder</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={(e) => handleInputChange('placeholder', e.target.value)}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter description (optional)"
                rows={2}
              />
            </div>

            {!isDivider && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) => handleInputChange('required', checked)}
                />
                <Label htmlFor="required">Required field</Label>
              </div>
            )}

            {/* Content for heading and paragraph */}
            {isContentElement && (
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Enter content"
                  rows={3}
                />
              </div>
            )}

            {/* Heading level for heading elements */}
            {element.type === 'heading' && (
              <div>
                <Label htmlFor="headingLevel">Heading Level</Label>
                <Select 
                  value={formData.headingLevel} 
                  onValueChange={(value) => handleInputChange('headingLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">Heading 1 (H1)</SelectItem>
                    <SelectItem value="h2">Heading 2 (H2)</SelectItem>
                    <SelectItem value="h3">Heading 3 (H3)</SelectItem>
                    <SelectItem value="h4">Heading 4 (H4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Options for select, radio, checkbox */}
          {needsOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Option label"
                      value={option.label}
                      onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="option_value"
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Rules */}
          {!isContentElement && !isDivider && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Validation Rules</Label>
                <Button variant="outline" size="sm" onClick={addValidationRule}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>
              
              <div className="space-y-3">
                {validationRules.map((rule, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <Select
                        value={rule.type}
                        onValueChange={(value) => updateValidationRule(index, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="min">Min Length</SelectItem>
                          <SelectItem value="max">Max Length</SelectItem>
                          <SelectItem value="pattern">Pattern</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeValidationRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {['min', 'max', 'pattern'].includes(rule.type) && (
                      <Input
                        placeholder="Value"
                        value={rule.value || ''}
                        onChange={(e) => updateValidationRule(index, 'value', e.target.value)}
                      />
                    )}
                    
                    <Input
                      placeholder="Error message"
                      value={rule.message || ''}
                      onChange={(e) => updateValidationRule(index, 'message', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
