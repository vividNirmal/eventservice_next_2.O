"use client";

import { getRequest } from "@/service/viewService";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import moment from "moment";

export default function EventFormList({ id }) {
  const [loading, setLoading] = useState(true);
  const [eventList, setEventList] = useState([]);
  const [eventNotRegister, setEventNotRegister] = useState("");
  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await getRequest(
        `eventuser-exhibitorForm-eventWise/${id}`
      );
      if (response.status === 1 && response.data) {
        if (response.data.eventFormList.length > 0) {
          setEventList(response.data.eventFormList);
        } else {
          setEventNotRegister("That Event Form not asing");
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
    <div className="max-w-7xl mx-auto px-4 py-12 relative z-20 w-full">
      <section className="w-full">
        <h2 className="text-base lg:text-lg 2xl:text-xl font-bold text-foreground mb-6 bg-white w-fit px-4 py-2 rounded-md">
          Exibitor Forms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventList.length > 0 ? (
            eventList?.map((show) => (
              <div className="relative bg-white rounded-lg p-6 border-l-4 border-solid border-orange-400 shadow-md overflow-hidden">
                {/* Decorative gold line on the right */}
                <div className="absolute z-2 inset-0 bg-gradient-to-br from-orange-400/10 via-transparent to-transparent transition-opacity duration-300" />
                <div className="space-y-3 relative z-10">
                  <h3 className="text-lg font-bold text-foreground">
                    {show.basicInfo?.full_name}
                  </h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    End Date : {moment(show.basicInfo?.due_date).format('DD/MM/YYYY')}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-amber-400 shrink-0">✓</span>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: show.basicInfo?.form_description,
                      }}
                      className="[&>div]:!mx-auto max-w-full overflow-auto"
                    />
                  </div>

                  <Button
                    onClick={() => console.log(show._id)}
                    className="mt-4 bg-orange-400 border-orange-400 hover:text-white hover:bg-orange-400 hover:border-orange-400 gap-2"
                  >
                    Apply Now
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div>{eventNotRegister}</div>
          )}
        </div>
      </section>
    </div>
  );
}
