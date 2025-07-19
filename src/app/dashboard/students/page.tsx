
"use client"

import React, { useState, useMemo } from "react"
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
import { Plus, Pencil, Trash, ChevronDown, ChevronUp, FileDown } from "lucide-react"

const initialStudents = [
  { id: 1, name: "Aryan Mehta", grade: "5", section: "A", roll: "501", status: "Active" },
  { id: 2, name: "Priya Sharma", grade: "6", section: "B", roll: "602", status: "Active" },
  { id: 3, name: "Rohan Das", grade: "5", section: "C", roll: "503", status: "Inactive" },
  { id: 4, name: "Neha Verma", grade: "7", section: "A", roll: "701", status: "Active" },
  { id: 5, name: "Kunal Singh", grade: "6", section: "C", roll: "604", status: "Active" },
  { id: 6, name: "Sara Khan", grade: "8", section: "B", roll: "802", status: "Inactive" },
]

function exportToCSV(data: any[], filename = "students.csv") {
  const csvRows = [
    ["Roll No", "Name", "Grade", "Section", "Status"],
    ...data.map((s) => [s.roll, s.name, s.grade, s.section, s.status]),
  ]
    .map((row) => row.join(","))
    .join("\n")

  const blob = new Blob([csvRows], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AllStudents() {
  const [students, setStudents] = useState(initialStudents)
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStudent, setEditStudent] = useState(null)

  const itemsPerPage = 5

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const aField = a[sortField]?.toString().toLowerCase()
      const bField = b[sortField]?.toString().toLowerCase()
      return sortAsc ? aField.localeCompare(bField) : bField.localeCompare(aField)
    })
  }, [students, sortField, sortAsc])

  const filtered = sortedStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const pageCount = Math.ceil(filtered.length / itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const openModal = (student = null) => {
    setEditStudent(student)
    setModalOpen(true)
  }

  const saveStudent = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const newStudent = {
      id: editStudent ? editStudent.id : Date.now(),
      name: form.name.value,
      grade: form.grade.value,
      section: form.section.value,
      roll: form.roll.value,
      status: form.status.value,
    }
    setStudents((prev) => {
      if (editStudent) {
        return prev.map((s) => (s.id === editStudent.id ? newStudent : s))
      } else {
        return [...prev, newStudent]
      }
    })
    setModalOpen(false)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">All Students</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search students..."
            className="w-full md:w-[250px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" onClick={() => exportToCSV(filtered)}>
            <FileDown className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow overflow-x-auto">
      <Table>
  <TableHeader>
    <TableRow className="bg-muted/40">
      {["roll", "name", "grade", "section", "status"].map((field) => (
        <TableHead
          key={field}
          onClick={() => handleSort(field)}
          className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
        >
          <div className="flex items-center">
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortField === field &&
              (sortAsc ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              ))}
          </div>
        </TableHead>
      ))}
      <TableHead className="px-4 py-2 text-right text-sm font-semibold text-muted-foreground">
        Actions
      </TableHead>
    </TableRow>
  </TableHeader>

  <TableBody>
    {paginated.map((student) => (
      <TableRow
        key={student.id}
        className="hover:bg-muted transition-colors duration-200"
      >
        <TableCell className="px-4 py-3">{student.roll}</TableCell>
        <TableCell className="px-4 py-3">{student.name}</TableCell>
        <TableCell className="px-4 py-3">{student.grade}</TableCell>
        <TableCell className="px-4 py-3">{student.section}</TableCell>
        <TableCell className="px-4 py-3">
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              student.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {student.status}
          </span>
        </TableCell>
        <TableCell className="px-4 py-3 text-right space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => openModal(student)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="destructive">
            <Trash className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
    {paginated.length === 0 && (
      <TableRow>
        <TableCell
          colSpan={6}
          className="px-4 py-4 text-center text-muted-foreground"
        >
          No students found.
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>

      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Page {currentPage} of {pageCount}
        </span>
        <div className="space-x-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Prev
          </Button>
          <Button variant="outline" disabled={currentPage === pageCount} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editStudent ? "Edit Student" : "Add Student"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveStudent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input name="name" defaultValue={editStudent?.name || ""} required />
              </div>
              <div>
                <Label>Roll No.</Label>
                <Input name="roll" defaultValue={editStudent?.roll || ""} required />
              </div>
              <div>
                <Label>Grade</Label>
                <Input name="grade" defaultValue={editStudent?.grade || ""} required />
              </div>
              <div>
                <Label>Section</Label>
                <Input name="section" defaultValue={editStudent?.section || ""} required />
              </div>
              <div className="col-span-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={editStudent?.status || "Active"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
