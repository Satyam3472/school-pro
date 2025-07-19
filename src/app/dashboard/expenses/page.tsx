"use client"

import React, { useState, useEffect } from "react"
import { Download, Plus, CheckCircle2, XCircle, AlertCircle, Search, Upload } from "lucide-react"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardNav } from "../layout";

const initialExpenses = [
  { id: 1, category: "Utilities", description: "Electricity Bill", amount: 3500, status: "Paid", date: "2023-05-15" },
  { id: 2, category: "Supplies", description: "Stationery", amount: 1200, status: "Unpaid", date: "2023-05-18" },
  { id: 3, category: "Maintenance", description: "Plumbing Repair", amount: 2200, status: "Partial", date: "2023-05-20" },
]

const statusConfig = {
  Paid: {
    class: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Paid"
  },
  Unpaid: {
    class: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    icon: <XCircle className="w-4 h-4" />,
    label: "Unpaid"
  },
  Partial: {
    class: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Partial"
  }
}

const categoryColors = {
  Utilities: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Supplies: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Salaries: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
}

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ 
    category: "", 
    description: "", 
    amount: "", 
    status: "Paid",
    date: new Date().toISOString().split('T')[0]
  })
  const [adding, setAdding] = useState(false)
  const { setBreadcrumb, setPageTitle } = useDashboardNav();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Expenses" },
    ]);
    setPageTitle("Expenses");
  }, [setBreadcrumb, setPageTitle]);

  // Filter logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesStatus = filter === "All" || exp.status === filter
    const matchesSearch = 
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Summary calculations
  const totalPaid = expenses.filter(e => e.status === "Paid").reduce((sum, e) => sum + e.amount, 0)
  const totalUnpaid = expenses.filter(e => e.status === "Unpaid").reduce((sum, e) => sum + e.amount, 0)
  const totalPartial = expenses.filter(e => e.status === "Partial").reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const handleStatusChange = (id: number, newStatus: string) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, status: newStatus } : e)))
    toast.success("Status updated successfully")
  }

  const exportToCSV = () => {
    const headers = ["Category", "Description", "Amount", "Status", "Date"]
    const csv = [
      headers.join(","),
      ...filteredExpenses.map(exp => 
        [exp.category, exp.description, exp.amount, exp.status, exp.date].join(",")
      )
    ].join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category || !form.description || !form.amount) {
      toast.error("Please fill all required fields")
      return
    }
    
    const newExpense = {
      id: expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
      category: form.category,
      description: form.description,
      amount: Number(form.amount),
      status: form.status,
      date: form.date
    }
    
    setExpenses(prev => [...prev, newExpense])
    setForm({ 
      category: "", 
      description: "", 
      amount: "", 
      status: "Paid",
      date: new Date().toISOString().split('T')[0]
    })
    setAdding(false)
    toast.success("Expense added successfully")
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Expense Management</h1>
            <p className="text-muted-foreground text-sm">Track and analyze school expenditures</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Upload className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setAdding(!adding)} className="gap-2">
              <Plus className="w-4 h-4" />
              {adding ? "Cancel" : "Add Expense"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-semibold">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {Object.entries(statusConfig).map(([status, config]) => {
          const total = expenses.filter(e => e.status === status).reduce((sum, e) => sum + e.amount, 0)
          return (
            <Card key={status} className="shadow-sm border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-lg font-semibold">₹{total.toLocaleString()}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${statusConfig[status as keyof typeof statusConfig].class.split(' ')[0]}`}>
                    {config.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Expense Form */}
      {adding && (
        <Card className="shadow-sm border">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">Add New Expense</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={form.category}
                    onValueChange={(value) => setForm({...form, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Salaries">Salaries</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Brief description"
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={form.status}
                    onValueChange={(value) => setForm({...form, status: value})}
                  >
                    <SelectTrigger>
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
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Expense Records */}
      <Card className="shadow-sm border">
        <CardHeader className="p-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="text-lg">Expense Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-9 w-full sm:w-[240px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[140px]">Date</TableHead>
                <TableHead className="w-[160px]">Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Amount</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[140px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <TableRow key={exp.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{exp.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryColors[exp.category as keyof typeof categoryColors] || categoryColors.Other}`}>
                        {exp.category}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate">{exp.description}</TableCell>
                    <TableCell className="font-medium">₹{exp.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[exp.status as keyof typeof statusConfig].class}`}>
                        {statusConfig[exp.status as keyof typeof statusConfig].icon}
                        {exp.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={exp.status}
                        onValueChange={(value) => handleStatusChange(exp.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
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
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No expenses found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}