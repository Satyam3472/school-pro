import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

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

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedMonth: MonthlyFee | null
  isProcessingPayment: boolean
  processPayment: (e: React.FormEvent) => void
  getMonthName: (month: number) => string
}

export default function PaymentModal({
  isOpen,
  onClose,
  selectedMonth,
  isProcessingPayment,
  processPayment,
  getMonthName
}: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] md:w-auto max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
            <CheckCircle className="h-5 w-5" />
            Mark Payment
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={processPayment} className="space-y-4">
          <div>
            <Label>Month</Label>
            <p className="text-sm text-muted-foreground">
              {selectedMonth ? `${getMonthName(selectedMonth.month)} ${selectedMonth.year}` : ""}
            </p>
          </div>
          <div>
            <Label>Amount</Label>
            <p className="text-sm text-muted-foreground">
              ₹{selectedMonth?.totalAmount}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isProcessingPayment}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2" disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 