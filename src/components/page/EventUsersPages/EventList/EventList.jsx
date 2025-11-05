"use client";
import { useEffect, useState } from "react";
import { EventAttendeesCard, ExhibitorCard } from "./EventAttendeesCard";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getRequest } from "@/service/viewService";


export default function UserEventList() {
  const { userType } = useSelector((state) => state.eventUser);
  const [loading, setLoading] = useState(true);
  const [attendeesData,setAttendeesData] = useState([]);
  const [exhibitor, setExhibitor] = useState([])  
  useEffect(()=>{ 
    fetchForm()   
  },[])
  const fetchForm = async () => {    
    try {
      setLoading(true);
      const response = await getRequest(`/eventuser-events`);
      if (response.status === 1 && response.data) {        
        if(response.data.groupedData){
          response.data.groupedData.map((item)=>{
            if(item.userType == 'Exhibitor'){
              setExhibitor(item.data)
            }
            if(item.userType == 'Event Attendees'){
              setAttendeesData(item.data)
            }
          })
        }
      } else {
        console.log("❌ API Response error or no data:", response);
      }
    } catch (error) {
      console.error("🚨 Error fetching form:", error);
      toast.error("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

   if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ....</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {userType?.typeName === "Event Attendees" && (
          <section className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Available Packages
            </h2>
            <div className="space-y-4">
              {exhibitor?.map((pkg) => (
                <ExhibitorCard
                  key={pkg._id}
                  title={pkg.eventId?.event_title}
                  description={pkg.eventId?.event_description}
                  price={pkg.price}
                  onBuyNow={() => onAction?.(pkg.id)}
                />
              ))}
            </div>
          </section>
        )}
        {userType?.typeName === "Exhibitor" && (
          <section className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Explore Shows
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendeesData?.map((show) => (
                <EventAttendeesCard
                  key={show._id}
                  title={show.eventId?.event_title}
                  description={show.eventId?.event_description}
                  onApply={() => onAction?.(show.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
