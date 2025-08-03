export interface Student {
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

export interface Fee {
  id: number
  studentId: number
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PAID' | 'PENDING' | 'PARTIALLY_PAID'
  remarks?: string
  student?: Student
}

export interface MonthlyFee {
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

export interface FeeDetails {
  student: Student
  monthlyFees: MonthlyFee[]
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  pendingMonths: number
}

export interface NewFee {
  studentId: string
  amount: string
  month: string
  year: string
  transactionTypes: string[]
  dueDate: string
  remarks: string
} 