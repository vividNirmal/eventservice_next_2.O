"use client"
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Users,
  FileText,
  MessageCircle,
  Star,
  Clock,
  Eye,
  Quote,
} from "lucide-react"

export default function Counter(){
    const stats = [
    {
      value: "0",
      label: "Pending Seller Approval",
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      change: "+0%",
      changeType: "neutral",
    },
    {
      value: "51",
      label: "No. of Sellers",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      change: "+12%",
      changeType: "positive",
    },
    {
      value: "232",
      label: "No. of Users",
      icon: User,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      change: "+8%",
      changeType: "positive",
    },
    {
      value: "6",
      label: "Quotations",
      icon: Quote,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      change: "+3%",
      changeType: "positive",
    },
    {
      value: "5",
      label: "Premium Request",
      icon: Star,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50",
      change: "+25%",
      changeType: "positive",
    },
    {
      value: "1",
      label: "Pending Listings",
      icon: FileText,
      gradient: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-50 to-pink-50",
      change: "-2%",
      changeType: "negative",
    },
    {
      value: "0",
      label: "No. of Live Sellers",
      icon: Eye,
      gradient: "from-teal-500 to-cyan-600",
      bgGradient: "from-teal-50 to-cyan-50",
      change: "+0%",
      changeType: "neutral",
    },
    {
      value: "8",
      label: "Chat Bot",
      icon: MessageCircle,
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-50 to-blue-50",
      change: "+15%",
      changeType: "positive",
    },
  ]
  return (
     <div className="w-full max-w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor your key metrics and performance indicators</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card
              key={index}
              className="group relative overflow-hidden shadow-none border border-solid border-zinc-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <CardContent className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      stat.changeType === "positive"
                        ? "bg-green-100 text-green-700"
                        : stat.changeType === "negative"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-gray-600 group-hover:text-gray-700 transition-colors leading-tight">
                    {stat.label}
                  </div>
                </div>

                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 group-hover:w-full`}
                    style={{ width: `${Math.min(Number.parseInt(stat.value) || 0, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

