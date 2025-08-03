import React from "react"
import { Card } from "@/components/ui/card"
import { User, AlertCircle, CheckCircle, DollarSign } from "lucide-react"

interface StatsCardsProps {
  students: any[]
  monthlyFees: any[]
  getPendingFeesCount: (student: any) => number
  getTotalCollection: () => number
  getPaidThisMonth: () => number
}

export default function StatsCards({
  students,
  monthlyFees,
  getPendingFeesCount,
  getTotalCollection,
  getPaidThisMonth
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Students",
      icon: <User className="h-5 w-5 text-blue-500" />,
      value: students.length,
      subtitle: "Enrolled",
      color: "blue",
    },
    {
      title: "Pending Fees",
      icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
      value: students.filter((s) => getPendingFeesCount(s) > 0).length,
      subtitle: "With pending fees",
      color: "orange",
    },
    {
      title: "Paid This Month",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      value: `₹${getPaidThisMonth()}`,
      subtitle: "Collected",
      color: "green",
    },
    {
      title: "Total Collection",
      icon: <DollarSign className="h-5 w-5 text-purple-500" />,
      value: `₹${getTotalCollection()}`,
      subtitle: "Till now",
      color: "purple",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`
            flex items-center justify-between gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-lg shadow-sm
            bg-gradient-to-br from-${stat.color}-50 to-white dark:from-${stat.color}-950 dark:to-zinc-900
            border-l-4 border-${stat.color}-500
            hover:shadow-md transition-shadow duration-200
          `}
        >
          <div className="flex-1 min-w-0">
            <h4 className="text-xs md:text-sm font-medium text-muted-foreground truncate">{stat.title}</h4>
            <div className={`text-base md:text-lg font-semibold text-${stat.color}-700 dark:text-${stat.color}-300 truncate`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground truncate">{stat.subtitle}</p>
          </div>
          <div className="bg-white dark:bg-zinc-800/30 p-1.5 md:p-2 rounded-md shadow-inner flex-shrink-0">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  )
} 