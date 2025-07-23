"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type BaseFormProps = {
  type: "expense" | "fee"
  onSubmit: (form: any) => void
  students?: { id: number; studentName: string }[]
}

export default function ReusableForm({ type, onSubmit, students = [] }: BaseFormProps) {
  const [form, setForm] = useState<any>({
    studentId: "",
    category: "",
    title: "",
    amount: "",
    status: "Paid",
    expenseDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {type === "fee" && (
        <div>
          <Label>Student</Label>
          <Select
            value={form.studentId}
            onValueChange={(v) => setForm({ ...form, studentId: v })}
          >
            <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
            <SelectContent>
              {students.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>{s.studentName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === "expense" && (
        <>
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
        </>
      )}

      <div>
        <Label>Amount</Label>
        <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
      </div>

      {type === "fee" && (
        <>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Due Date</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </>
      )}

      {type === "expense" && (
        <div>
          <Label>Date</Label>
          <Input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
        </div>
      )}

      <div className="col-span-full">
        <Button type="submit">{type === "fee" ? "Add Fee" : "Add Expense"}</Button>
      </div>
    </form>
  )
}
