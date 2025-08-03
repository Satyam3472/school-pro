import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DollarSign, FileText } from "lucide-react"

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

interface FeeRecordsTableProps {
  fees: MonthlyFee[]
  students: Student[]
  getMonthName: (month: number) => string
  handleInvoice: (fee: MonthlyFee) => void
}

export default function FeeRecordsTable({
  fees,
  students,
  getMonthName,
  handleInvoice
}: FeeRecordsTableProps) {
  return (
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
              {fees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No fee records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => (
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
          {fees.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No fee records found</p>
              </div>
            </div>
          ) : (
            fees.map((fee) => (
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
  )
} 