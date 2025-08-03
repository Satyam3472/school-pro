"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle } from "lucide-react"
import { useDashboardNav } from "../layout"
import { useRouter } from "next/navigation"

// Import components
import StatsCards from "@/components/fee-management/StatsCards"
import StudentFeeTable from "@/components/fee-management/StudentFeeTable"
import FeeRecordsTable from "@/components/fee-management/FeeRecordsTable"
import AddFeeModal from "@/components/fee-management/AddFeeModal"
import FeeDetailsModal from "@/components/fee-management/FeeDetailsModal"
import PaymentModal from "@/components/fee-management/PaymentModal"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Import types
import { Student, Fee, MonthlyFee, FeeDetails, NewFee } from "@/types/fee-management"

export default function FeeManagementPage() {
  // State management
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
  const [isAddingFee, setIsAddingFee] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isFormAutoFilled, setIsFormAutoFilled] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [schoolFeeStructure, setSchoolFeeStructure] = useState<{
    classes: Array<{ name: string; tuitionFee: number; admissionFee: number }>;
    transportFees: { below3: number; between3and5: number; between5and10: number; above10: number };
  } | null>(null)
  
  const { setBreadcrumb, setPageTitle } = useDashboardNav();
  const router = useRouter()

  // New fee form state
  const [newFee, setNewFee] = useState<NewFee>({
    studentId: "",
    amount: "",
    month: "",
    year: new Date().getFullYear().toString(),
    transactionTypes: ["TUITION_FEE"],
    dueDate: "",
    remarks: ""
  })

  // Utility functions
  const getLastDateOfMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getDefaultAmount = (studentId: string, transactionTypes: string[]): number => {
    if (!studentId || !schoolFeeStructure) return 0
    
    const student = students.find(s => s.id.toString() === studentId)
    
    if (!student || !student.admission) {
      return 0
    }
    
    // Find the class in school fee structure
    const classFee = schoolFeeStructure.classes.find(cls => cls.name === student.admission?.classEnrolled)
    if (!classFee) {
      return 0
    }
    
    let totalAmount = 0
    
    // Calculate based on selected transaction types
    transactionTypes.forEach(type => {
      switch (type) {
        case "TUITION_FEE":
          totalAmount += classFee.tuitionFee
          break
        case "ADMISSION_FEE":
          totalAmount += classFee.admissionFee
          break
        case "TRANSPORT_FEE":
          if (student.admission?.transportType && student.admission.transportType !== "None") {
            // Calculate transport fee based on distance
            const transportFee = calculateTransportFee(student.admission.transportType)
            totalAmount += transportFee
          }
          break
        case "EXAM_FEE":
          // Exam fee is typically 200-500, using 300 as default
          totalAmount += 300
          break
        case "OTHER":
          // Other fees default to 100
          totalAmount += 100
          break
      }
    })
    
    return totalAmount
  }

  const calculateTransportFee = (transportType: string): number => {
    if (!schoolFeeStructure) return 0
    
    // Map transport type to distance ranges
    const transportMap: { [key: string]: keyof typeof schoolFeeStructure.transportFees } = {
      "Below 3 km": "below3",
      "3-5 km": "between3and5", 
      "5-10 km": "between5and10",
      "Above 10 km": "above10"
    }
    
    const feeKey = transportMap[transportType]
    return feeKey ? schoolFeeStructure.transportFees[feeKey] : 0
  }

  const getDefaultTransactionTypes = (studentId: string, month: string) => {
    if (!studentId || !month) return ["TUITION_FEE"]
    
    const student = students.find(s => s.id.toString() === studentId)
    if (!student || !student.admission) return ["TUITION_FEE"]
    
    const monthNum = parseInt(month)
    const transactionTypes = ["TUITION_FEE"]
    
    if (monthNum === 4) {
      transactionTypes.push("ADMISSION_FEE")
    }
    
    if ([6, 12].includes(monthNum)) {
      transactionTypes.push("EXAM_FEE")
    }
    
    if (student.admission.transportType && student.admission.transportType !== "None") {
      transactionTypes.push("TRANSPORT_FEE")
    }
    
    return transactionTypes
  }

  const autoFillForm = useCallback((studentId: string, month: string, year: string) => {
    if (studentId && month && year) {
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      
      // Validate inputs
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return
      }
      
      const lastDate = getLastDateOfMonth(yearNum, monthNum)
      const dueDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${lastDate.toString().padStart(2, '0')}`
      const defaultTransactionTypes = getDefaultTransactionTypes(studentId, month)
      const defaultAmount = getDefaultAmount(studentId, defaultTransactionTypes)
      
      setNewFee(prev => ({
        ...prev,
        studentId,
        month,
        year,
        amount: defaultAmount > 0 ? defaultAmount.toString() : "",
        dueDate,
        transactionTypes: defaultTransactionTypes
      }))
      
      setIsFormAutoFilled(true)
      const timeoutId = setTimeout(() => setIsFormAutoFilled(false), 3000)
      
      // Cleanup timeout on component unmount
      return () => clearTimeout(timeoutId)
    }
  }, [])

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

  // Close all modals function
  const closeAllModals = () => {
    setIsAddFeeModalOpen(false)
    setIsPaymentModalOpen(false)
    setIsFeeModalOpen(false)
    setSelectedStudent(null)
    setSelectedMonth(null)
  }

  // Effects
  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Fee Management" },
    ]);
    setPageTitle("Fee Management");
  }, [setBreadcrumb, setPageTitle]);

  useEffect(() => {
    fetchSchoolFeeStructure()
    fetchStudents()
    fetchFees()
    fetchAllMonthlyFees()
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Cleanup effect for timeouts
  useEffect(() => {
    return () => {
      // Cleanup any pending timeouts when component unmounts
      setShowSuccessMessage(false)
      setIsFormAutoFilled(false)
    }
  }, [])

  // Data fetching functions
  const fetchSchoolFeeStructure = async () => {
    try {
      const response = await fetch("/api/school-fees")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setSchoolFeeStructure(result.data)
      } else {
        console.error("Error fetching school fee structure:", result.error)
      }
    } catch (error) {
      console.error("Error fetching school fee structure:", error)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setStudents(result.data)
      } else {
        console.error("Error fetching students:", result.error)
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setFees(result.data)
      } else {
        console.error("Error fetching fees:", result.error)
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
    }
  }

  const fetchAllMonthlyFees = async () => {
    try {
      const response = await fetch("/api/monthly-fees")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setMonthlyFees(result.data)
      } else {
        console.error("Error fetching monthly fees:", result.error)
      }
    } catch (error) {
      console.error("Error fetching monthly fees:", error)
    }
  }

  const fetchFeeDetails = async (studentId: number) => {
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1
      
      const response = await fetch(`/api/monthly-fees?studentId=${studentId}&year=${financialYear}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        const student = students.find(s => s.id === studentId)
        if (student) {
          const monthlyFees = result.data
          const totalAmount = monthlyFees.reduce((sum: number, fee: MonthlyFee) => sum + Number(fee.totalAmount || 0), 0)
          const paidAmount = monthlyFees.filter((fee: MonthlyFee) => fee.status === 'PAID').reduce((sum: number, fee: MonthlyFee) => sum + Number(fee.totalAmount || 0), 0)
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
      } else {
        console.error("Error fetching fee details:", result.error)
      }
    } catch (error) {
      console.error("Error fetching fee details:", error)
    }
  }

  // Event handlers
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
    window.location.href = `/invoice/${fee.id}`
  }

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMonth) return

    setIsProcessingPayment(true)

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process payment')
      }

      const result = await response.json()
      if (result.success) {
        setIsPaymentModalOpen(false)
        setIsFeeModalOpen(false) // Close fee details modal
        setSelectedMonth(null)
        setSelectedStudent(null)
        
        await Promise.all([
          fetchStudents(),
          fetchFees(),
          fetchAllMonthlyFees()
        ])
        
        setSuccessMessage("Payment processed successfully!")
        setShowSuccessMessage(true)
        const timeoutId = setTimeout(() => setShowSuccessMessage(false), 3000)
        
        // Cleanup timeout
        return () => clearTimeout(timeoutId)
      } else {
        throw new Error(result.error || 'Failed to process payment')
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      alert(error instanceof Error ? error.message : "Error processing payment. Please try again.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleAddFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form inputs
    if (!newFee.studentId || !newFee.amount || !newFee.month || !newFee.year || !newFee.dueDate) {
      alert("Please fill in all required fields")
      return
    }
    
    if (newFee.transactionTypes.length === 0) {
      alert("Please select at least one transaction type")
      return
    }
    
    const amount = parseFloat(newFee.amount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount")
      return
    }
    
    setIsAddingFee(true)
    
    try {
      const transactionTypesText = newFee.transactionTypes.map(type => getTransactionTypeName(type)).join(", ")
      const combinedRemarks = newFee.remarks 
        ? `${transactionTypesText} - ${newFee.remarks}`
        : transactionTypesText

      const response = await fetch("/api/fee-manangement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: parseInt(newFee.studentId),
          amount: amount,
          dueDate: newFee.dueDate,
          status: "PENDING",
          remarks: combinedRemarks,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add fee record')
      }

      const result = await response.json()
      if (result.success) {
        setNewFee({
          studentId: "",
          amount: "",
          month: "",
          year: new Date().getFullYear().toString(),
          transactionTypes: ["TUITION_FEE"],
          dueDate: "",
          remarks: ""
        })
        
        setIsAddFeeModalOpen(false)
        
        await Promise.all([
          fetchStudents(),
          fetchFees(),
          fetchAllMonthlyFees()
        ])
        
        if (selectedStudent) {
          await fetchFeeDetails(selectedStudent.id)
        }
        
        setSuccessMessage("Fee record added successfully!")
        setShowSuccessMessage(true)
        const timeoutId = setTimeout(() => setShowSuccessMessage(false), 3000)
        
        // Cleanup timeout
        return () => clearTimeout(timeoutId)
      } else {
        throw new Error(result.error || 'Failed to add fee record')
      }
    } catch (error) {
      console.error("Error adding fee:", error)
      alert(error instanceof Error ? error.message : "Error adding fee. Please try again.")
    } finally {
      setIsAddingFee(false)
    }
  }

  // Computed values
  const getPendingFeesCount = useCallback((student: Student) => {
    if (!student || !student.id) return 0
    
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1
    
    let pendingMonths = 0
    
    for (let month = 4; month <= currentMonth; month++) {
      const year = month >= 4 ? financialYear : financialYear + 1
      
      const monthlyFee = monthlyFees.find(fee => 
        fee.studentId === student.id && 
        fee.month === month && 
        fee.year === year
      )
      
      if (monthlyFee && monthlyFee.status !== 'PAID') {
        pendingMonths++
      }
    }
    
    return pendingMonths
  }, [monthlyFees])

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = filterClass === "all" || student.admission?.classEnrolled === filterClass
    return matchesSearch && matchesClass
  })
  }, [students, searchTerm, filterClass])

  const filteredFees = useMemo(() => {
    return fees.filter((fee: any) => fee.status === 'PAID')
  }, [fees])

  const getTotalCollection = useCallback(() => {
    return fees
      .filter(fee => fee.status === 'PAID')
      .reduce((sum, fee) => sum + Number(fee.totalAmount || 0), 0)
  }, [fees])

  const getPaidThisMonth = useCallback(() => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    return fees
      .filter(fee => {
        if (fee.status !== 'PAID' || !fee.paidDate) return false
        try {
        const paidDate = new Date(fee.paidDate)
        return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
        } catch (error) {
          console.error("Error parsing paid date:", fee.paidDate, error)
          return false
        }
      })
      .reduce((sum, fee) => sum + Number(fee.totalAmount || 0), 0)
  }, [fees])

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
    <ErrorBoundary>
      <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto p-3 md:p-4">
        {/* Success Notification */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Auto-fill Notification */}
        {isFormAutoFilled && (
          <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span className="font-medium">Form auto-filled with default values</span>
          </div>
        )}

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
        <StatsCards
          students={students}
          monthlyFees={monthlyFees}
          getPendingFeesCount={getPendingFeesCount}
          getTotalCollection={getTotalCollection}
          getPaidThisMonth={getPaidThisMonth}
        />

        {/* Student Fee Table */}
        <StudentFeeTable
          students={students}
          filteredStudents={filteredStudents}
          searchTerm={searchTerm}
          filterClass={filterClass}
          filterStatus={filterStatus}
          setSearchTerm={setSearchTerm}
          setFilterClass={setFilterClass}
          setFilterStatus={setFilterStatus}
          getPendingFeesCount={getPendingFeesCount}
          handleStudentClick={handleStudentClick}
        />

      {/* Fee Records Table */}
        <FeeRecordsTable
          fees={filteredFees}
          students={students}
          getMonthName={getMonthName}
          handleInvoice={handleInvoice}
        />

        {/* Modals */}
        <FeeDetailsModal
          isOpen={isFeeModalOpen}
          onClose={() => setIsFeeModalOpen(false)}
          feeDetails={feeDetails}
          selectedStudent={selectedStudent}
          getMonthName={getMonthName}
          handlePayment={handlePayment}
          handleInvoice={handleInvoice}
        />

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          selectedMonth={selectedMonth}
          isProcessingPayment={isProcessingPayment}
          processPayment={processPayment}
          getMonthName={getMonthName}
        />

              <AddFeeModal
        isOpen={isAddFeeModalOpen}
        onClose={closeAllModals}
        students={students}
        newFee={newFee}
        setNewFee={setNewFee}
        handleAddFee={handleAddFee}
        isAddingFee={isAddingFee}
        getMonthName={getMonthName}
        getTransactionTypeName={getTransactionTypeName}
        autoFillForm={autoFillForm}
        calculateAmount={getDefaultAmount}
              />
            </div>
    </ErrorBoundary>
  )
} 