"use client"
import { Button } from "@/components/ui/button"
import { userGetRequest } from "@/service/viewService"
import { Calendar, Clock, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function EventListByshow({ evenId }) {
  const route = useRouter();
  const [events, setEvents] = useState([]);
  const [eventShows, setEventShows] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent()
  }, [evenId])

  async function fetchEvent() {
    try {
      setLoading(true)
      const responce = await userGetRequest(`event-get-by-category/${evenId}`)
      if (responce?.status === 1 && responce?.data) {
        setEvents(responce.data.event)
        if (responce.data.event[0]?.event_category) {
          setEventShows(responce.data.event[0]?.event_category)
        }
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error("Error fetching company details:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
          <div className="absolute inset-0 bg-[url('/abstract-event-pattern.jpg')] opacity-10 bg-cover bg-center" />
        </div>

       
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

       
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

        
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
          <div className="text-center space-y-6">
            
          

            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
              {eventShows?.title || "Event Category"}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light max-w-2xl mx-auto">
              Discover amazing events and experiences
            </p>
            <div className="w-32 h-1.5 bg-white/80 mx-auto rounded-full" />
          </div>
        </div>

       
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(248, 250, 252)"
            />
          </svg>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="py-20 relative">
        { loading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 font-medium">Loading events...</p>
            </div>
          </div>
        ) : events?.length === 0 ? (
          <div className="h-[50vh] flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-700">No events available right now</p>
              <p className="text-gray-500 mt-2">Please check again later.</p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((item, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200"
                >
                  {/* Event Image/Logo Header */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/vibrant-event-banner.png')] bg-cover bg-center opacity-20" />

                    {/* Event Logo Badge */}
                    <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                      <img src="/event-icon.png" alt={item.eventName} className="w-10 h-10 object-contain" />
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                      {item.eventName}
                    </h3>

                    <p className="text-slate-600 leading-relaxed line-clamp-3">{item.event_description}</p>

                    {/* Event Dates/Times */}
                    {item?.dateRanges?.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        {item.dateRanges.map((dateItem, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Calendar className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{dateItem.startDate}</span>
                              <span className="text-slate-400">→</span>
                              <span className="font-medium">{dateItem.endDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>
                                {dateItem.startTime} - {dateItem.endTime}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-xl transition-all duration-200 group/btn" onClick={() => route.push(`/show-event/event-details/${item._id}`)}>
                      <span>View Details</span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
