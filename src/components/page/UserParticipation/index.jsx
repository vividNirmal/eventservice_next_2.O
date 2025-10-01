'use client'
import React, { useEffect, useState } from "react";
import ParticipanLogin from "./ParticipationLogin";
import DynamicParticipantForm from "./DynamicParticipantForm";
import QrPage from "./ParticipationQrcode";
import { userGetRequest } from "@/service/viewService";
import { useParams, useSearchParams } from "next/navigation";
import { usePreventHydrationMismatch } from "@/hooks/usePreventHydrationMismatch";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { ApiTester } from "@/components/debug/ApiTester";

const UserRegisterEvent = () => {
  // Prevent hydration mismatch from browser extensions
  usePreventHydrationMismatch();
  
  const params = useParams();
  const { token, shortId, eventSlug } = params; // Handle token, shortId (legacy), and eventSlug (new)
  const searchParams = useSearchParams();
  const formId = searchParams.get('form_id');
  
  const [eventStep, setEventStep] = useState(1);
  const [formData, setFormData] = useState({ email: "" });
  const [eventData, setEventData] = useState(null);
  const [visitReason, setVisitReason] = useState([]);
  const [companyVisit, setCompanyVisit] = useState([]);
  const [qrEventDetails, setQrEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);    
  const [faceScanner, setFaceScanner] = useState(false);
  const [eventHasFacePermission, setEventHasFacePermission] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [dynamicForm, setDynamicForm] = useState(null); // New state for dynamic form
  const [formLoading, setFormLoading] = useState(false); // Loading state for form
  const [resolvedFormId, setResolvedFormId] = useState(null); // For short URL resolved form_id
  const [registrationStatus, setRegistrationStatus] = useState(null); // For registration status errors

  useEffect(() => {
    
    // Handle new slug URL pattern: /[eventSlug]/registration
    if (eventSlug) {
      fetchShortUrlData(eventSlug);
      return;
    }
    
    // Handle legacy short URL pattern: /registration/[shortId]
    if (shortId) {
      fetchShortUrlData(shortId);
      return;
    }
    
    // Handle long URL pattern: /event/[token]?form_id=xxx
    if (!token) {
      console.error('❌ No token or shortId found in URL parameters');
      setLoading(false);
      return;
    }
    
    fetchEvantData(token);
    
    if (formId) {
      fetchDynamicForm(formId);
    } else {
      console.log('⚠️ No formId provided in URL parameters');
      // No form_id provided - we'll show an error in Step 2
      setDynamicForm(null);
    }
  }, [token, shortId, formId]);

  // Auto-advance to dynamic form if form_id is provided and event data is loaded
  useEffect(() => {
    const effectiveFormId = formId || resolvedFormId; // Use resolved form ID for short URLs
    // Only auto-advance if:
    // 1. form_id is provided (either from URL or resolved from shortId)
    // 2. eventData is loaded
    // 3. dynamicForm is loaded
    // 4. currently on step 1
    // 5. not loading
    // 6. user has already completed step 1 (has email/userEmail)
    if (effectiveFormId && eventData && dynamicForm && eventStep === 1 && !loading && userEmail) {
      // Set up formData with event context for dynamic form
      const newFormData = {
        ...formData,
        event_id: eventData._id,
        user_token: token || shortId, // Use token or shortId as user token
        email: userEmail, // Use existing user email
        // Add any other necessary fields
      };
      
      setFormData(newFormData);
      
      // Auto-advance to step 2 (dynamic form)
      setEventStep(2);
    } else if (effectiveFormId && eventData && !userEmail && eventStep === 1 && !loading) {
      console.log('⚠️ Form ID provided but user must complete Step 1 first');
      // Stay on Step 1 - user must register/login first
    }
  }, [formId, resolvedFormId, eventData, dynamicForm, eventStep, loading, token, shortId, eventSlug, userEmail]);

  // New function to handle short URL resolution
  async function fetchShortUrlData(slugOrShortId) {
    console.log('🔗 Resolving URL with ID/Slug:', slugOrShortId);
    
    try {
      const response = await userGetRequest(`resolve-form-url/${slugOrShortId}`);
      console.log('📡 URL resolution response:', response);
      console.log('📡 Response type:', typeof response);
      console.log('📡 Response status:', response?.status);
      
      // Handle registration status errors first
      if (response && response.status === 0) {
        console.log('🚫 Registration status error:', response.message);
        
        // Set loading to false and show appropriate message
        setLoading(false);
        
        // Set registration status error
        setRegistrationStatus({
          status: 'error',
          message: response.message,
          data: response.data || {}
        });
        
        // Show a toast or set error state
        if (response.message.includes('Registration not started yet')) {
          console.log('📅 Registration has not started yet');
        } else if (response.message.includes('Registration closed')) {
          console.log('🔒 Registration is closed');
        }
        
        return; // Stop further processing
      }
      
      // Check response status for success
      if (response && response.status === 1 && response.data) {
        console.log('✅ Response data structure:', JSON.stringify(response.data, null, 2));
        
        // Backend returns: { encryptedEventData, formId, eventSlug }
        // Frontend expects: { token, form_id }
        const { encryptedEventData: resolvedToken, formId: form_id } = response.data;
        console.log('✅ URL resolved:', { resolvedToken, form_id });
        
        // Set resolved form ID
        if (form_id) {
          setResolvedFormId(form_id);
          console.log('📄 Resolved FormId, fetching dynamic form:', form_id);
          fetchDynamicForm(form_id);
        } else {
          console.warn('⚠️ No form_id returned from URL resolution');
        }
        
        // Fetch event data using resolved token
        if (resolvedToken) {
          console.log('🎪 Calling fetchEvantData with resolved token:', resolvedToken);
          fetchEvantData(resolvedToken);
        } else {
          console.error('❌ Response data was:', response.data);
          setLoading(false);
        }
      } else {
        console.error('❌ Full response:', response);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error resolving short URL:', error);
      setLoading(false);
    }
  }

  async function fetchDynamicForm(formId) {
    try {
      setFormLoading(true);
      const response = await userGetRequest(`public/forms/${formId}`);
      if (response.status === 1 && response.data) {
        const formData = response.data.form;
        const transformedForm = {
          id: formData._id,
          title: formData.formName,
          description: `Please fill out this ${formData.userType} form`,
          elements: formData.formFields || [],
          settings: formData.settings || {
            submitText: 'Submit',
            confirmationMessage: 'Thank you for your submission!',
            allowMultipleSubmissions: false,
            requireAuth: false
          }
        };
        setDynamicForm(transformedForm);
      } else {
        console.error('Form not found or access denied. Response:', response);
        // Set empty form to show error state
        setDynamicForm(null);
      }
    } catch (error) {
      console.error('Error fetching dynamic form:', error);
      // Set empty form to show error state
      setDynamicForm(null);
    } finally {
      setFormLoading(false);
    }
  }

  async function fetchEvantData(token) {    
    if (!token) {
      console.error('❌ No token provided to fetchEvantData');
      setLoading(false);
      return;
    }
    
    try {
      const responce = await userGetRequest(`get-event-details-using-token/${token}`);
      console.log('📡 Event data API response:', responce);

      if (responce.status == 1) {
        const event = responce.data.result;
        
        if (event.participantUser) {
          setQrEventDetails(event);
          return;
        }
        
        // Process event data
        if (event.event) {
          
          setEventHasFacePermission(event.event.with_face_scanner == 1);
          setFormData((prev) => ({
            ...prev,
            event_id: event.event._id,
            user_token: event.user_token,
          }));
          setEventData(event.event);
        } else {
          console.warn('⚠️ No event data in response');
        }
        
        setVisitReason(event.visitReason || []);
        setCompanyVisit(event.company_visit || []);
        setLoading(false);
      } else {
        console.error('❌ API returned error status:', responce.status, responce);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error fetching event data:', error);
      setLoading(false);
    }
  }

  const handleRegisterEmail = (emailData) => {
        
    if (emailData) {
      setUserEmail(emailData.email);
      setFaceScanner(emailData.face_scanner);
      
      // Update form data with user information and preserve event context
      setFormData((prev) => ({ 
        ...prev, 
        ...emailData.user,
        email: emailData.email // Ensure email is set
      }));
      
      setEventStep(2);
    }
  };

  // Step validation guard
  const isStepValid = (step) => {
    switch (step) {
      case 1:
        // Step 1 is always accessible
        return true;
      case 2:
        // Step 2 requires user email (completed Step 1)
        return !!userEmail;
      case 3:
        // Step 3 requires form submission (qrEventDetails)
        return !!qrEventDetails;
      default:
        return false;
    }
  };

  // Force redirect to appropriate step if invalid
  useEffect(() => {
    if (!isStepValid(eventStep)) {
      console.warn(`⚠️ Invalid step ${eventStep}, redirecting to valid step`);
      if (!userEmail) {
        setEventStep(1);
      } else if (!qrEventDetails) {
        setEventStep(2);
      }
    }
  }, [eventStep, userEmail, qrEventDetails]);

  const handleFormSuccess = (response) => {

  // Extract participant data from response
  const participantData = response.message?.EventParticipantData || response.message?.participantUser;
  const participantUser = participantData?._id ? participantData : response.message?.participantUser;

  // Update formData with the response data
  const updatedFormData = {
    ...formData,
    participant_id: participantData?._id || participantData?.participant_user_id,
    event_id: participantData?.event_id || formData.event_id,
    user_token: participantData?.token || formData.user_token,
    email: participantData?.dynamic_form_data?.email || 
           participantData?.dynamic_form_data?.email_address ||
           participantUser?.dynamic_fields?.email ||
           participantUser?.dynamic_fields?.email_address ||
           formData.email ||
           userEmail
  };

  setFormData(updatedFormData);

  // Set the QR event details for Step 3 - ensure eventData and base64Image are included
  const qrDetails = {
    participantUser: participantUser || participantData,
    event: eventData || null,
    user_token: participantData?.token || formData.user_token,
    base64Image: response.message?.base64Image, // Directly assign base64Image from response
    ...participantData // Include all participant data
  };
  // Update qrEventDetails
  setQrEventDetails(qrDetails);

  setEventStep(3);
};

  // Registration Status Error Component
  const RegistrationStatusError = () => {
    if (!registrationStatus || registrationStatus.status !== 'error') return null;

    const { message, data } = registrationStatus;
    const isNotStarted = message.includes('Registration not started yet');
    const isClosed = message.includes('Registration closed');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {isNotStarted ? (
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isNotStarted ? 'Registration Not Started' : 'Registration Closed'}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {data.registrationFilterDate && isNotStarted && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Registration starts on:</strong><br />
                {new Date(data.registrationFilterDate).toLocaleString()}
              </p>
            </div>
          )}

          {data.eventEndDate && isClosed && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-800">
                <strong>Event ended on:</strong><br />
                {new Date(data.eventEndDate).toLocaleString()}
              </p>
            </div>
          )}

          {data.dateRanges && data.dateRanges.length > 0 && isClosed && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-800 mb-2">
                <strong>Event dates:</strong>
              </p>
              {data.dateRanges.map((range, index) => (
                <p key={index} className="text-xs text-gray-600">
                  {new Date(range.startDate).toLocaleDateString()} - {new Date(range.endDate).toLocaleDateString()}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Show registration status error if present */}
      {registrationStatus?.status === 'error' && <RegistrationStatusError />}
      
      {/* Show normal flow only if no registration status error */}
      {!registrationStatus?.status && eventStep === 1 && (
        <ParticipanLogin
          eventData={eventData}
          loading={loading}
          onRegisterEmail={handleRegisterEmail}
        />
      )}
      {!registrationStatus?.status && eventStep === 2 && (
        <DynamicParticipantForm
          userEmail={userEmail}
          eventData={eventData}
          formData={formData}
          faceScannerPermission={faceScanner}
          eventHasFacePermission={eventHasFacePermission}
          visitReason={visitReason}
          companyVisit={companyVisit}
          dynamicForm={dynamicForm}
          formLoading={formLoading}
          onFormSuccess={handleFormSuccess}
        />
      )}
      {!registrationStatus?.status && eventStep === 3 && (
        <QrPage
          eventDetails={qrEventDetails}
          formData={formData}
          eventData={eventData}
          token={token}
        />
      )}
      
      {/* Debug Panel - Only shows in development */}
      {/* <DebugPanel
        formData={formData}
        eventData={eventData}
        userEmail={userEmail}
        dynamicForm={dynamicForm}
        eventHasFacePermission={eventHasFacePermission}
        faceScannerPermission={faceScanner}
        qrEventDetails={qrEventDetails}
        currentStep={eventStep}
        formId={formId}
        token={token}
        loading={loading}
        formLoading={formLoading}
      /> */}
      
    </>
  );
};

export default UserRegisterEvent;
