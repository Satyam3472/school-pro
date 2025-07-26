
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
import { Plus, Pencil, Trash, ChevronDown, ChevronUp, FileDown, User } from "lucide-react"
import { useDashboardNav } from "../layout"
import { useRouter } from "next/navigation"

function exportToCSV(data: any[], filename = "students.csv") {
  const csvRows = [
    ["Roll No", "Name", "Father's Name", "Gender", "Grade", "Section", "Address", "Status"],
    ...data.map((s) => [
      s.roll, 
      s.name, 
      s.fatherName || "-", 
      s.gender || "-", 
      s.grade, 
      s.section, 
      s.address || "-", 
      s.status
    ]),
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

export default function AllStudents() {
  const [students, setStudents] = useState<StudentTableRow[]>([])
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<StudentTableRow | null>(null)

  const router = useRouter();
  const { setBreadcrumb, setPageTitle } = useDashboardNav();

  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Students" },
    ]);
    setPageTitle("Students");
  }, [setBreadcrumb, setPageTitle]);

  // Fetch students from API on mount
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students");
        const result = await res.json();
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
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    }
    fetchStudents();
  }, []);

  const itemsPerPage = 5

  const sortedStudents = useMemo<StudentTableRow[]>(() => {
    return [...students].sort((a, b) => {
      const aField = a[sortField as keyof StudentTableRow]?.toString().toLowerCase() || '';
      const bField = b[sortField as keyof StudentTableRow]?.toString().toLowerCase() || '';
      return sortAsc ? aField.localeCompare(bField) : bField.localeCompare(aField);
    });
  }, [students, sortField, sortAsc]);

  const filtered: StudentTableRow[] = sortedStudents.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.fatherName.toLowerCase().includes(search.toLowerCase())
  );

  const paginated: StudentTableRow[] = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pageCount = Math.ceil(filtered.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const openModal = (student: StudentTableRow | null = null) => {
    setEditStudent(student)
    setModalOpen(true)
  }

  const saveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    
    if (!editStudent) {
      console.error("No student selected for editing");
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
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with the updated student data
        setStudents((prev) => {
          return prev.map((s) => {
            if (s.id === editStudent.id) {
              return {
                ...s,
                name: formData.studentName,
                fatherName: formData.fatherName,
                gender: formData.gender,
                address: formData.address,
              };
            }
            return s;
          });
        });
        setModalOpen(false);
        setEditStudent(null);
      } else {
        console.error("Failed to update student:", result.error);
        alert("Failed to update student. Please try again.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      alert("An error occurred while updating the student. Please try again.");
    }
  }

  const handleNewAdmission = () => {
    router.push("/dashboard/admissions");
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">All Students</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Search students or parents..."
            className="w-full md:w-[250px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" onClick={() => exportToCSV(filtered)}>
            <FileDown className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={handleNewAdmission} className="gap-2">
            <Plus className="w-4 h-4" /> New Admission
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                Photo
              </TableHead>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <div className="flex items-center">
                  Student Name
                  {sortField === "name" &&
                    (sortAsc ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("fatherName")}
                className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <div className="flex items-center">
                  Father's Name
                  {sortField === "fatherName" &&
                    (sortAsc ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("gender")}
                className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <div className="flex items-center">
                  Gender
                  {sortField === "gender" &&
                    (sortAsc ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("grade")}
                className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <div className="flex items-center">
                  Grade
                  {sortField === "grade" &&
                    (sortAsc ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("section")}
                className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <div className="flex items-center">
                  Section
                  {sortField === "section" &&
                    (sortAsc ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="px-4 py-2 text-sm font-semibold text-muted-foreground">
                Address
              </TableHead>
              <TableHead
                onClick={() => handleSort("status")}
                className="cursor-pointer select-none px-4 py-2 text-sm font-semibold text-muted-foreground"
              >
                <div className="flex items-center">
                  Status
                  {sortField === "status" &&
                    (sortAsc ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="px-4 py-2 text-right text-sm font-semibold text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.map((student: StudentTableRow) => (
              <TableRow
                key={student.id}
                className="hover:bg-muted transition-colors duration-200"
              >
                <TableCell className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    {student.studentPhotoBase64 ? (
                      <img
                        src={student.studentPhotoBase64}
                        alt={`${student.name}'s photo`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 font-medium">{student.name}</TableCell>
                <TableCell className="px-4 py-3 text-sm">{student.fatherName}</TableCell>
                <TableCell className="px-4 py-3">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    student.gender === "Male" 
                      ? "bg-blue-100 text-blue-700" 
                      : student.gender === "Female"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {student.gender}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">{student.grade}</TableCell>
                <TableCell className="px-4 py-3">{student.section}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-700 truncate" title={student.address}>
                      {student.address}
                    </p>
                  </div>
                </TableCell>
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
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editStudent ? "Edit Student" : "Add Student"}</DialogTitle>
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
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
