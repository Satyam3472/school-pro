import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Calendar, DollarSign, CheckCircle, FileText } from "lucide-react"

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

interface FeeDetails {
  student: Student
  monthlyFees: MonthlyFee[]
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  pendingMonths: number
}

interface FeeDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  feeDetails: FeeDetails | null
  selectedStudent: Student | null
  getMonthName: (month: number) => string
  handlePayment: (monthlyFee: MonthlyFee) => void
  handleInvoice: (fee: MonthlyFee) => void
}

export default function FeeDetailsModal({
  isOpen,
  onClose,
  feeDetails,
  selectedStudent,
  getMonthName,
  handlePayment,
  handleInvoice
}: FeeDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-[100vw] md:w-auto">
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
                            {fee.status !== 'PAID' ? (
                              <Button
                                size="sm"
                                onClick={() => handlePayment(fee)}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                Mark Paid
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInvoice(fee)}
                                className="flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                Invoice
                              </Button>
                            )}
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
                        {fee.status !== 'PAID' ? (
                          <Button
                            size="sm"
                            onClick={() => handlePayment(fee)}
                            className="flex items-center gap-1 w-full"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark Paid
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInvoice(fee)}
                            className="flex items-center gap-1 w-full"
                          >
                            <FileText className="h-3 w-3" />
                            View Invoice
                          </Button>
                        )}
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
  )
} 