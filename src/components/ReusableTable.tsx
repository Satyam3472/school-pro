"use client"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

type TableProps = {
  data: any[]
  type: "expense" | "fee"
}

export default function ReusableTable({ data, type }: TableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {type === "fee" && <TableHead>Student</TableHead>}
          {type === "expense" && <TableHead>Title</TableHead>}
          <TableHead>Amount</TableHead>
          {type === "fee" && <TableHead>Status</TableHead>}
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, i) => (
          <TableRow key={i}>
            {type === "fee" && <TableCell>{item.student?.studentName || "-"}</TableCell>}
            {type === "expense" && <TableCell>{item.title}</TableCell>}
            <TableCell>₹{item.amount}</TableCell>
            {type === "fee" && <TableCell>{item.status}</TableCell>}
            <TableCell>{formatDate(item.dueDate || item.expenseDate)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toISOString().split("T")[0]
}
