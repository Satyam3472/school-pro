import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { User, Search, Calendar } from "lucide-react"

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

interface StudentFeeTableProps {
  students: Student[]
  filteredStudents: Student[]
  searchTerm: string
  filterClass: string
  filterStatus: string
  setSearchTerm: (term: string) => void
  setFilterClass: (cls: string) => void
  setFilterStatus: (status: string) => void
  getPendingFeesCount: (student: Student) => number
  handleStudentClick: (student: Student) => void
}

export default function StudentFeeTable({
  students,
  filteredStudents,
  searchTerm,
  filterClass,
  filterStatus,
  setSearchTerm,
  setFilterClass,
  setFilterStatus,
  getPendingFeesCount,
  handleStudentClick
}: StudentFeeTableProps) {
  return (
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
                placeholder="Search name or father's name..."
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
  )
} 