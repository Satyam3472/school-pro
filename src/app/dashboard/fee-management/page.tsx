"use client"

import React, { useState, useEffect } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, Plus, Search, Filter, FileText } from "lucide-react"
import { useDashboardNav } from "../layout"

interface Student {
  id: number
  studentName: string
  fatherName?: string
  admission?: {
    classEnrolled: string
    section: string
    admissionDate: string
    academicYear: string
  }
}

interface Fee {
  id: number
  studentId: number
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PAID' | 'PENDING' | 'PARTIALLY_PAID'
  remarks?: string
  student?: Student
}

interface MonthlyFee {
  id: number
  studentId: number
  month: number
  year: number
  tuitionFee: number
  admissionFee: number
  totalAmount: number
  paidAmount: number
  dueDate: string
  paidDate?: string
  status: 'PAID' | 'PENDING' | 'PARTIALLY_PAID'
  remarks?: string
}

interface FeeDetails {
  student: Student
  monthlyFees: MonthlyFee[]
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  pendingMonths: number
}

export default function FeeManagementPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<MonthlyFee[]>([])
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([])
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<MonthlyFee | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { setBreadcrumb, setPageTitle } = useDashboardNav();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Fee Management" },
    ]);
    setPageTitle("Fee Management");
  }, [setBreadcrumb, setPageTitle]);

  // New fee form state
  const [newFee, setNewFee] = useState({
    studentId: "",
    amount: "",
    month: "",
    year: new Date().getFullYear().toString(),
    transactionType: "TUITION_FEE",
    dueDate: "",
    remarks: ""
  })

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Financial year starts from April (month 4)
  const getFinancialYear = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return month >= 4 ? year : year - 1
  }

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return months[month - 1]
  }

  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case "TUITION_FEE": return "Tuition Fee"
      case "ADMISSION_FEE": return "Admission Fee"
      case "EXAM_FEE": return "Exam Fee"
      case "TRANSPORT_FEE": return "Transport Fee"
      case "OTHER": return "Other"
      default: return type
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchFees()
    fetchAllMonthlyFees()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      const result = await response.json()
      if (result.success) {
        setStudents(result.data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFees = async () => {
    try {
      const response = await fetch("/api/monthly-fees")
      const result = await response.json()
      if (result.success) {
        setFees(result.data)
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
    }
  }

  const fetchAllMonthlyFees = async () => {
    try {
      const response = await fetch("/api/monthly-fees")
      const result = await response.json()
      if (result.success) {
        setMonthlyFees(result.data)
      }
    } catch (error) {
      console.error("Error fetching monthly fees:", error)
    }
  }

  const getPendingFeesCount = (student: Student) => {
    // Calculate pending months from April to current month
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1 // 1-12
    const currentYear = currentDate.getFullYear()
    
    // Financial year starts from April (month 4)
    const getFinancialYear = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      return month >= 4 ? year : year - 1
    }
    
    const currentFinancialYear = getFinancialYear(currentDate)
    
    // Count pending months from April to current month
    let pendingMonths = 0
    
    // Check months from April to current month
    for (let month = 4; month <= currentMonth; month++) {
      const year = month >= 4 ? currentFinancialYear : currentFinancialYear + 1
      
      // Find the monthly fee for this month
      const monthlyFee = monthlyFees.find(fee => 
        fee.studentId === student.id && 
        fee.month === month && 
        fee.year === year
      )
      
      // If fee exists and is not paid, count as pending
      if (monthlyFee && monthlyFee.status !== 'PAID') {
        pendingMonths++
      }
    }
    
    return pendingMonths
  }

  const fetchFeeDetails = async (studentId: number) => {
    try {
      // Get the current financial year
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1
      
      const response = await fetch(`/api/monthly-fees?studentId=${studentId}&year=${financialYear}`)
      const result = await response.json()
      if (result.success) {
        const student = students.find(s => s.id === studentId)
        if (student) {
          const monthlyFees = result.data
          const totalAmount = monthlyFees.reduce((sum: number, fee: MonthlyFee) => sum + Number(fee.totalAmount), 0)
          const paidAmount = monthlyFees.filter((fee: MonthlyFee) => fee.status === 'PAID').reduce((sum: number, fee: MonthlyFee) => sum + Number(fee.totalAmount), 0)
          const pendingAmount = totalAmount - paidAmount
          const pendingMonths = monthlyFees.filter((fee: MonthlyFee) => fee.status !== 'PAID').length

          setFeeDetails({
            student,
            monthlyFees,
            totalAmount,
            paidAmount,
            pendingAmount,
            pendingMonths
          })
        }
      }
    } catch (error) {
      console.error("Error fetching fee details:", error)
    }
  }

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student)
    await fetchFeeDetails(student.id)
    setIsFeeModalOpen(true)
  }

  const handlePayment = async (monthlyFee: MonthlyFee) => {
    setSelectedMonth(monthlyFee)
    setIsPaymentModalOpen(true)
  }

  const handleInvoice = async (fee: MonthlyFee) => {
    // Navigate to the invoice page in the same window
    window.location.href = `/invoice/${fee.id}`
  }

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMonth) return

    try {
      const response = await fetch("/api/monthly-fees", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedMonth.id,
          status: "PAID",
          paidDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        // Refresh fee details
        if (selectedStudent) {
          await fetchFeeDetails(selectedStudent.id)
        }
        setIsPaymentModalOpen(false)
        setSelectedMonth(null)
      }
    } catch (error) {
      console.error("Error processing payment:", error)
    }
  }

  const handleAddFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/fee-manangement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: parseInt(newFee.studentId),
          amount: parseFloat(newFee.amount),
          dueDate: newFee.dueDate,
          status: "PENDING",
          remarks: newFee.remarks,
        }),
      })

      if (response.ok) {
        // Reset form and refresh data
        setNewFee({
          studentId: "",
          amount: "",
          month: "",
          year: new Date().getFullYear().toString(),
          transactionType: "TUITION_FEE",
          dueDate: "",
          remarks: ""
        })
        setIsAddFeeModalOpen(false)
        fetchFees()
      }
    } catch (error) {
      console.error("Error adding fee:", error)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === "all" || student.admission?.classEnrolled === filterClass
    return matchesSearch && matchesClass
  })

  const filteredFees = fees.filter((fee: any) => {
    // Only show PAID fees in the Fee Records table
    return fee.status === 'PAID'
  })

  const getTotalCollection = () => {
    return fees
      .filter(fee => fee.status === 'PAID')
      .reduce((sum, fee) => sum + Number(fee.totalAmount), 0)
  }

  const getPaidThisMonth = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    return fees
      .filter(fee => {
        if (fee.status !== 'PAID' || !fee.paidDate) return false
        const paidDate = new Date(fee.paidDate)
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
      })
      .reduce((sum, fee) => sum + Number(fee.totalAmount), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading fee management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto p-3 md:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage student fees and payments</p>
        </div>
        <Button onClick={() => setIsAddFeeModalOpen(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add New Fee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
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
        ].map((stat, index) => (
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

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              Student Fee Status
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search name or father’s name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              {/* Filter by Class */}
              <div className="w-full sm:w-40">
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5"].map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls === "1" ? "Class 1" : cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filter by Status */}
              <div className="w-full sm:w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Father's Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Pending Months</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No students found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const pendingMonths = getPendingFeesCount(student)
                    return (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell>
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="font-medium text-primary hover:underline"
                          >
                            {student.studentName}
                          </button>
                        </TableCell>
                        <TableCell>{student.fatherName || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.admission?.classEnrolled || "-"}</Badge>
                        </TableCell>
                        <TableCell>{student.admission?.section || "-"}</TableCell>
                        <TableCell>
                          {student.admission?.admissionDate
                            ? new Date(student.admission.admissionDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pendingMonths > 0 ? "destructive" : "secondary"}>
                            {pendingMonths} months
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pendingMonths > 0 ? "destructive" : "default"}>
                            {pendingMonths > 0 ? "Pending" : "Paid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleStudentClick(student)}
                            className="flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No students found</p>
                </div>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const pendingMonths = getPendingFeesCount(student)
                return (
                  <div key={student.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => handleStudentClick(student)}
                          className="font-medium text-primary hover:underline text-left"
                        >
                          {student.studentName}
                        </button>
                        <p className="text-sm text-muted-foreground mt-1">
                          Father: {student.fatherName || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={pendingMonths > 0 ? "destructive" : "default"}>
                          {pendingMonths > 0 ? "Pending" : "Paid"}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleStudentClick(student)}
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-3 w-3" />
                          Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Class:</span>
                        <Badge variant="outline" className="ml-2">
                          {student.admission?.classEnrolled || "-"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Section:</span>
                        <span className="ml-2">{student.admission?.section || "-"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Admission:</span>
                        <span className="ml-2">
                          {student.admission?.admissionDate
                            ? new Date(student.admission.admissionDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pending:</span>
                        <Badge variant={pendingMonths > 0 ? "destructive" : "secondary"} className="ml-2">
                          {pendingMonths} months
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>


      {/* Fee Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fee Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
                              <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Month/Year</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No fee records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map((fee) => (
                    <TableRow key={fee.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {students.find(s => s.id === fee.studentId)?.studentName || `Student ${fee.studentId}`}
                      </TableCell>
                      <TableCell>₹{Number(fee.totalAmount)}</TableCell>
                      <TableCell>
                        {getMonthName(fee.month)} {fee.year}
                      </TableCell>
                      <TableCell>
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {fee.paidDate 
                          ? new Date(fee.paidDate).toLocaleDateString()
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            fee.status === 'PAID' ? 'default' : 
                            fee.status === 'PARTIALLY_PAID' ? 'secondary' : 'destructive'
                          }
                        >
                          {fee.status}
                        </Badge>
                      </TableCell>
                                          <TableCell className="max-w-xs truncate">
                      {fee.remarks || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvoice(fee)}
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-4">
            {filteredFees.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No fee records found</p>
                </div>
              </div>
            ) : (
              filteredFees.map((fee) => (
                <div key={fee.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">
                        {students.find(s => s.id === fee.studentId)?.studentName || `Student ${fee.studentId}`}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getMonthName(fee.month)} {fee.year}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={
                          fee.status === 'PAID' ? 'default' : 
                          fee.status === 'PARTIALLY_PAID' ? 'secondary' : 'destructive'
                        }
                      >
                        {fee.status}
                      </Badge>
                      <div className="text-lg font-semibold text-green-600">
                        ₹{Number(fee.totalAmount)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="ml-2">{new Date(fee.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid Date:</span>
                      <span className="ml-2">
                        {fee.paidDate 
                          ? new Date(fee.paidDate).toLocaleDateString()
                          : "-"
                        }
                      </span>
                    </div>
                    {fee.remarks && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Remarks:</span>
                        <span className="ml-2 text-sm">{fee.remarks}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvoice(fee)}
                        className="flex items-center gap-1 w-full"
                      >
                        <FileText className="h-3 w-3" />
                        View Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Details Modal */}
      <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calendar className="h-5 w-5" />
              Fee Details - {selectedStudent?.studentName}
            </DialogTitle>
          </DialogHeader>
          {feeDetails && (
            <div className="space-y-4 md:space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{feeDetails.student.admission?.classEnrolled}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">{feeDetails.student.admission?.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium text-green-600">₹{feeDetails.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="font-medium text-red-600">₹{feeDetails.pendingAmount}</p>
                </div>
              </div>

              {/* Monthly Fees Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Monthly Fee Details
                </h3>
                
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeDetails.monthlyFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">
                            {getMonthName(fee.month)} {fee.year}
                          </TableCell>
                          <TableCell>₹{fee.totalAmount}</TableCell>
                          <TableCell>
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={fee.status === 'PAID' ? "default" : "destructive"}>
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fee.paidDate 
                              ? new Date(fee.paidDate).toLocaleDateString()
                              : "-"
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {fee.status !== 'PAID' && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePayment(fee)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Mark Paid
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvoice(fee)}
                                className="flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                Invoice
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {feeDetails.monthlyFees.map((fee) => (
                    <div key={fee.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">
                            {getMonthName(fee.month)} {fee.year}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={fee.status === 'PAID' ? "default" : "destructive"}>
                            {fee.status}
                          </Badge>
                          <div className="text-lg font-semibold text-green-600">
                            ₹{fee.totalAmount}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Paid Date:</span>
                          <span className="ml-2">
                            {fee.paidDate 
                              ? new Date(fee.paidDate).toLocaleDateString()
                              : "-"
                            }
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          {fee.status !== 'PAID' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayment(fee)}
                              className="flex items-center gap-1 w-full"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInvoice(fee)}
                            className="flex items-center gap-1 w-full"
                          >
                            <FileText className="h-3 w-3" />
                            View Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="w-[95vw] md:w-auto max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
              <CheckCircle className="h-5 w-5" />
              Mark Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={processPayment} className="space-y-4">
            <div>
              <Label>Month</Label>
              <p className="text-sm text-muted-foreground">
                {selectedMonth ? `${getMonthName(selectedMonth.month)} ${selectedMonth.year}` : ""}
              </p>
            </div>
            <div>
              <Label>Amount</Label>
              <p className="text-sm text-muted-foreground">
                ₹{selectedMonth?.totalAmount}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirm Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Fee Modal */}
      <Dialog open={isAddFeeModalOpen} onOpenChange={setIsAddFeeModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Fee Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="student">Student</Label>
                <Select 
                  value={newFee.studentId} 
                  onValueChange={(value) => setNewFee({...newFee, studentId: value})}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.studentName} - {student.admission?.classEnrolled}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={newFee.amount}
                  onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Select 
                  value={newFee.month} 
                  onValueChange={(value) => setNewFee({...newFee, month: value})}
                >
                  <SelectTrigger id="month">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({length: 12}, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="Year"
                  value={newFee.year}
                  onChange={(e) => setNewFee({...newFee, year: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select 
                  value={newFee.transactionType} 
                  onValueChange={(value) => setNewFee({...newFee, transactionType: value})}
                >
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TUITION_FEE">Tuition Fee</SelectItem>
                    <SelectItem value="ADMISSION_FEE">Admission Fee</SelectItem>
                    <SelectItem value="EXAM_FEE">Exam Fee</SelectItem>
                    <SelectItem value="TRANSPORT_FEE">Transport Fee</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newFee.dueDate}
                onChange={(e) => setNewFee({...newFee, dueDate: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter any additional remarks..."
                value={newFee.remarks}
                onChange={(e) => setNewFee({...newFee, remarks: e.target.value})}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddFeeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Fee Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  )
} 