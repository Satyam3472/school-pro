"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Download, Plus, CheckCircle2, XCircle, AlertCircle, Search } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { useDashboardNav } from "../layout";

const initialFees = [
  { id: 1, student: "Aarav Sharma", grade: "5th", amount: 12000, status: "Paid" },
  { id: 2, student: "Mira Patel", grade: "4th", amount: 11500, status: "Unpaid" },
  { id: 3, student: "Rohan Verma", grade: "6th", amount: 13000, status: "Partial" },
]

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
  const [fees, setFees] = useState(initialFees)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ student: "", grade: "", amount: "", status: "Paid" })
  const [adding, setAdding] = useState(false)
  const { setBreadcrumb, setPageTitle } = useDashboardNav();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Fee Management" },
    ]);
    setPageTitle("Fee Management");
  }, [setBreadcrumb, setPageTitle]);

  const filteredFees = fees.filter(fee => {
    const matchesStatus = filter === "All" || fee.status === filter
    const matchesSearch = fee.student.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Summary calculations
  const totalCollected = fees.filter(f => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0)
  const totalPending = fees.filter(f => f.status === "Unpaid").reduce((sum, f) => sum + f.amount, 0)
  const totalPartial = fees.filter(f => f.status === "Partial").reduce((sum, f) => sum + f.amount, 0)
  const totalStudents = fees.length

  const handleStatusChange = (id: number, newStatus: string) => {
    setFees(prev => prev.map(f => (f.id === id ? { ...f, status: newStatus } : f)))
    toast.success("Status updated")
  }

  const exportToCSV = () => {
    const csv = ["Student,Grade,Amount,Status"]
    filteredFees.forEach(fee => {
      csv.push(`${fee.student},${fee.grade},${fee.amount},${fee.status}`)
    })
    const blob = new Blob([csv.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "fee-records.csv"
    a.click()
  }

  const handleAddFee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student || !form.grade || !form.amount) {
      toast.error("Please fill all fields")
      return
    }
    setFees(prev => [
      ...prev,
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        student: form.student,
        grade: form.grade,
        amount: Number(form.amount),
        status: form.status,
      },
    ])
    setForm({ student: "", grade: "", amount: "", status: "Paid" })
    setAdding(false)
    toast.success("Record added")
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Fee Management</h1>
          <p className="text-muted-foreground text-sm">Track and analyze School Fees and Payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </Button>
          <Button size="sm" onClick={() => setAdding(v => !v)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>{adding ? "Cancel" : "Add"}</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 shadow-none border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Total Students</p>
              <p className="text-lg font-medium">{totalStudents}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-3 shadow-none border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-medium">₹{totalCollected.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-3 shadow-none border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-medium">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded-full">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="p-3 shadow-none border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Partial</p>
              <p className="text-lg font-medium">₹{totalPartial.toLocaleString()}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 p-2 rounded-full">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Add Form */}
      {adding && (
        <Card className="p-4 shadow-none border">
          <form onSubmit={handleAddFee} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="student" className="text-xs">Student</Label>
                <Input
                  id="student"
                  name="student"
                  placeholder="Full name"
                  value={form.student}
                  onChange={(e) => setForm({...form, student: e.target.value})}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-xs">Grade</Label>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="e.g. 5th"
                  value={form.grade}
                  onChange={(e) => setForm({...form, grade: e.target.value})}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-xs">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="₹0.00"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-xs">Status</Label>
                <Select 
                  value={form.status} 
                  onValueChange={(value) => setForm({...form, status: value})}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm">Add Record</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Main Table Card */}
      <Card className="shadow-none border">
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
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
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
              {filteredFees.map((fee) => (
                <TableRow key={fee.id} className="hover:bg-muted/50">
                  <TableCell className="p-3 font-medium text-sm">{fee.student}</TableCell>
                  <TableCell className="p-3 text-sm">{fee.grade}</TableCell>
                  <TableCell className="p-3 text-sm">₹{fee.amount.toLocaleString()}</TableCell>
                  <TableCell className="p-3">
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${statusVariants[fee.status as keyof typeof statusVariants]}`}>
                      {statusIcons[fee.status as keyof typeof statusIcons]}
                      {fee.status}
                    </div>
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    <Select
                      value={fee.status}
                      onValueChange={(value) => handleStatusChange(fee.id, value)}
                    >
                      <SelectTrigger className="h-8 w-[110px] text-xs">
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
              ))}
            </TableBody>
          </Table>
          
          {filteredFees.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No records found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}