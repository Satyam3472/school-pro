
"use client"

import React, { useState, useMemo, useEffect } from "react"
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
import { Plus, Pencil, Trash2, Eye, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useDashboardNav } from "../layout"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"

type StudentTableRow = {
  id: number;
  name: string;
  fatherName: string;
  motherName?: string;
  gender: string;
  grade: string;
  section: string;
  roll: number | string;
  address: string;
  status: string;
  studentPhotoBase64?: string;
  aadhaarNumber?: string;
};

type MonthlyFee = {
  id: number;
  month: number;
  year: number;
  tuitionFee: number;
  admissionFee: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PAID' | 'PENDING' | 'PARTIALLY_PAID';
  remarks?: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof StudentTableRow>("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<StudentTableRow | null>(null)
  const [feeDialogOpen, setFeeDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentTableRow | null>(null)
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([])
  const [feeLoading, setFeeLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null)

  const { setBreadcrumb, setPageTitle } = useDashboardNav()

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Students" },
    ])
    setPageTitle("Students")
  }, [setBreadcrumb, setPageTitle])

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/students")
      const result = await response.json()

      if (result.success) {
        // Map API data to table format with new fields
        const mapped = result.data.map((s: any) => ({
          id: s.id,
          name: s.studentName,
          fatherName: s.fatherName || "-",
          motherName: s.motherName || "-",
          gender: s.gender || "-",
          grade: s.admission?.classEnrolled || "-",
          section: s.admission?.section || "-",
          roll: s.id, // No roll field in schema, using id as fallback
          address: s.address || "-",
          status: "Active", // Placeholder, adjust as needed
          studentPhotoBase64: s.studentPhotoBase64 || null,
          aadhaarNumber: s.aadhaarNumber || "-",
        }))
        setStudents(mapped)
      } else {
        console.error("Failed to fetch students:", result.error)
        showErrorAlert("Error", "Failed to fetch students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      showErrorAlert("Error", "Failed to fetch students")
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyFees = async (studentId: number) => {
    try {
      setFeeLoading(true)
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1
      const financialYear = currentMonth >= 4 ? currentYear : currentYear - 1
      
      const response = await fetch(`/api/monthly-fees?studentId=${studentId}&year=${financialYear}`)
      const result = await response.json()

      if (result.success) {
        setMonthlyFees(result.data)
      } else {
        console.error("Failed to fetch monthly fees:", result.error)
        showErrorAlert("Error", "Failed to fetch fee details")
      }
    } catch (error) {
      console.error("Error fetching monthly fees:", error)
      showErrorAlert("Error", "Failed to fetch fee details")
    } finally {
      setFeeLoading(false)
    }
  }

  const handleStudentClick = async (student: StudentTableRow) => {
    // Navigate to fee management page with student filter
    window.location.href = `/dashboard/fee-management?student=${student.id}`
  }

  const handleEditStudent = (student: StudentTableRow) => {
    setEditStudent(student)
    setEditDialogOpen(true)
  }

  const handleDeleteStudent = (student: StudentTableRow) => {
    // setDeleteStudent(student) // This state variable is not defined in the original file
    // setIsDeleteModalOpen(true) // This state variable is not defined in the original file
  }

  const confirmDelete = async () => {
    // if (!deleteStudent) return // This state variable is not defined in the original file
    // try {
    //   const response = await fetch(`/api/students/${deleteStudent.id}`, { // This state variable is not defined in the original file
    //     method: "DELETE",
    //   })

    //   if (response.ok) {
    //     setStudents(students.filter(s => s.id !== deleteStudent.id)) // This state variable is not defined in the original file
    //     setIsDeleteModalOpen(false) // This state variable is not defined in the original file
    //     setDeleteStudent(null) // This state variable is not defined in the original file
    //   }
    // } catch (error) {
    //   console.error("Error deleting student:", error)
    // }
  }

  const saveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    
    if (!editStudent) {
      console.error("No student selected for editing")
      return;
    }

    const formData = {
      id: editStudent.id,
      studentName: (form.elements.namedItem('studentName') as HTMLInputElement)?.value,
      fatherName: (form.elements.namedItem('fatherName') as HTMLInputElement)?.value,
      motherName: (form.elements.namedItem('motherName') as HTMLInputElement)?.value,
      gender: (form.elements.namedItem('gender') as HTMLInputElement)?.value,
      address: (form.elements.namedItem('address') as HTMLInputElement)?.value,
      aadhaarNumber: (form.elements.namedItem('aadhaarNumber') as HTMLInputElement)?.value,
    }

    try {
      const response = await fetch("/api/students", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Update the student in the local state
        setStudents(students.map(s => 
          s.id === editStudent.id 
            ? { ...s, ...formData }
            : s
        ))
        setEditDialogOpen(false)
        setEditStudent(null)
      }
    } catch (error) {
      console.error("Error updating student:", error)
    }
  }

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    return months[month - 1]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "PARTIALLY_PAID":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-green-600 bg-green-50"
      case "PENDING":
        return "text-yellow-600 bg-yellow-50"
      case "PARTIALLY_PAID":
        return "text-orange-600 bg-orange-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  const sortedStudents = useMemo<StudentTableRow[]>(() => {
    return [...filteredStudents].sort((a, b) => {
      const aField = a[sortField as keyof StudentTableRow]?.toString().toLowerCase() || '';
      const bField = b[sortField as keyof StudentTableRow]?.toString().toLowerCase() || '';
      return sortAsc ? aField.localeCompare(bField) : bField.localeCompare(aField);
    });
  }, [filteredStudents, sortField, sortAsc]);

  const handleSort = (field: keyof StudentTableRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const handlePayment = async (feeId: number) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showErrorAlert("Error", "Please enter a valid payment amount")
      return
    }

    try {
      const response = await fetch("/api/monthly-fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: feeId,
          paidAmount: parseFloat(paymentAmount),
          status: "PAID",
          remarks: "Payment received"
        })
      })

      const result = await response.json()
      if (result.success) {
        showSuccessAlert("Success", "Payment recorded successfully")
        setPaymentAmount("")
        setSelectedFeeId(null)
        // Refresh fee data
        if (selectedStudent) {
          await fetchMonthlyFees(selectedStudent.id)
        }
      } else {
        showErrorAlert("Error", result.error || "Failed to record payment")
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      showErrorAlert("Error", "Failed to record payment")
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">
            Manage student information and view fee details
          </p>
        </div>
        <Button onClick={() => window.location.href = "/dashboard/admissions"} className="gap-2">
          <Plus className="h-4 w-4" />
          New Admission
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Student Name
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("fatherName")}
              >
                Father's Name
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("gender")}
              >
                Gender
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("grade")}
              >
                Grade
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("section")}
              >
                Section
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("address")}
              >
                Address
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("status")}
              >
                Status
              </TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? "No students found matching your search." : "No students found."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.studentPhotoBase64 ? (
                      <img
                        src={student.studentPhotoBase64}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleStudentClick(student)}
                      className="font-medium text-primary hover:underline cursor-pointer"
                    >
                      {student.name}
                    </button>
                  </TableCell>
                  <TableCell>{student.fatherName}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell className="max-w-xs truncate">{student.address}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Student Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student Name</Label>
                <Input name="studentName" defaultValue={editStudent?.name || ""} required />
              </div>
              <div>
                <Label>Father's Name</Label>
                <Input name="fatherName" defaultValue={editStudent?.fatherName || ""} required />
              </div>
              <div>
                <Label>Mother's Name</Label>
                <Input name="motherName" defaultValue={editStudent?.motherName || ""} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select name="gender" defaultValue={editStudent?.gender || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aadhaar Number</Label>
                <Input name="aadhaarNumber" defaultValue={editStudent?.aadhaarNumber || ""} />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Input name="address" defaultValue={editStudent?.address || ""} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fee Details Dialog */}
      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Details - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          
          {feeLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading fee details...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Student</p>
                  <p className="font-medium">{selectedStudent?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{selectedStudent?.grade} - {selectedStudent?.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father's Name</p>
                  <p className="font-medium">{selectedStudent?.fatherName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Monthly Fee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthlyFees.map((fee) => (
                    <div key={fee.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {getMonthName(fee.month)} {fee.year}
                          </span>
                        </div>
                        {getStatusIcon(fee.status)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Tuition Fee:</span>
                          <span>₹{fee.tuitionFee}</span>
                        </div>
                        {fee.admissionFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Admission Fee:</span>
                            <span>₹{fee.admissionFee}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>₹{fee.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Paid:</span>
                          <span>₹{fee.paidAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                          <span>Pending:</span>
                          <span className="text-red-600">₹{fee.totalAmount - fee.paidAmount}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(fee.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      {fee.status !== 'PAID' && (
                        <div className="space-y-2">
                          {selectedFeeId === fee.id ? (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                placeholder="Enter payment amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePayment(fee.id)}
                                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                                >
                                  Record Payment
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedFeeId(null)
                                    setPaymentAmount("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedFeeId(fee.id)}
                            >
                              Record Payment
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {monthlyFees.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No fee records found for this student.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
