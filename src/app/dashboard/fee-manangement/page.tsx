"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Download, Plus, CheckCircle2, XCircle, AlertCircle, Search, Users, CrossIcon, CircleX } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { useDashboardNav } from "../layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { IoAddCircle } from "react-icons/io5"
import { FaCross } from "react-icons/fa6"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"

type Fee = {
  id: number;
  studentId: number;
  amount: number | string;
  dueDate: string;
  paidDate?: string | null;
  status: string;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: { studentName: string; grade?: string };
};

type Student = {
  id: number;
  studentName: string;
  grade?: string;
};

const statusVariants = {
  Paid: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Unpaid: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Partial: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
}

const statusIcons = {
  Paid: <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />,
  Unpaid: <XCircle className="w-3.5 h-3.5 mr-1.5" />,
  Partial: <AlertCircle className="w-3.5 h-3.5 mr-1.5" />,
}

export default function FeeManagement() {
  const [fees, setFees] = useState<Fee[]>([])
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ student: "", grade: "", amount: "", status: "Paid", dueDate: "" })
  const [adding, setAdding] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const { setBreadcrumb, setPageTitle } = useDashboardNav();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Fee Management" },
    ]);
    setPageTitle("Fee Management");
  }, [setBreadcrumb, setPageTitle]);

  // Fetch students for dropdown
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students");
        const result = await res.json();
        if (result.success) {
          setStudents(result.data);
        } else {
          showErrorAlert("Failed to fetch students", "Please try again later or contact support.");
        }
      } catch (err) {
        showErrorAlert("Connection error", "Unable to reach the server. Check your connection.");
      }
    }
    fetchStudents();
  }, []);

  // Fetch fees from API
  useEffect(() => {
    async function fetchFees() {
      setLoading(true)
      try {
        const res = await fetch("/api/fee-manangement");
        const result = await res.json();
        if (result.success) {
          setFees(result.data.map((fee: any) => ({
            ...fee,
            status: fee.status === "PAID" ? "Paid" : fee.status === "PARTIALLY_PAID" ? "Partial" : "Unpaid",
            student: fee.student,
          })));
          showSuccessAlert("Data loaded", "Fee records updated successfully");
        } else {
          showErrorAlert("Data error", result.error || "Failed to fetch fees");
        }
      } catch (err) {
        showErrorAlert("Connection error", "Failed to connect to server");
      } finally {
        setLoading(false)
      }
    }
    fetchFees();
  }, []);

  // Set dueDate on client only to avoid hydration mismatch
  useEffect(() => {
    setForm(f => ({ ...f, dueDate: new Date().toISOString().split('T')[0] }));
  }, []);

  const filteredFees = fees.filter(fee => {
    const matchesStatus = filter === "All" || fee.status === filter
    const matchesSearch = (fee.student?.studentName?.toLowerCase() || "").includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Summary calculations
  const totalCollected = fees.filter(f => f.status === "Paid").reduce((sum, f) => sum + Number(f.amount), 0)
  const totalPending = fees.filter(f => f.status === "Unpaid").reduce((sum, f) => sum + Number(f.amount), 0)
  const totalPartial = fees.filter(f => f.status === "Partial").reduce((sum, f) => sum + Number(f.amount), 0)
  const totalStudents = fees.length

  const handleStatusChange = (id: number, newStatus: string) => {
    setFees(prev => prev.map(f => (f.id === id ? { ...f, status: newStatus } : f)))
    showSuccessAlert("Status updated", "Fee status changed locally");
  }

  const exportToCSV = () => {
    const csv = ["Student,Grade,Amount,Status"]
    filteredFees.forEach(fee => {
      csv.push(`${fee.student?.studentName || ""},${fee.student?.grade || ""},${fee.amount},${fee.status}`)
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fee-records.csv"
    a.click()
    showSuccessAlert("Export successful", "CSV file downloaded");
  }

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student || !form.grade || !form.amount) {
      showErrorAlert("Validation error", "Please fill all required fields");
      return
    }
    try {
      const res = await fetch("/api/fee-manangement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: form.student,
          amount: form.amount,
          dueDate: form.dueDate,
          status: form.status,
        })
      })
      const result = await res.json()
      if (result.success) {
        setFees(prev => [...prev, {
          ...result.data,
          status: result.data.status === "PAID" ? "Paid" : result.data.status === "PARTIALLY_PAID" ? "Partial" : "Unpaid",
        }])
        setForm({ student: "", grade: "", amount: "", status: "Paid", dueDate: "" })
        setAdding(false)
        showSuccessAlert("Success", "Fee record added successfully");
      } else {
        showErrorAlert("Error", result.error || "Failed to add fee record");
      }
    } catch (err) {
      showErrorAlert("Connection error", "Failed to connect to server");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Feeeee Management</h1>
          <p className="text-muted-foreground text-sm">Track and analyze School Fees and Payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
          <Button size="sm" onClick={() => setAdding(v => !v)} className="gap-1.5">
            {adding ? <CircleX className="w-3.5 h-3.5" /> : <CrossIcon className="w-3.5 h-3.5" />}
            <span>{adding ? "Cancel" : "Add"}</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Skeleton Loading */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard 
            title="Total Students" 
            value={totalStudents} 
            icon={<Users className="w-4 h-4" />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Collected" 
            value={`₹${totalCollected.toLocaleString()}`} 
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard 
            title="Pending" 
            value={`₹${totalPending.toLocaleString()}`} 
            icon={<XCircle className="w-4 h-4" />}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard 
            title="Partial" 
            value={`₹${totalPartial.toLocaleString()}`} 
            icon={<AlertCircle className="w-4 h-4" />}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
        </div>
      )}

      {/* Add Form */}
      {adding && !loading && (
        <Card className="shadow-lg py-0 border border-gray-200 rounded-xl bg-white">
          <CardHeader className="px-6 pt-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              🧾 Add New Fee Record
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleAddFee} className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                {/* Student */}
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={form.student}
                    onValueChange={(value) => setForm({ ...form, student: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.studentName}>
                          👤 {student.studentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade */}
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    name="grade"
                    placeholder="e.g. 7th"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter fee amount"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value) => setForm({ ...form, status: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">✅ Paid</SelectItem>
                      <SelectItem value="Unpaid">❌ Unpaid</SelectItem>
                      <SelectItem value="Partial">➗ Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
                >
                  <IoAddCircle className="text-xl"/> Add Fee
                </Button>
              </div>
              </div>

              {/* Buttons */}

            </form>
          </CardContent>
        </Card>

      )}

      {/* Main Table Card */}
      <Card className="shadow-none border p-2 gap-0">
        <CardHeader className="p-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="h-10 px-3 w-[200px]">Student</TableHead>
                    <TableHead className="h-10 px-3">Grade</TableHead>
                    <TableHead className="h-10 px-3">Amount</TableHead>
                    <TableHead className="h-10 px-3">Status</TableHead>
                    <TableHead className="h-10 px-3 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.length > 0 ? (
                    filteredFees.map((fee) => (
                      <TableRow key={fee.id} className="hover:bg-muted/50">
                        <TableCell className="p-3 font-medium text-sm">{fee.student?.studentName}</TableCell>
                        <TableCell className="p-3 text-sm">{fee.student?.grade}</TableCell>
                        <TableCell className="p-3 text-sm">₹{Number(fee.amount).toLocaleString()}</TableCell>
                        <TableCell className="p-3">
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${statusVariants[fee.status as keyof typeof statusVariants]}`}>
                            {statusIcons[fee.status as keyof typeof statusIcons]}
                            {fee.status}
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <Select
                            value={fee.status}
                            onValueChange={value => handleStatusChange(fee.id, value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Paid">Paid</SelectItem>
                              <SelectItem value="Unpaid">Unpaid</SelectItem>
                              <SelectItem value="Partial">Partial</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {filteredFees.length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No records found
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon, color, bgColor }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="p-3 shadow-none border">
      <CardContent className="p-0">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-md ${bgColor} ${color}`}>
                {icon}
              </div>
              <span className="text-xs text-muted-foreground">{title}</span>
            </div>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}