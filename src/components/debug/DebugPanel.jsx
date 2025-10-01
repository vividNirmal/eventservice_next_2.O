'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';

/**
 * Debug Panel Component for Development
 * Shows current state and helps debug form submission issues
 */
export function DebugPanel({ 
  formData, 
  eventData, 
  userEmail, 
  dynamicForm, 
  eventHasFacePermission, 
  faceScannerPermission, 
  qrEventDetails, 
  currentStep,
  formId,
  token,
  loading,
  formLoading
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const debugInfo = {
    currentStep: currentStep || 'UNKNOWN',
    flowType: formId ? 'DYNAMIC_FORM' : 'STANDARD',
    formId: formId || 'NOT_PROVIDED',
    token: token || 'NOT_PROVIDED',
    loading: loading ? 'YES' : 'NO',
    formLoading: formLoading ? 'YES' : 'NO',
    autoAdvanceReady: formId && eventData && dynamicForm && currentStep === 1 ? 'YES' : 'NO',
    formData: {
      event_id: formData?.event_id || 'MISSING',
      user_token: formData?.user_token || 'MISSING',
      email: formData?.email || userEmail || 'MISSING',
      participant_id: formData?.participant_id || 'MISSING',
      hasOtherFields: Object.keys(formData || {}).length > 3 ? 'YES' : 'NO'
    },
    eventData: {
      loaded: !!eventData ? 'YES' : 'NO',
      name: eventData?.event_title || eventData?.eventName || 'MISSING',
      eventId: eventData?._id || 'MISSING',
      withFaceScanner: eventData?.with_face_scanner,
      hasDates: !!(eventData?.start_date || eventData?.event_start_date) ? 'YES' : 'NO',
      startDate: eventData?.start_date || eventData?.event_start_date || 'MISSING',
      endDate: eventData?.end_date || eventData?.event_end_date || 'MISSING'
    },
    qrEventDetails: currentStep === 3 ? {
      hasQrDetails: !!qrEventDetails ? 'YES' : 'NO',
      hasEvent: !!qrEventDetails?.event ? 'YES' : 'NO',
      hasParticipant: !!qrEventDetails?.participantUser ? 'YES' : 'NO',
      hasQrCode: !!qrEventDetails?.base64Image ? 'YES' : 'NO',
      userToken: qrEventDetails?.user_token || 'MISSING'
    } : null,
    dynamicForm: {
      hasForm: !!dynamicForm ? 'YES' : 'NO',
      formId: dynamicForm?.id || 'MISSING',
      formTitle: dynamicForm?.title || 'MISSING',
      elementsCount: dynamicForm?.elements?.length || 0
    },
    faceScanner: {
      eventPermission: eventHasFacePermission ? 'YES' : 'NO',
      userPermission: faceScannerPermission ? 'YES' : 'NO',
      status: eventHasFacePermission ? (faceScannerPermission ? 'ENABLED' : 'AVAILABLE') : 'DISABLED'
    }
  };

  const hasIssues = 
    !formData?.event_id || 
    !formData?.user_token || 
    (!formData?.email && !userEmail) ||
    !eventData ||
    (currentStep === 3 && !qrEventDetails);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className={`w-80 shadow-lg border-2 ${hasIssues ? 'border-red-500' : 'border-green-500'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Panel (Step {debugInfo.currentStep})
              {hasIssues && <span className="text-red-500 text-xs">(Issues Detected)</span>}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        
        {isOpen && (
          <CardContent className="pt-0 text-xs">
            <div className="space-y-3">
              {/* Flow Information */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Flow Information</h4>
                <div className="bg-blue-50 p-2 rounded text-xs font-mono">
                  <div className="text-blue-700">
                    flow_type: {debugInfo.flowType}
                  </div>
                  <div className="text-gray-600">
                    current_step: {debugInfo.currentStep}
                  </div>
                  <div className="text-gray-600">
                    form_id: {debugInfo.formId}
                  </div>
                  <div className="text-gray-600">
                    token: {debugInfo.token?.substring(0, 10)}...
                  </div>
                  <div className={debugInfo.loading === 'YES' ? 'text-orange-600' : 'text-gray-600'}>
                    loading: {debugInfo.loading}
                  </div>
                  <div className={debugInfo.formLoading === 'YES' ? 'text-orange-600' : 'text-gray-600'}>
                    form_loading: {debugInfo.formLoading}
                  </div>
                  <div className={debugInfo.autoAdvanceReady === 'YES' ? 'text-green-600' : 'text-gray-600'}>
                    auto_advance_ready: {debugInfo.autoAdvanceReady}
                  </div>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Form Data</h4>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  <div className={debugInfo.formData.event_id === 'MISSING' ? 'text-red-600' : 'text-green-600'}>
                    event_id: {debugInfo.formData.event_id}
                  </div>
                  <div className={debugInfo.formData.user_token === 'MISSING' ? 'text-red-600' : 'text-green-600'}>
                    user_token: {debugInfo.formData.user_token}
                  </div>
                  <div className={debugInfo.formData.email === 'MISSING' ? 'text-red-600' : 'text-green-600'}>
                    email: {debugInfo.formData.email}
                  </div>
                  <div className={debugInfo.formData.participant_id === 'MISSING' ? 'text-red-600' : 'text-green-600'}>
                    participant_id: {debugInfo.formData.participant_id}
                  </div>
                  <div className="text-gray-600">
                    other_fields: {debugInfo.formData.hasOtherFields}
                  </div>
                </div>
              </div>

              {/* Event Data */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Event Data</h4>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  <div className={debugInfo.eventData.loaded === 'NO' ? 'text-red-600' : 'text-green-600'}>
                    loaded: {debugInfo.eventData.loaded}
                  </div>
                  <div className="text-gray-600">
                    name: {debugInfo.eventData.name}
                  </div>
                  <div className="text-gray-600">
                    face_scanner: {debugInfo.eventData.withFaceScanner}
                  </div>
                  <div className="text-gray-600">
                    has_dates: {debugInfo.eventData.hasDates}
                  </div>
                </div>
              </div>

              {/* QR Event Details (only show on step 3) */}
              {debugInfo.qrEventDetails && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">QR Step Data</h4>
                  <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                    <div className={debugInfo.qrEventDetails.hasQrDetails === 'NO' ? 'text-red-600' : 'text-green-600'}>
                      qr_details: {debugInfo.qrEventDetails.hasQrDetails}
                    </div>
                    <div className={debugInfo.qrEventDetails.hasEvent === 'NO' ? 'text-red-600' : 'text-green-600'}>
                      event_data: {debugInfo.qrEventDetails.hasEvent}
                    </div>
                    <div className={debugInfo.qrEventDetails.hasParticipant === 'NO' ? 'text-red-600' : 'text-green-600'}>
                      participant: {debugInfo.qrEventDetails.hasParticipant}
                    </div>
                    <div className={debugInfo.qrEventDetails.hasQrCode === 'NO' ? 'text-red-600' : 'text-green-600'}>
                      qr_code: {debugInfo.qrEventDetails.hasQrCode}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Form */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Dynamic Form</h4>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  <div className={debugInfo.dynamicForm.hasForm === 'NO' ? 'text-red-600' : 'text-green-600'}>
                    loaded: {debugInfo.dynamicForm.hasForm}
                  </div>
                  <div className="text-gray-600">
                    form_id: {debugInfo.dynamicForm.formId}
                  </div>
                  <div className="text-gray-600">
                    elements: {debugInfo.dynamicForm.elementsCount}
                  </div>
                </div>
              </div>

              {/* Face Scanner */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Face Scanner</h4>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  <div className={`${
                    debugInfo.faceScanner.status === 'ENABLED' ? 'text-green-600' :
                    debugInfo.faceScanner.status === 'AVAILABLE' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    status: {debugInfo.faceScanner.status}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    console.log('🐛 Debug Info:', debugInfo);
                    console.log('🔍 Full Form Data:', formData);
                    console.log('🎪 Full Event Data:', eventData);
                    console.log('📝 Full Dynamic Form:', dynamicForm);
                    if (qrEventDetails) console.log('📱 QR Event Details:', qrEventDetails);
                  }}
                >
                  Log Full State to Console
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
