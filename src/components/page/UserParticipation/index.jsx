"use client";
import React, { useEffect, useState } from "react";
import ParticipanLogin from "./ParticipationLogin";
import DynamicParticipantForm from "./DynamicParticipantForm";
import QrPage from "./ParticipationQrcode";
import { userGetRequest, userPostRequest } from "@/service/viewService";
import { useParams, useSearchParams } from "next/navigation";
import { usePreventHydrationMismatch } from "@/hooks/usePreventHydrationMismatch";
import { toast } from "sonner";
import TicketBooking from "./businessParticipant/BusinessParticipant";
import FaceScannerFrom from "./FaceScanner/FaceScannerFrom";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import ParticipantForm from "./StaticParticipationForm_LEGACY";

const UserRegisterEvent = () => {
  // Prevent hydration mismatch from browser extensions
  usePreventHydrationMismatch();

  const params = useParams();
  const { eventSlug, userSlug } = params;
  const [eventStep, setEventStep] = useState(1);
  const [formData, setFormData] = useState({ email: "" });
  const [eventData, setEventData] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  const [visitReason, setVisitReason] = useState([]);
  const [companyVisit, setCompanyVisit] = useState([]);
  const [qrEventDetails, setQrEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [faceScanner, setFaceScanner] = useState(false);
  const [eventHasFacePermission, setEventHasFacePermission] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [dynamicForm, setDynamicForm] = useState(null); // New state for dynamic form
  const [formLoading, setFormLoading] = useState(false); // Loading state for form
  const [resolvedForm, setResolvedForm] = useState(null); // For short URL resolved form_id
  const [registrationStatus, setRegistrationStatus] = useState(null); // For registration status errors
  const [businessForm, setBusinessFrom] = useState(null);
  const [faceDate, setFaceDate] = useState(null);
  const [registerFormDataId, setRegisterFormDataId] = useState(null)

  useEffect(() => {
    // Handle new slug URL pattern: /[eventSlug]/registration
    if (eventSlug) {
      fetchEventDetails();
      return;
    }
  }, [eventSlug, userSlug]);

  async function fetchEventDetails() {
    try {
      const userTypeSlug = userSlug.split("-")[1];
      const formData = new FormData();
      formData.append("eventSlug", eventSlug);
      formData.append("userTypeSlug", userTypeSlug);
      const response = await userPostRequest("resolve-ticket-url", formData);
      if (response.status == 1) {
        setEventData(response?.data.event);
        setTicketData(response?.data.ticket);
        setDynamicForm(response?.data.ticket?.registrationFormId);
        toast.success(response.message || "Job saved successfully!");
      } else {
        toast.error(response.message || "Failed to save job.");
      }
    } catch (error) {
      console.error("❌ Error resolving short URL:", error);
      setLoading(false);
    }
  }

  const handleRegisterEmail = (emailData) => {    
    
    if (emailData) {
      setUserEmail(emailData.email);
      setFaceScanner(emailData.face_scanner);

      if (ticketData?.ticketAmount?.type == "businessSlab") {
        setEventStep(2);
      } else {
        setEventStep(3);
      }
      const evetRegsterUserData = emailData?.data
      
      if(evetRegsterUserData?.alreadyRegistered && evetRegsterUserData?.formRegistration){
        
        setQrEventDetails(evetRegsterUserData?.formRegistration.qrImage)  
        setRegisterFormDataId(evetRegsterUserData?.formRegistration?._id)
        setEventStep(5);
      }
      setFormData((prev) => ({
        ...prev,
        ...emailData.user,
        email: emailData.email,
      }));
    }
  };

  // Step validation guard
  // const isStepValid = (step) => {
  //   switch (step) {
  //     case 1:
  //       return true;
  //     case 2:
  //       return !!userEmail;
  //     case 3:
  //       return !!qrEventDetails;
  //     default:
  //       return false;
  //   }
  // };

  // // Force redirect to appropriate step if invalid
  // useEffect(() => {
  //   if (!isStepValid(eventStep)) {
  //     console.warn(`⚠️ Invalid step ${eventStep}, redirecting to valid step`);
  //     if (!userEmail) {
  //       setEventStep(1);
  //     } else if (!qrEventDetails) {
  //       setEventStep(2);
  //     }
  //   }
  // }, [eventStep, userEmail, qrEventDetails]);

  const handleFormSuccess = async (response) => {
    try {
      // dyanamic FormDate convert
      const formData = new FormData();
      formData.append("email", userEmail);
      formData.append("ticketId", ticketData?._id);
      formData.append("eventId", eventData?._id);
      Object.entries(response).forEach(([key, value]) => {
        if (key === "email") {
          return;
        }
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          // Handle arrays (e.g. multiple IDs, objects, etc.)
          value.forEach((item, index) => {
            if (typeof item === "object" && !(item instanceof File)) {
              Object.entries(item).forEach(([subKey, subVal]) => {
                formData.append(`${key}[${index}][${subKey}]`, subVal);
              });
            } else {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else if (typeof value === "object" && value !== null) {
          // Handle nested objects
          Object.entries(value).forEach(([subKey, subVal]) => {
            formData.append(`${key}[${subKey}]`, subVal);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
       if(businessForm){
        formData.append("businessData[category]", businessForm?.category);
        formData.append("businessData[amount]", businessForm?.amount);
      }
      if (eventData?.with_face_scanner == 1) {
        setEventStep(4);
        setResolvedForm(response);
      } else {
        const responce = await userPostRequest("store-register-form", formData);
        if (responce.status == 1) {
          setQrEventDetails(responce.data?.qrImageUrl);
          setRegisterFormDataId(responce?.data?.registrationId);
          setEventStep(5);
        }
      }
     
    } catch (err) {
      console.log(err.message);
      return; // Prevent further execution if error occurs
    }
    // Extract participant data from response
    // const participantData =
    //   response.message?.EventParticipantData ||
    //   response.message?.participantUser;
    // const participantUser = participantData?._id
    //   ? participantData
    //   : response.message?.participantUser;

    // // Update formData with the response data
    // const updatedFormData = {
    //   ...formData,
    //   participant_id:
    //     participantData?._id || participantData?.participant_user_id,
    //   event_id: participantData?.event_id || formData.event_id,
    //   email:
    //     participantData?.dynamic_form_data?.email ||
    //     participantData?.dynamic_form_data?.email_address ||
    //     participantUser?.dynamic_fields?.email ||
    //     participantUser?.dynamic_fields?.email_address ||
    //     formData.email ||
    //     userEmail,
    // };

    // setFormData(updatedFormData);

    // Set the QR event details for Step 3 - ensure eventData and base64Image are included
    // const qrDetails = {
    //   participantUser: participantUser || participantData,
    //   event: eventData || null,
    //   base64Image: response.message?.base64Image, // Directly assign base64Image from response
    //   ...participantData, // Include all participant data
    // };
    // Update qrEventDetails
    // setQrEventDetails(qrDetails);
  };

  async function handelFaseScanner(faceData) {
    try {
      const formData = new FormData();
      formData.append("email", userEmail);
      formData.append("ticketId", ticketData?._id);
      formData.append("eventId", eventData?._id);
      // key Changes
      formData.append("faceScan", faceData);
      Object.entries(resolvedForm).forEach(([key, value]) => {
        if (key === "email") {
          return;
        }
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          // Handle arrays (e.g. multiple IDs, objects, etc.)
          value.forEach((item, index) => {
            if (typeof item === "object" && !(item instanceof File)) {
              Object.entries(item).forEach(([subKey, subVal]) => {
                formData.append(`${key}[${index}][${subKey}]`, subVal);
              });
            } else {
              formData.append(`${key}[${index}]`, item);
            }
          });
        } else if (typeof value === "object" && value !== null) {
          // Handle nested objects
          Object.entries(value).forEach(([subKey, subVal]) => {
            formData.append(`${key}[${subKey}]`, subVal);
          });
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      if(businessForm){
        formData.append("businessData[category]", businessForm?.category);
        formData.append("businessData[amount]", businessForm?.amount);
      }
      const responce = await userPostRequest("store-register-form", formData);
      if (responce.status == 1) {
        setQrEventDetails(responce.data?.qrImageUrl)
        setRegisterFormDataId(responce?.data?.registrationId);
        setEventStep(5);
      }
    } catch (err) {
      console.log(err.message);
      return; // Prevent further execution if error occurs
    }
  }

  const handleBUnessDate = (data) => {
    if (data) {
      setBusinessFrom(data);
      setEventStep(3);
    }
  };

  // Registration Status Error Component
  const RegistrationStatusError = () => {
    if (!registrationStatus || registrationStatus.status !== "error")
      return null;

    const { message, data } = registrationStatus;
    const isNotStarted = message.includes("Registration not started yet");
    const isClosed = message.includes("Registration closed");

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {isNotStarted ? (
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isNotStarted ? "Registration Not Started" : "Registration Closed"}
          </h1>

          <p className="text-gray-600 mb-6">{message}</p>

          {data.registrationFilterDate && isNotStarted && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Registration starts on:</strong>
                <br />
                {new Date(data.registrationFilterDate).toLocaleString()}
              </p>
            </div>
          )}

          {data.eventEndDate && isClosed && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-800">
                <strong>Event ended on:</strong>
                <br />
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
                  {new Date(range.startDate).toLocaleDateString()} -{" "}
                  {new Date(range.endDate).toLocaleDateString()}
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
      {registrationStatus?.status === "error" && <RegistrationStatusError />}
      {/* Show normal flow only if no registration status error */}
      {!registrationStatus?.status && eventStep === 1 && (        
        <ParticipanLogin
          eventData={eventData}
          ticketData={ticketData}
          loading={loading}
          onRegisterEmail={handleRegisterEmail}
        />
      )}
      {!registrationStatus?.status && eventStep === 2 && (
        <TicketBooking
          businessData={ticketData}
          businessForm={handleBUnessDate}
          eventData={eventData}
        />
      )}
      {!registrationStatus?.status && eventStep === 3 && (
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
          ticketData={ticketData}
        />
        // <ParticipantForm
        //   userEmail={userEmail}
        //   eventData={eventData}
        //   formData={formData}
        //   faceScannerPermission={faceScanner}
        //   eventHasFacePermission={eventHasFacePermission}
        //   visitReason={visitReason}
        //   companyVisit={companyVisit}
        //   dynamicForm={dynamicForm}
        // />
      )}
      {!registrationStatus?.status &&
        eventStep === 4 &&
        eventData?.with_face_scanner == 1 && (
          <FaceScannerFrom faceDate={handelFaseScanner} ticketData={ticketData} eventData={eventData} />
        )}
      {!registrationStatus?.status && eventStep === 5 && (
        <QrPage
          eventDetails={eventData}
          formData={formData}
          eventData={eventData}
          token={"After_Pass_Data"}
          eventQr = {qrEventDetails}
          registerFormDataId={registerFormDataId}
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
        loading={loading}
        formLoading={formLoading}
      /> */}
    </>
  );
};

export default UserRegisterEvent;
