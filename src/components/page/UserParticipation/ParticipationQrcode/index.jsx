import React, { useEffect, useState } from "react";
import moment from "moment-timezone";
import { Card } from "@/components/ui/card";
import { Calendar, Download, MapPin, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { pdfgenrate } from "@/service/viewService";

const QrPage = ({ eventDetails, eventData, formData,eventQr, registerFormDataId }) => {
  const [eventTime, setEventTime] = useState([]);
  const [eventDate, setEventDate] = useState();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  console.log('📱 QR Page - Component mounted with props:', {
    eventDetails: eventDetails,
    eventData: eventData,
    formData: formData
  });

  // Early return if essential data is missing
  if (!eventDetails && !eventData) {
    console.log('⚠️ QR Page - Missing essential data, showing loading state');
    return (
      <section className="h-screen bg-white px-4 py-5 md:py-10 lg:py-20 overflow-auto">
        <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border-0 mx-auto relative">
          <div className="p-6 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-gray-500">Loading event details...</p>
            <p className="text-sm text-gray-400">Please wait while we generate your QR code</p>
          </div>
        </Card>
      </section>
    );
  }

  useEffect(() => {
    console.log('🗓️ QR Page - Processing event details for dates:', eventDetails);
    console.log('🎪 QR Page - Event data:', eventData);

    // Handle different event details structures and prioritize available data
    let eventInfo = null;

    // Try to get event info from multiple sources
    if (eventDetails?.event) {
      eventInfo = eventDetails.event;
      console.log('📅 Using eventDetails.event as event info');
    } else if (eventData) {
      eventInfo = eventData;
      console.log('📅 Using eventData as event info');
    } else if (eventDetails && !eventDetails.event) {
      // Sometimes the event data might be directly in eventDetails
      eventInfo = eventDetails;
      console.log('📅 Using eventDetails directly as event info');
    }

    console.log('📅 Final event info extracted:', eventInfo);

    if (!eventInfo) {
      console.log('⚠️ No event information available for date processing');
      return;
    }

    // Try different possible date field names
    const startDates = eventInfo.start_date ||
      eventInfo.event_start_date ||
      (eventInfo.event?.start_date) ||
      (eventInfo.event?.event_start_date) ||
      [];
    const endDates = eventInfo.end_date ||
      eventInfo.event_end_date ||
      (eventInfo.event?.end_date) ||
      (eventInfo.event?.event_end_date) ||
      [];

    console.log('📅 Start dates found:', startDates);
    console.log('📅 End dates found:', endDates);

    if (startDates?.length && endDates?.length) {
      const times = startDates.map((start, idx) => {
        const end = endDates[idx];

        // Convert to IST (Asia/Kolkata timezone)
        const startMoment = moment.tz(start, "Asia/Kolkata");
        const endMoment = moment.tz(end, "Asia/Kolkata");

        const formattedDate = startMoment.format("Do MMMM YYYY");
        setEventDate(formattedDate);
        console.log(`📅 Formatted date (IST): ${formattedDate}`);

        const timeRange = `${startMoment.format("hh:mm A")} to ${endMoment.format("hh:mm A")} IST`;
        console.log(`⏰ Time range (IST): ${timeRange}`);
        return timeRange;
      });
      setEventTime(times);
      console.log('⏰ All event times set (IST):', times);
    } else {
      console.log('⚠️ No valid start/end dates found in event data');
      // Try to extract from event start/end time if dates are not arrays
      if (eventInfo.event_start_date && eventInfo.event_end_date) {
        const startDate = moment.tz(eventInfo.event_start_date, "Asia/Kolkata");
        const endDate = moment.tz(eventInfo.event_end_date, "Asia/Kolkata");
        setEventDate(startDate.format("Do MMMM YYYY"));

        if (eventInfo.event_start_time && eventInfo.event_end_time) {
          setEventTime([`${eventInfo.event_start_time} to ${eventInfo.event_end_time} IST`]);
        } else {
          setEventTime([`${startDate.format("hh:mm A")} to ${endDate.format("hh:mm A")} IST`]);
        }
        console.log('⏰ Set date/time from single event start/end dates (IST)');
      } else {
        console.log('❌ No date information found in any expected format');
      }
    }
  }, [eventDetails, eventData]);

  const handleDownload = async () => {
    try {
      setPdfLoading(true);

      const Adddata = new FormData();
      Adddata.append("formRegistrationId", registerFormDataId);

      const blob = await pdfgenrate("generate-pdf-scanner", Adddata);

      // The response is already a Blob, create a URL from it directly
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${eventDetails?.slug || eventData?.event_slug || 'event'}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = async () => {
    setPrintLoading(true);
    try {
      const Adddata = new FormData();
      Adddata.append("formRegistrationId", registerFormDataId);
      const blob = await pdfgenrate("generate-pdf-scanner", Adddata);
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setPrintLoading(false);
      };
    } catch (e) {
      console.error(e);
      setPrintLoading(false);
    }
  };

  return (
    <section className="h-screen bg-white px-4 py-5 md:py-10 lg:py-20 overflow-auto">
      <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border-0 mx-auto relative">
        {/* Header */}
        <div className="bg-zinc-100 px-6 py-4 relative rounded-t-xl">
          {/* Safe access to event logo with fallback */}
          {(eventDetails?.event?.event_logo || eventDetails?.event_logo || eventData?.event_logo) && (
            <img src={eventDetails?.event?.event_logo || eventDetails?.event_logo || eventData?.event_logo} className="mx-auto" alt="logo" />
          )}
          {/* Show placeholder if no logo */}
          {!(eventDetails?.event?.event_logo || eventDetails?.event_logo || eventData?.event_logo) && (
            <div className="mx-auto text-center py-4 text-gray-500">Event Logo</div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="flex items-center gap-3 text-slate-600">
            <div className="flex items-center justify-center w-10 h-10 bg-teal-50 rounded-full">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex flex-wrap gap-x-2">
              <p className="text-base font-medium text-zinc-950 w-full">Date & Time</p>
              <p className="text-sm text-zinc-500 font-semibold">{eventDetails?.startDate || eventData?.startDate} {eventDetails?.startTime || eventData?.startTime}</p>
              <p className="text-sm text-zinc-500 font-semibold">to</p>
              <p className="text-sm text-zinc-500 font-semibold">{eventDetails?.endDate || eventData?.endDate} {eventDetails?.endTime || eventData?.endTime}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 text-slate-600">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex flex-wrap gap-x-2">
              <p className="text-base font-medium text-zinc-950 w-full">Location</p>
              <p className="text-sm text-zinc-500 font-semibold capitalize">
                {eventDetails?.event?.location ||
                  eventDetails?.location ||
                  eventData?.location ||
                  eventDetails?.participantUser?.dynamic_fields?.location ||
                  eventDetails?.participantUser?.location ||
                  'Event Location'}
              </p>
            </div>
          </div>

          {/* Event Details */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              {eventDetails?.participantUser?.dynamic_form_data?.first_name ||
                eventDetails?.participantUser?.dynamic_form_data?.full_name ||
                eventDetails?.participantUser?.first_name ||
                'Participant'}{" "}
              {eventDetails?.participantUser?.dynamic_form_data?.last_name ||
                eventDetails?.participantUser?.last_name ||
                ''}
            </h2>
            <p className="text-slate-500 font-medium">
              ({eventDetails?.participantUser?.dynamic_form_data?.designation ||
                eventDetails?.participantUser?.dynamic_form_data?.role ||
                eventDetails?.participantUser?.designation ||
                'Participant'})
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-xl shadow-inner border-2 border-slate-100">
              {eventQr && (
                <Image
                  height={228}
                  width={228}
                  src={eventQr}
                  alt="QR Code for event access"
                />
              )}
              {!eventQr && (
                <div className="w-[228px] h-[228px] bg-gray-100 flex items-center justify-center rounded-lg">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
                    <p className="text-gray-500 text-sm">Generating QR Code...</p>
                  </div>
                </div>
              )}

              {/* Registration Number Below QR Code */}
              {eventDetails?.registration_number && (
                <div className="text-gray-800 text-sm text-center">
                  {eventDetails.registration_number}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="text-base flex-1 h-12 font-semibold border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300" onClick={handleDownload} disabled={pdfLoading}>
              {pdfLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button className="text-base flex-1 h-12 font-semibold !border-none hover:text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800" onClick={handlePrint} disabled={printLoading}>
              {printLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Printing...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute -bottom-px left-0 w-full h-2 bg-gradient-to-r from-teal-600 via-orange-400 to-teal-600"></div>
      </Card>

      {/* Loader */}
      {/* {(pdfLoading || printLoading) && <Loader loading={pdfLoading||printLoading} innerClass="border-gray-900" />} */}
    </section>
  );
};

export default QrPage;
