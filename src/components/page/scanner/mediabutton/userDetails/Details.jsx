import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { pdfgenrate, userPostRequest } from '@/service/viewService';

const Details = ({ data, event_slug, user_token, printPermission = false, userData, onRedirect }) => {
  const [userDetails, setUserDetails] = useState([]);
  const [eventTime, setEventTime] = useState([]);
  const [loader, setLoader] = useState(false);
  const [downloadLoader, setDownloadLoader] = useState(false);
  const scannerToken = JSON.parse(localStorage.getItem('scannerloginToken')) || null;

  useEffect(() => {
    if (userData) {
      setUserDetails(userData);
    } else if (data) {
      fetchUserDetails();
    }
  }, [data, userData]);

  const fetchUserDetails = async () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('event_slug', data?.event_slug);
    formData.append('user_token', data?.user_token);
    formData.append('scanner_type', scannerToken ? scannerToken.type : 0);

    try {
      const response = await userPostRequest('get-scanner-data-details',formData);
      if (response.status == 1) {
        setUserDetails(response.data);
        generateEventTime(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    } finally {
      setLoader(false);
    }
  };

  const generateEventTime = (eventData) => {
    const startDates = eventData?.start_date || [];
    const endDates = eventData?.end_date || [];
    const timeArr = startDates.map((start, index) => {
      const formattedStart = moment(start).format('Do MMMM YYYY - hh : mm A');
      const formattedEnd = moment(endDates[index]).format('hh : mm A');
      return `${formattedStart} to ${formattedEnd}`;
    });
    setEventTime(timeArr);
  };

  const handlePrint = async () => {
    setDownloadLoader(true);
    const formData = new FormData();
    formData.append('event_slug', data?.event_slug);
    formData.append('user_token', data?.user_token);

    try {
      const pdfData = await pdfgenrate('generate-event-pdf-scanner',formData);
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);                  
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = fileURL;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setDownloadLoader(false);
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
    } catch (err) {
      console.error('Error generating PDF:', err);
      setDownloadLoader(false);
    }
  };

  const handleGo = () => {
    setTimeout(() => {
      if (onRedirect) onRedirect();
    }, 1000);
  };

  if (loader) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30">
        <div className="w-10 h-10 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[992px] w-full mx-auto rounded-3xl lg:rounded-[40px] border border-solid bg-[#F3F3F3] border-[#F3F3F3] py-6 px-4 md:px-6 lg:px-8 xl:px-10 shadow-[0px_0px_0px_4px_rgba(0,81,83,0.14)]">
      <div className="bg-[#1E3238] rounded-3xl max-w-56 md:max-w-60 mx-auto">
        <img className="max-w-full block" alt="logo" src={userDetails[0]?.event_logo} />
      </div>

      <div className="rounded-xl bg-gray-200 flex flex-wrap my-4 p-3 gap-2">
        {eventTime.map((time, index) => (
          <span key={index}>{time}</span>
        ))}
        {userDetails[0]?.address}
      </div>

      <div className="w-full p-4 text-center">
        <h3 className="text-xl font-semibold text-black text-center mb-2">
          {userDetails[2]?.first_name} {userDetails[2]?.last_name}
        </h3>
        <span className="text-sm text-black text-center block mb-4">
          ({userDetails[2]?.designation})
        </span>
      </div>

      <img
        src={userDetails[1]?.qr_image}
        className="mx-auto block max-w-[65%] md:max-w-[326px] mb-6"
        alt="QR img"
      />

      <div className="bg-[#1E3238] rounded-3xl max-w-56 md:max-w-60 mx-auto">
        <img className="max-w-full block" alt="logo" src={userDetails[0]?.event_logo} />
      </div>

      <div className="flex flex-wrap mt-3 items-center gap-4 md:gap-10 justify-center">
        <button
          className={`flex items-center justify-center gap-2 group flex-grow w-full md:w-2/5 py-3 px-12 text-sm lg:text-base font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear max-w-[50%] ${downloadLoader ? 'loading' : ''}`}
          onClick={handlePrint}
        >
          Print
        </button>
        <button
          className="flex items-center justify-center gap-2 group flex-grow w-full md:w-2/5 py-3 px-12 text-sm lg:text-base font-medium rounded-3xl bg-[#005153] text-white border border-solid border-[#005153] hover:bg-white hover:text-[#005153] transition-all duration-300 ease-linear max-w-[50%]"
          onClick={handleGo}
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default Details;