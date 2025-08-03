import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Lightbulb } from "lucide-react"

interface Student {
  id: number
  studentName: string
  fatherName?: string
  admission?: {
    classEnrolled: string
    section: string
    admissionDate: string
    academicYear: string
    transportType?: string
  }
}

interface AddFeeModalProps {
  isOpen: boolean
  onClose: () => void
  students: Student[]
  newFee: {
    studentId: string
    amount: string
    month: string
    year: string
    transactionTypes: string[]
    dueDate: string
    remarks: string
  }
  setNewFee: (fee: any) => void
  handleAddFee: (e: React.FormEvent<HTMLFormElement>) => void
  isAddingFee: boolean
  getMonthName: (month: number) => string
  getTransactionTypeName: (type: string) => string
  autoFillForm: (studentId: string, month: string, year: string) => void
  calculateAmount: (studentId: string, transactionTypes: string[]) => number
}

export default function AddFeeModal({
  isOpen,
  onClose,
  students,
  newFee,
  setNewFee,
  handleAddFee,
  isAddingFee,
  getMonthName,
  getTransactionTypeName,
  autoFillForm,
  calculateAmount
}: AddFeeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl px-8 py-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <Plus className="h-5 w-5 text-primary" />
            Add New Fee Record
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddFee} className="space-y-6" noValidate>
          {/* Auto-fill Helper Text */}
          <div className="text-sm text-blue-700 bg-blue-50/50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Select a student, month, and year to automatically fill amount, due date, and transaction types.</span>
            </div>
            {newFee.studentId && newFee.month && newFee.year && newFee.amount && (
              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                ✓ Form auto-filled with default values (Amount: ₹{newFee.amount})
              </div>
            )}
            {newFee.studentId && newFee.month && newFee.year && !newFee.amount && (
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                ⚠️ Auto-fill triggered but amount not set. Please check student data.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

            <div className="md:col-span-2">
              <Label htmlFor="student" className="text-gray-700 mb-1">Student</Label>
              <Select
                value={newFee.studentId}
                onValueChange={(value) => {
                  setNewFee({ ...newFee, studentId: value })
                  if (newFee.month && newFee.year) {
                    autoFillForm(value, newFee.month, newFee.year)
                  }
                }}
              >
                <SelectTrigger id="student" className="w-full">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.studentName} - {student.admission?.classEnrolled}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month" className="text-gray-700 mb-1">Month</Label>
              <Select
                value={newFee.month}
                onValueChange={(value) => {
                  setNewFee({ ...newFee, month: value })
                  if (newFee.studentId && newFee.year) {
                    autoFillForm(newFee.studentId, value, newFee.year)
                  }
                }}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {getMonthName(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year" className="text-gray-700 mb-1">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="Year"
                value={newFee.year}
                onChange={(e) => {
                  setNewFee({ ...newFee, year: e.target.value })
                  if (newFee.studentId && newFee.month) {
                    autoFillForm(newFee.studentId, newFee.month, e.target.value)
                  }
                }}
                required
                min="2020"
                max="2030"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-gray-700 mb-1">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                required
                min="0"
                step="0.01"
                className="w-full"
                readOnly={newFee.studentId && newFee.month && newFee.year ? true : false}
              />
              {newFee.studentId && newFee.month && newFee.year && (
                <p className="text-xs text-blue-600 mt-1">
                  Auto-filled based on student's class
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-gray-700 mb-1">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newFee.dueDate}
                onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div className="md:col-span-6 md:row-s">
              <Label className="text-gray-700 mb-1">Transaction Types</Label>
              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3">
                  {[
                    { value: "TUITION_FEE", label: "Tuition Fee" },
                    { value: "ADMISSION_FEE", label: "Admission Fee" },
                    { value: "TRANSPORT_FEE", label: "Transport Fee" },
                    { value: "EXAM_FEE", label: "Exam Fee" },
                    { value: "OTHER", label: "Other" },
                  ].map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type.value}
                        checked={newFee.transactionTypes.includes(type.value)}
                        onChange={(e) => {
                          let updatedTransactionTypes: string[]
                          if (e.target.checked) {
                            updatedTransactionTypes = [...newFee.transactionTypes, type.value]
                          } else {
                            updatedTransactionTypes = newFee.transactionTypes.filter((t) => t !== type.value)
                          }
                          
                                                     const calculatedAmount = calculateAmount(newFee.studentId, updatedTransactionTypes)
                           setNewFee({
                             ...newFee,
                             transactionTypes: updatedTransactionTypes,
                             amount: calculatedAmount > 0 ? calculatedAmount.toString() : ""
                           })
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={type.value}
                        className="text-sm font-medium leading-none text-gray-700"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-6">
              <Label htmlFor="remarks" className="text-gray-700 mb-1">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Enter any additional remarks..."
                value={newFee.remarks}
                onChange={(e) => setNewFee({ ...newFee, remarks: e.target.value })}
                rows={1}
                className="min-h-[40px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isAddingFee}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="px-6 gap-2 bg-primary hover:bg-primary/90"
              disabled={isAddingFee}
            >
              {isAddingFee ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Fee Record
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}