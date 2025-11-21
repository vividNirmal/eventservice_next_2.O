"use client"
import { Button } from "@/components/ui/button"
import { userGetRequest } from "@/service/viewService"
import { Calendar, Clock, MapPin, Mail, Phone, Globe, User, LogIn, UserPlus, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function EventDetails({ evenId }) {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [eventImageError, setEventImageError] = useState(false)
  const [logoImageError, setLogoImageError] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [evenId])

  async function fetchEvent() {
    try {
      const response = await userGetRequest(`get-event-host-details/${evenId}`)
      if (response?.status === 1 && response?.data) {
        setEvent(response.data?.user)
      }
    } catch (error) {
      console.error("Error fetching event details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventImageError = () => {
    setEventImageError(true)
  }

  const handleLogoImageError = () => {
    setLogoImageError(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section with Banner Background */}
      <div className="relative h-[350px] md:h-[450px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={eventImageError || !event.event_image ? "/vibrant-event-banner.png" : event.event_image}
            alt="Event Banner"
            fill
            className="object-cover"
            priority
            onError={handleEventImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-12 text-white">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end">
            {/* Event Logo */}
            <div className="relative h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-xl border-4 border-white bg-white shadow-xl shrink-0">
              <Image
                src={logoImageError || !event.event_logo ? "/event-icon.png" : event.event_logo}
                alt="Event Logo"
                fill
                className="object-contain p-2"
                onError={handleLogoImageError}
              />
            </div>

            <div className="flex-1 space-y-3 mb-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                  {event.event_category?.title || "Event"}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm">
                  {event.eventType}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white shadow-sm">{event.eventName}</h1>
              <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl">{event.event_title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-8 px-4 relative z-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden border-none shadow-md bg-white">
              <CardContent className="p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b pb-2">About This Event</h2>
                <p className="leading-relaxed text-gray-600 text-lg">{event.event_description}</p>
              </CardContent>
            </Card>

            {/* Action Buttons Section */}
            <div className="grid gap-4 sm:grid-cols-3 pt-4">
              <Button
                size="lg"
                className="w-full h-14 text-base gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <UserPlus className="h-5 w-5" />
                Visitor Register
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 text-base gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 bg-transparent"
              >
                <Building2 className="h-5 w-5" />
                Exhibitor Register
              </Button>

              <Button
                size="lg"
                variant="secondary"
                className="w-full h-14 text-base gap-2 bg-slate-800 text-white hover:bg-slate-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <LogIn className="h-5 w-5" />
                Login
              </Button>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Date & Time Card */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Event Schedule</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-600 shrink-0">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Date</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.startDate} to {event.endDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-orange-50 p-3 text-orange-600 shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Time</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Location</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-green-50 p-3 text-green-600 shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{event.location}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.address}</p>
                    {event.google_map_url && (
                      <a
                        href={event.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View on Google Maps <Globe className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card className="border-none shadow-md bg-white overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Organizer</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gray-100 p-2 shrink-0">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{event.organizer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gray-100 p-2 shrink-0">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600">{event.organizer_email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-gray-100 p-2 shrink-0">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600">{event.organizer_phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}