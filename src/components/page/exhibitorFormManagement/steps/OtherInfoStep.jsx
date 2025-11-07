import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import dynamic from "next/dynamic";
import { textEditormodule } from "@/lib/constant";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
});

const OtherInfoStep = ({ formData, handleInputChange, errors }) => {
  const { otherInfo } = formData;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label>Terms and Conditions *</Label>
        <div className="min-h-64 border rounded-md">
          <ReactQuill 
            theme="snow" 
            value={otherInfo.terms_and_condition || ""} 
            onChange={(value) => handleInputChange("otherInfo.terms_and_condition", value)} 
            modules={textEditormodule.modules}
            className="!shadow-none w-full min-h-64 flex flex-col [&>.ql-container.ql-snow]:flex [&>.ql-container.ql-snow]:flex-col [&>.ql-container>.ql-editor]:grow [&>.ql-toolbar.ql-snow]:rounded-t-md [&>.ql-container.ql-snow]:rounded-b-md [&>.ql-container.ql-snow]:flex-grow"
          />
        </div>
        {errors.terms_and_condition && (
          <p className="text-red-500 text-xs mt-1">{errors.terms_and_condition}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ofline_order_summary">Offline Order Summary</Label>
        <Textarea
          id="ofline_order_summary"
          value={otherInfo.ofline_order_summary}
          onChange={(e) => handleInputChange('otherInfo.ofline_order_summary', e.target.value)}
          placeholder="Enter offline order summary"
          rows={4}
        />
      </div>
    </div>
  );
};

export default OtherInfoStep;